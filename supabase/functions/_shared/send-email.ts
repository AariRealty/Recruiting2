import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type Lane = "internal" | "attraction";

interface SendEmailOptions {
  lane: Lane;
  to: string;
  subject: string;
  html: string;
  emailType?: string;
  toUserId?: string;
  relatedFileId?: string;
  template?: string;
  payload?: Record<string, unknown>;
  replyTo?: string;
  attachments?: Array<{ filename: string; content: string }>;
}

interface SendResult {
  ok: boolean;
  logId?: string;
  resendId?: string;
  err?: string;
}

export async function sendEmail(opts: SendEmailOptions): Promise<SendResult> {
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const configKey = `send_lane_${opts.lane}_from`;
  const { data: cfg } = await admin
    .from("realty_config")
    .select("value")
    .eq("key", configKey)
    .single();

  const fromAddress = cfg?.value;
  if (!fromAddress) {
    return { ok: false, err: `no from address for lane '${opts.lane}'` };
  }

  const { data: logRow, error: insertErr } = await admin
    .from("email_log")
    .insert({
      lane: opts.lane,
      from_address: fromAddress,
      email_type: opts.emailType ?? null,
      to_address: opts.to,
      to_user_id: opts.toUserId ?? null,
      related_file_id: opts.relatedFileId ?? null,
      subject: opts.subject,
      template: opts.template ?? null,
      payload: opts.payload ?? {},
      status: "queued",
    })
    .select("id")
    .single();

  if (insertErr) {
    return { ok: false, err: `email_log insert: ${insertErr.message}` };
  }

  const logId = logRow.id;

  const resendKey =
    Deno.env.get("REALTY_RESEND_API_KEY") || Deno.env.get("RESEND_API_KEY");
  if (!resendKey) {
    await admin
      .from("email_log")
      .update({ status: "failed", error_message: "no resend api key" })
      .eq("id", logId);
    return { ok: false, err: "no resend api key" };
  }

  try {
    const body: Record<string, unknown> = {
      from: fromAddress,
      to: [opts.to],
      subject: opts.subject,
      html: opts.html,
    };
    if (opts.replyTo) body.reply_to = opts.replyTo;
    if (opts.attachments?.length) body.attachments = opts.attachments;

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!r.ok) {
      const errText = (await r.text()).slice(0, 200);
      await admin
        .from("email_log")
        .update({ status: "failed", error_message: errText })
        .eq("id", logId);
      return { ok: false, err: errText, logId };
    }

    const result = await r.json();
    await admin
      .from("email_log")
      .update({
        status: "sent",
        resend_id: result.id ?? null,
        sent_at: new Date().toISOString(),
      })
      .eq("id", logId);

    return { ok: true, logId, resendId: result.id };
  } catch (e) {
    const errMsg = String(e).slice(0, 160);
    await admin
      .from("email_log")
      .update({ status: "failed", error_message: errMsg })
      .eq("id", logId);
    return { ok: false, err: errMsg, logId };
  }
}

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, svix-id, svix-timestamp, svix-signature",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json" }, 400);
  }

  const type = body.type as string | undefined;
  const data = body.data as Record<string, unknown> | undefined;
  const emailId = data?.email_id as string | undefined;

  if (!emailId || !type) {
    return json({ error: "missing type or email_id" }, 400);
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const now = new Date().toISOString();
  let update: Record<string, unknown> = {};

  switch (type) {
    case "email.delivered":
      update = { status: "delivered", delivered_at: now };
      break;

    case "email.bounced": {
      const bounce = data?.bounce as Record<string, unknown> | undefined;
      update = {
        status: "bounced",
        bounced_at: now,
        bounce_type: bounce?.type === "hard" ? "hard" : "soft",
        error_message: ((bounce?.message as string) ?? "").slice(0, 500) || null,
      };
      break;
    }

    case "email.complained":
      update = { status: "complained", complained_at: now };
      break;

    case "email.opened":
      update = { opened_at: now };
      break;

    case "email.delivery_delayed":
      update = { status: "deferred" };
      break;

    default:
      return json({ ok: true, skipped: type });
  }

  const { error } = await admin
    .from("email_log")
    .update(update)
    .eq("resend_id", emailId);

  if (error) {
    console.error(`email_log update failed for resend_id=${emailId}:`, error.message);
    return json({ ok: false, error: error.message }, 500);
  }

  return json({ ok: true, type, resend_id: emailId });
});

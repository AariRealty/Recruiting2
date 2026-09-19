import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { sendEmail } from "../_shared/send-email.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" } });
  }

  try {
    const body = await req.json();
    const { lane, to, subject, html, emailType, toUserId, relatedFileId, template, payload, replyTo, cc, attachments } = body;

    if (!lane || !to || !subject || !html) {
      return new Response(JSON.stringify({ error: "lane, to, subject, and html are required" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    if (lane !== "internal" && lane !== "attraction") {
      return new Response(JSON.stringify({ error: "lane must be 'internal' or 'attraction'" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }

    const result = await sendEmail({ lane, to, subject, html, emailType, toUserId, relatedFileId, template, payload, replyTo, cc, attachments });

    const status = result.ok ? 200 : 502;
    return new Response(JSON.stringify(result), { status, headers: { "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, err: String(e).slice(0, 200) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});

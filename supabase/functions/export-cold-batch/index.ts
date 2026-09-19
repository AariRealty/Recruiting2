import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  const {
    data: { user },
    error: authErr,
  } = await admin.auth.getUser(token);
  if (authErr || !user) {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await req.json();
    const { send_batch } = body;
    if (!send_batch || typeof send_batch !== "string") {
      return json({ error: "send_batch is required" }, 400);
    }

    const batchName = send_batch.trim();

    // --- Section 7.4: Pre-send gate ---

    const { data: cfgRows } = await admin
      .from("realty_config")
      .select("key, value")
      .in("key", [
        "send_lane_cold_domain",
        "resend_domain_verified",
        "cold_warmup_started_at",
        "cold_stop",
        "referrals_terms_published",
      ]);

    const cfg: Record<string, string> = {};
    for (const r of cfgRows ?? []) cfg[r.key] = r.value;

    // 1. send_lane_cold_domain is set and DNS verified
    if (!cfg.send_lane_cold_domain) {
      return json({ error: "gate_failed", condition: "send_lane_cold_domain is not set" }, 422);
    }
    if (cfg.resend_domain_verified !== "true") {
      return json({ error: "gate_failed", condition: "Cold domain DNS is not verified" }, 422);
    }

    // 2. cold_warmup_started_at is at least 21 days ago
    if (!cfg.cold_warmup_started_at) {
      return json({ error: "gate_failed", condition: "cold_warmup_started_at is not set" }, 422);
    }
    const warmupStart = new Date(cfg.cold_warmup_started_at);
    const daysSinceWarmup =
      (Date.now() - warmupStart.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceWarmup < 21) {
      return json(
        {
          error: "gate_failed",
          condition: `Warmup started ${Math.floor(daysSinceWarmup)} days ago; need at least 21`,
        },
        422,
      );
    }

    // 4. No lane and no batch is currently in stop
    if (cfg.cold_stop === "true") {
      return json({ error: "gate_failed", condition: "Cold lane is in stop" }, 422);
    }

    const { data: batchStopRow } = await admin
      .from("realty_config")
      .select("value")
      .eq("key", `batch_stop_${batchName}`)
      .maybeSingle();
    if (batchStopRow?.value === "true") {
      return json(
        { error: "gate_failed", condition: `Batch '${batchName}' is in stop` },
        422,
      );
    }

    // 5. The attached campaign is approved or live
    const { data: campaigns } = await admin
      .from("realty_campaigns")
      .select("id, status")
      .eq("track", batchName)
      .in("status", ["approved", "live"]);
    if (!campaigns || campaigns.length === 0) {
      return json(
        {
          error: "gate_failed",
          condition: `No approved or live campaign for track '${batchName}'`,
        },
        422,
      );
    }

    // 6. If the batch is Referrals track, referrals_terms_published must be true
    if (batchName.toLowerCase() === "referrals") {
      if (cfg.referrals_terms_published !== "true") {
        return json(
          {
            error: "gate_failed",
            condition: "referrals_terms_published is not true",
          },
          422,
        );
      }
    }

    // --- Section 7.2: Cross-lane suppression + fetch ---

    const { data: rows, error: qErr } = await admin.rpc("export_cold_batch", {
      p_batch: batchName,
    });

    if (qErr) {
      return json({ error: "query_failed", detail: qErr.message }, 500);
    }

    if (!rows || rows.length === 0) {
      return json({ error: "empty", message: "No eligible recruits in this batch" }, 404);
    }

    // 3. Every address in the batch has email_verified_at within 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const staleEmails: string[] = [];
    for (const r of rows) {
      if (!r.email_verified_at || new Date(r.email_verified_at) < thirtyDaysAgo) {
        staleEmails.push(r.email);
      }
    }
    if (staleEmails.length > 0) {
      return json(
        {
          error: "gate_failed",
          condition: `${staleEmails.length} address(es) have stale or missing verification`,
          examples: staleEmails.slice(0, 5),
        },
        422,
      );
    }

    // --- Section 7.3: CSV export ---

    const MONTHS = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
    ];

    const header =
      "email,first_name,last_name,company_name,phone_number,current_brokerage,city,board,years_licensed,renewal_month,track,send_batch";

    const csvRows = rows.map((r: Record<string, unknown>) => {
      const fullName = String(r.full_name || "");
      const parts = fullName.trim().split(/\s+/);
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";

      let renewalMonth = "";
      if (r.license_expires_at) {
        const d = new Date(String(r.license_expires_at));
        if (!isNaN(d.getTime())) renewalMonth = MONTHS[d.getMonth()];
      }

      return [
        csvEsc(r.email),
        csvEsc(firstName),
        csvEsc(lastName),
        csvEsc(r.current_brokerage),
        csvEsc(r.phone),
        csvEsc(r.current_brokerage),
        csvEsc(r.city),
        csvEsc(r.board),
        csvEsc(r.years_licensed),
        csvEsc(renewalMonth),
        csvEsc(r.track),
        csvEsc(r.send_batch),
      ].join(",");
    });

    const csv = header + "\n" + csvRows.join("\n") + "\n";

    // audit_log row
    await admin.from("audit_log").insert({
      actor_id: user.id,
      actor_type: "user",
      action: "export_cold_batch",
      target_table: "realty_recruits",
      details: {
        batch: batchName,
        row_count: rows.length,
        exported_at: new Date().toISOString(),
      },
    });

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="cold-batch-${batchName}-${dateStamp()}.csv"`,
      },
    });
  } catch (e) {
    return json({ error: String(e).slice(0, 200) }, 500);
  }
});

function csvEsc(v: unknown): string {
  const s = String(v == null ? "" : v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function dateStamp(): string {
  const d = new Date();
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

function json(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

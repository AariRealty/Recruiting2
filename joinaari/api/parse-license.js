module.exports = async function handler(req, res) {
  // Allow CORS
  const __allowedOrigins = ['https://joinaari.com', 'https://joinaari.vercel.app'];
  res.setHeader('Access-Control-Allow-Origin', __allowedOrigins.indexOf(req.headers.origin) !== -1 ? req.headers.origin : 'https://joinaari.com');
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(200).json({ full_name: null, license_number: null, error: "method_not_allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(200).json({
      full_name: null,
      license_number: null,
      error: "missing_api_key",
    });
  }

  try {
    const { image, media_type } = req.body || {};
    if (!image || !media_type) {
      return res.status(200).json({
        full_name: null,
        license_number: null,
        error: "missing_payload",
        detail: "image: " + (image ? "yes (" + image.length + " chars)" : "no") + ", media_type: " + (media_type || "none"),
      });
    }

    const apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: media_type,
                  data: image,
                },
              },
              {
                type: "text",
                text: 'Extract from this Florida real estate license: 1) the full name of the licensee, 2) the license number (starts with SL or BK). Reply with ONLY this JSON: {"full_name":"...","license_number":"..."}'
              },
            ],
          },
        ],
      }),
    });

    if (!apiResponse.ok) {
      let errDetail = "";
      try { errDetail = await apiResponse.text(); } catch(e) {}
      return res.status(200).json({
        full_name: null,
        license_number: null,
        error: "api_error",
        detail: "HTTP " + apiResponse.status + ": " + errDetail.substring(0, 200),
      });
    }

    const result = await apiResponse.json();
    const responseText =
      result.content && result.content[0] ? result.content[0].text.trim() : "";

    if (!responseText) {
      return res.status(200).json({
        full_name: null,
        license_number: null,
        error: "empty_response",
      });
    }

    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (e) {
      return res.status(200).json({
        full_name: null,
        license_number: null,
        error: "parse_error",
        raw: responseText.substring(0, 300),
      });
    }

    return res.status(200).json({
      full_name: parsed.full_name || null,
      license_number: parsed.license_number || null,
    });
  } catch (err) {
    return res.status(200).json({
      full_name: null,
      license_number: null,
      error: "server_error",
      detail: err.message,
    });
  }
};

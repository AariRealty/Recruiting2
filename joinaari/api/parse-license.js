module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
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
    const { image, media_type } = req.body;
    if (!image || !media_type) {
      return res.status(200).json({
        full_name: null,
        license_number: null,
        error: "missing_payload",
      });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 256,
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
                text: 'This is a Florida real estate license. Extract the following information and return ONLY a JSON object with no other text:\n{\n  "full_name": "the licensee full name exactly as printed",\n  "license_number": "the license number including the SL or BK prefix"\n}\n\nIf you cannot find a field, use null for its value. Return ONLY the JSON object.',
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic API error:", response.status, errText);
      return res.status(200).json({
        full_name: null,
        license_number: null,
        error: "api_error",
        detail: "Anthropic API returned " + response.status,
      });
    }

    const result = await response.json();
    const responseText =
      result.content && result.content[0] ? result.content[0].text.trim() : "";

    let parsed;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
    } catch (e) {
      return res.status(200).json({
        full_name: null,
        license_number: null,
        error: "parse_error",
        raw: responseText,
      });
    }

    return res.status(200).json({
      full_name: parsed.full_name || null,
      license_number: parsed.license_number || null,
    });
  } catch (err) {
    console.error("License parse error:", err);
    return res.status(200).json({
      full_name: null,
      license_number: null,
      error: "server_error",
      detail: err.message,
    });
  }
};

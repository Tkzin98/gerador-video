const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const {id, apiKey} = req.query || {};
    if (!id || !apiKey) return res.status(400).json({error:"Faltam parâmetros."});

    const r = await fetch(`https://api.replicate.com/v1/predictions/${encodeURIComponent(id)}`, {
      headers:{Authorization:`Bearer ${apiKey}`}
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({error:data.detail || data.error || "Erro ao consultar o Replicate."});
    return res.status(200).json(data);
  } catch(e) {
    return res.status(500).json({error:e.message || "Erro interno."});
  }
};
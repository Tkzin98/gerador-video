const fetch = require("node-fetch");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({error:"Método não permitido"});

  try {
    const {apiKey, prompt, model, aspect} = req.body || {};
    if (!apiKey || !prompt || !model) {
      return res.status(400).json({error:"Preencha chave, prompt e modelo."});
    }

    let input = {prompt};

    if (model === "minimax/video-01") {
      input = {prompt, prompt_optimizer:true};
      if (aspect) input.aspect_ratio = aspect;
    } else if (model === "fofr/kling-v1.6-standard") {
      input = {prompt, duration:5, aspect_ratio:aspect || "16:9"};
    } else if (model === "lucataco/cogvideox-5b") {
      input = {prompt};
    }

    const r = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method:"POST",
      headers:{
        "Authorization":`Bearer ${apiKey}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({input})
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json({error:data.detail || data.error || "Erro na API do Replicate."});
    return res.status(200).json(data);
  } catch(e) {
    return res.status(500).json({error:e.message || "Erro interno."});
  }
};
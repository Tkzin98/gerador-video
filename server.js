const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Criar predição
app.post('/gerar', async (req, res) => {
  const { apiKey, prompt, model } = req.body;

  try {
    let input = { prompt };
    if (model === 'minimax/video-01') {
      input = { prompt, prompt_optimizer: true };
    } else if (model === 'fofr/kling-v1.6-standard') {
      input = { prompt, duration: 5, aspect_ratio: '16:9' };
    }

    const response = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ input })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(400).json({ error: data.detail || 'Erro ao criar predição' });
    }
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Verificar status
app.get('/status/:id', async (req, res) => {
  const { apiKey } = req.query;
  try {
    const response = await fetch(`https://api.replicate.com/v1/predictions/${req.params.id}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));

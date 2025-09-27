const express = require('express');
const router = express.Router();
const openai = require('../config/openai');

// --- Rota para gerar um questionário com IA ---
// POST /api/ai/generate
router.post('/generate', async (req, res) => {
  try {
    const { topic, numQuestions = 5 } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'O tema é obrigatório.' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'A chave de API da OpenAI não está configurada no servidor.' });
    }

    const prompt = `
      Crie um questionário de múltipla escolha sobre o tema "${topic}".
      O questionário deve ter exatamente ${numQuestions} perguntas.
      Cada pergunta deve ter 4 opções de resposta, e apenas uma deve ser a correta.
      As perguntas devem ser variadas em dificuldade (fácil, média, difícil).

      Responda EXCLUSIVAMENTE com um objeto JSON válido, seguindo esta estrutura:
      {
        "questions": [
          {
            "text": "Texto da pergunta aqui",
            "timeLimit": 20,
            "options": [
              { "text": "Texto da opção 1", "isCorrect": false },
              { "text": "Texto da opção 2", "isCorrect": false },
              { "text": "Texto da opção 3", "isCorrect": true },
              { "text": "Texto da opção 4", "isCorrect": false }
            ]
          }
        ]
      }
      Não inclua nenhum texto ou explicação fora do objeto JSON.
    `;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo-1106', // Este modelo é bom a gerar JSON
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7, // Um pouco de criatividade
      response_format: { type: 'json_object' }, // Forçar a resposta em formato JSON
    });

    const generatedJson = JSON.parse(completion.choices[0].message.content);

    // Validação básica do JSON recebido
    if (!generatedJson.questions || !Array.isArray(generatedJson.questions)) {
      throw new Error('A resposta da IA não continha um array de perguntas válido.');
    }

    res.status(200).json(generatedJson);

  } catch (error) {
    console.error('Erro ao gerar perguntas com IA:', error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor ao comunicar com a IA.' });
  }
});

module.exports = router;
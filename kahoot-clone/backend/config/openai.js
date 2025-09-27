const OpenAI = require('openai');

// --- INSTRUÇÕES PARA O UTILIZADOR ---
// Para a geração de perguntas com IA, por favor, configure a sua chave de API
// da OpenAI como uma variável de ambiente no seu servidor (ex: no painel Plesk).
// A variável deve chamar-se: OPENAI_API_KEY

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

module.exports = openai;
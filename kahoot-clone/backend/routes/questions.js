const express = require('express');
const router = express.Router();
const { sequelize, Question, Option } = require('../models');

// --- Rota para adicionar uma nova Pergunta a um Jogo ---
// POST /api/questions
router.post('/', async (req, res) => {
  // Uma transação garante que ou tudo é executado com sucesso, ou nada é.
  // Isto impede que uma pergunta seja criada sem as suas opções, por exemplo.
  const t = await sequelize.transaction();

  try {
    const { text, timeLimit, order, gameId, options } = req.body;

    // Validação dos dados de entrada
    if (!text || !gameId || !options || !Array.isArray(options) || options.length < 2) {
      await t.rollback();
      return res.status(400).json({ error: 'Dados inválidos. A pergunta deve ter texto, gameId e pelo menos duas opções.' });
    }

    // 1. Criar a Pergunta
    const newQuestion = await Question.create({
      text,
      timeLimit,
      order,
      gameId
    }, { transaction: t });

    // 2. Preparar e criar as Opções
    // Adicionamos o questionId a cada opção antes de as criar
    const optionsToCreate = options.map(opt => ({
      ...opt,
      questionId: newQuestion.id
    }));

    await Option.bulkCreate(optionsToCreate, { transaction: t });

    // Se tudo correu bem, confirmamos a transação
    await t.commit();

    // Retornar a pergunta criada com as suas opções
    const result = await Question.findByPk(newQuestion.id, { include: [Option] });
    res.status(201).json(result);

  } catch (error) {
    // Se algo falhou, desfazemos todas as operações da transação
    await t.rollback();
    console.error('Erro ao criar a pergunta:', error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor ao criar a pergunta.' });
  }
});

module.exports = router;
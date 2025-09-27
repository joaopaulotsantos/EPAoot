const express = require('express');
const router = express.Router();
const { Game, Question, Option, User } = require('../models'); // Usamos o index.js da pasta models

// --- Rota para criar um novo Jogo (Game) ---
// POST /api/games
router.post('/', async (req, res) => {
  try {
    const { title, description, userId } = req.body;

    // Validação simples dos dados de entrada
    if (!title || !userId) {
      return res.status(400).json({ error: 'O título e o ID do utilizador são obrigatórios.' });
    }

    // Gerar um código de jogo único (ex: 123456)
    // Numa aplicação real, seria necessário garantir que o código é verdadeiramente único.
    const gameCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newGame = await Game.create({
      title,
      description,
      userId,
      gameCode
    });

    res.status(201).json(newGame);
  } catch (error) {
    console.error('Erro ao criar o jogo:', error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

// --- Rota para obter um Jogo específico com todas as suas perguntas e opções ---
// GET /api/games/:id
router.get('/:id', async (req, res) => {
  try {
    const gameId = req.params.id;
    const game = await Game.findByPk(gameId, {
      include: [
        {
          model: User, // Inclui os dados do criador do jogo
          attributes: ['id', 'username'] // Apenas os campos seguros
        },
        {
          model: Question,
          include: [{ model: Option }] // Inclui as opções para cada pergunta
        }
      ]
    });

    if (!game) {
      return res.status(404).json({ error: 'Jogo não encontrado.' });
    }

    res.status(200).json(game);
  } catch (error) {
    console.error('Erro ao obter o jogo:', error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});


// --- Rota para obter todos os jogos de um utilizador específico ---
// GET /api/games/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const games = await Game.findAll({
      where: { userId: userId },
      order: [['createdAt', 'DESC']] // Mostrar os mais recentes primeiro
    });
    res.status(200).json(games);
  } catch (error) {
    console.error('Erro ao obter os jogos do utilizador:', error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});

// --- Rota para validar um código de jogo e entrar numa partida ---
// POST /api/games/join
router.post('/join', async (req, res) => {
  try {
    const { gameCode } = req.body;

    if (!gameCode) {
      return res.status(400).json({ error: 'O código do jogo é obrigatório.' });
    }

    const game = await Game.findOne({
      where: { gameCode: gameCode },
      attributes: ['id', 'title'] // Só precisamos de devolver informação básica
    });

    if (!game) {
      return res.status(404).json({ error: 'Jogo não encontrado com este código.' });
    }

    // Numa aplicação real, aqui verificaríamos também se o jogo está "aberto"
    // para receber jogadores.

    res.status(200).json(game);
  } catch (error) {
    console.error('Erro ao tentar entrar no jogo:', error);
    res.status(500).json({ error: 'Ocorreu um erro no servidor.' });
  }
});


module.exports = router;
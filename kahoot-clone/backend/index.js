const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { syncDatabase, Game, Question, Option } = require('./models');

// Importar as rotas
const gameRoutes = require('./routes/games');
const questionRoutes = require('./routes/questions');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/api/games', gameRoutes);
app.use('/api/questions', questionRoutes);

app.get('/', (req, res) => {
  res.send('<h1>API do Kahoot Clone a funcionar!</h1>');
});

const gameStates = {};

// Função para avançar para a próxima fase do jogo (mostrar placar, próxima pergunta)
const advanceGame = (gameCode) => {
  const game = gameStates[gameCode];
  if (!game) return;

  // 1. Enviar o placar atualizado
  const scores = game.players
    .filter(p => p.nickname !== 'Anfitrião')
    .map(p => ({ nickname: p.nickname, score: p.score }))
    .sort((a, b) => b.score - a.score);

  io.to(gameCode).emit('update_scores', scores);
  console.log(`Enviando placar para o jogo ${gameCode}`);

  // 2. Pausa para mostrar o placar
  setTimeout(() => {
    game.currentQuestionIndex++;
    sendNextQuestion(gameCode);
  }, 5000); // 5 segundos para ver o placar
};

// Função para enviar a próxima pergunta
const sendNextQuestion = (gameCode) => {
  const game = gameStates[gameCode];
  if (!game) return;

  if (game.currentQuestionIndex >= game.questions.length) {
    // Fim de jogo
    const finalScores = game.players
      .filter(p => p.nickname !== 'Anfitrião')
      .map(p => ({ nickname: p.nickname, score: p.score }))
      .sort((a, b) => b.score - a.score);
    io.to(gameCode).emit('game_over', finalScores);
    console.log(`Fim de jogo para ${gameCode}`);
    delete gameStates[gameCode]; // Limpar estado do jogo
    return;
  }

  const question = game.questions[game.currentQuestionIndex];
  game.players.forEach(p => p.hasAnswered = false); // Resetar estado de resposta

  const questionForPlayers = {
    text: question.text,
    timeLimit: question.timeLimit,
    order: game.currentQuestionIndex + 1,
    options: question.Options.map(opt => ({ id: opt.id, text: opt.text }))
  };

  io.to(gameCode).emit('next_question', questionForPlayers);
  console.log(`Enviando pergunta ${game.currentQuestionIndex + 1} para o jogo ${gameCode}`);

  // Iniciar o temporizador para o fim da pergunta
  const questionTimer = setTimeout(() => {
    const correctOption = question.Options.find(opt => opt.isCorrect);
    io.to(gameCode).emit('question_end', { correctOptionId: correctOption.id });
    console.log(`Tempo esgotado para a pergunta ${game.currentQuestionIndex + 1} no jogo ${gameCode}`);
    advanceGame(gameCode);
  }, question.timeLimit * 1000);

  game.timer = questionTimer; // Guardar referência ao temporizador
};

io.on('connection', (socket) => {
  console.log(`Novo utilizador conectado: ${socket.id}`);

  socket.on('join_game', ({ gameCode, nickname }) => {
    socket.join(gameCode);
    if (!gameStates[gameCode]) {
      gameStates[gameCode] = { players: [], questions: [], currentQuestionIndex: 0 };
    }
    const newPlayer = { id: socket.id, nickname, score: 0, hasAnswered: false };
    gameStates[gameCode].players.push(newPlayer);
    io.to(gameCode).emit('update_player_list', gameStates[gameCode].players);
  });

  socket.on('start_game', async ({ gameCode }) => {
    try {
      const gameData = await Game.findOne({
        where: { gameCode },
        include: [{ model: Question, include: [Option] }]
      });
      if (!gameData || !gameData.Questions || gameData.Questions.length === 0) {
        console.error(`Jogo ${gameCode} não pode ser iniciado (não encontrado ou sem perguntas).`);
        return;
      }
      const game = gameStates[gameCode];
      game.questions = gameData.Questions;
      game.currentQuestionIndex = 0;
      io.to(gameCode).emit('game_started');
      console.log(`Jogo ${gameCode} iniciado pelo anfitrião.`);
      setTimeout(() => sendNextQuestion(gameCode), 3000);
    } catch (error) {
      console.error('Erro ao iniciar o jogo:', error);
    }
  });

  socket.on('submit_answer', ({ gameCode, optionId, timeLeft }) => {
    const game = gameStates[gameCode];
    if (!game) return;
    const player = game.players.find(p => p.id === socket.id);

    if (!player || player.hasAnswered) return;

    player.hasAnswered = true;
    const question = game.questions[game.currentQuestionIndex];
    const correctOption = question.Options.find(opt => opt.isCorrect);

    if (optionId === correctOption.id) {
      const timeBonus = Math.round((timeLeft / question.timeLimit) * 500);
      player.score += (500 + timeBonus);
      console.log(`Jogador ${player.nickname} acertou e ganhou pontos.`);
    } else {
      console.log(`Jogador ${player.nickname} errou.`);
    }

    const allPlayersAnswered = game.players
      .filter(p => p.nickname !== 'Anfitrião')
      .every(p => p.hasAnswered);

    if (allPlayersAnswered) {
      clearTimeout(game.timer);
      io.to(gameCode).emit('question_end', { correctOptionId: correctOption.id });
      console.log(`Todos responderam à pergunta ${game.currentQuestionIndex + 1} no jogo ${gameCode}`);
      advanceGame(gameCode);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Utilizador desconectado: ${socket.id}`);
    for (const gameCode in gameStates) {
      const game = gameStates[gameCode];
      const playerIndex = game.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        const removedPlayer = game.players.splice(playerIndex, 1);
        console.log(`Jogador ${removedPlayer[0].nickname} removido do jogo ${gameCode}`);
        io.to(gameCode).emit('update_player_list', game.players);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3001;
const startServer = async () => {
  await syncDatabase();
  server.listen(PORT, () => {
    console.log(`Servidor WebSocket a correr na porta ${PORT}`);
  });
};

startServer();
const sequelize = require('../config/database');
const User = require('./User');
const Game = require('./Game');
const Question = require('./Question');
const Option = require('./Option');

// --- Definir Associações ---

// 1. User e Game (Um-para-Muitos)
// Um utilizador (User) pode criar vários jogos (Game).
User.hasMany(Game, {
  foreignKey: 'userId', // A chave estrangeira na tabela Games
  onDelete: 'CASCADE'   // Se um utilizador for apagado, os seus jogos também serão.
});
Game.belongsTo(User, {
  foreignKey: 'userId'
});

// 2. Game e Question (Um-para-Muitos)
// Um jogo (Game) pode ter várias perguntas (Question).
Game.hasMany(Question, {
  foreignKey: 'gameId',
  onDelete: 'CASCADE' // Se um jogo for apagado, as suas perguntas também serão.
});
Question.belongsTo(Game, {
  foreignKey: 'gameId'
});

// 3. Question e Option (Um-para-Muitos)
// Uma pergunta (Question) pode ter várias opções (Option).
Question.hasMany(Option, {
  foreignKey: 'questionId',
  onDelete: 'CASCADE' // Se uma pergunta for apagada, as suas opções também serão.
});
Option.belongsTo(Question, {
  foreignKey: 'questionId'
});

// Sincronizar todos os modelos com a base de dados
// O ideal é que isto seja chamado uma vez no início da aplicação.
const syncDatabase = async () => {
  try {
    // O 'alter: true' tenta atualizar as tabelas para corresponderem aos modelos
    // sem apagar dados. Para um reset completo, pode-se usar 'force: true'.
    await sequelize.sync({ alter: true });
    console.log('Base de dados sincronizada com sucesso.');
  } catch (error) {
    console.error('Erro ao sincronizar a base de dados:', error);
  }
};


// Exportar os modelos e a função de sincronização
module.exports = {
  sequelize,
  syncDatabase,
  User,
  Game,
  Question,
  Option
};
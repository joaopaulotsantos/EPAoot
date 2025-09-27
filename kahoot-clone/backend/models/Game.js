const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // O código único que os jogadores usam para entrar no jogo
  gameCode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  // Chave estrangeira para o utilizador que criou o jogo
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Users', // Nome da tabela de referência
      key: 'id'
    },
    allowNull: false
  }
}, {
  tableName: 'Games',
  timestamps: true
});

module.exports = Game;
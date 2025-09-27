const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false
  },
  // Tempo limite para a pergunta, em segundos
  timeLimit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 20 // Valor padrão de 20 segundos
  },
  // Ordem da pergunta dentro do jogo
  order: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  // Chave estrangeira para o jogo a que a pergunta pertence
  gameId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Games',
      key: 'id'
    },
    allowNull: false
  }
}, {
  tableName: 'Questions',
  timestamps: true
});

module.exports = Question;
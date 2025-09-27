const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Option = sequelize.define('Option', {
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
  // Indica se esta é a resposta correta
  isCorrect: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  // Chave estrangeira para a pergunta a que a opção pertence
  questionId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Questions',
      key: 'id'
    },
    allowNull: false
  }
}, {
  tableName: 'Options',
  // Não vamos adicionar timestamps (createdAt, updatedAt) a este modelo
  // para manter a tabela mais simples, a menos que seja necessário.
  timestamps: false
});

module.exports = Option;
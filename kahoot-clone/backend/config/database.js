const { Sequelize } = require('sequelize');

// --- INSTRUÇÕES PARA O UTILIZADOR ---
// Para a ligação à sua base de dados MSSQL, por favor, configure as seguintes
// variáveis de ambiente no seu servidor (ex: no painel Plesk).
// Se estas variáveis não estiverem definidas, a aplicação usará os valores
// padrão abaixo, que são destinados apenas para desenvolvimento local.

const dbName = process.env.DB_NAME || 'kahoot_clone_db';
const dbUser = process.env.DB_USER || 'admin';
const dbPassword = process.env.DB_PASSWORD || 'password123';
const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 1433;

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: 'mssql',

  // Opções específicas do dialeto MSSQL
  dialectOptions: {
    options: {
      // A opção 'encrypt' pode ser necessária dependendo da configuração do seu servidor.
      // Se a ligação falhar, experimente alterar para 'true' ou 'false'.
      // Para o Azure SQL, por exemplo, é obrigatório ser 'true'.
      encrypt: false,
    }
  },

  // Desativar o logging por defeito, pode ser ativado para depuração
  logging: false
});

module.exports = sequelize;
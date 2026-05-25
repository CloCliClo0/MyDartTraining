import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

// Connexion MySQL (Hostinger utilise MySQL, pas PostgreSQL)
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'mydarttraining',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    // Noms de colonnes en camelCase dans Sequelize, snake_case en BDD
    underscored: false,
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci',
  },
})

export default sequelize

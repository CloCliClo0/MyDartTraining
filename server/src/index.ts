import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { createServer } from 'http'
import { Server } from 'socket.io'

// Chargement des variables d'environnement en premier
dotenv.config()

// Initialisation de Passport (doit venir après dotenv.config)
import './config/passport'

// Import des routes API
import authRoutes from './api/routes/auth.routes'
import profileRoutes from './api/routes/profile.routes'

const app = express()
const httpServer = createServer(app)
const isProduction = process.env.NODE_ENV === 'production'

// ---------------------------------------------------------------
// Socket.io
// En production : front et back sur le même serveur, pas besoin de CORS Socket.io
// En développement : le client Vite tourne sur le port 5173
// ---------------------------------------------------------------
const io = new Server(httpServer, {
  cors: isProduction
    ? false
    : {
        origin: process.env.CLIENT_URL ?? 'http://localhost:5173',
        methods: ['GET', 'POST'],
      },
})

// ---------------------------------------------------------------
// Middlewares globaux
// ---------------------------------------------------------------
// CORS HTTP uniquement en développement (même origine en production)
if (!isProduction) {
  app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }))
}

app.use(express.json())

// ---------------------------------------------------------------
// Routes API (prioritaires sur les fichiers statiques)
// ---------------------------------------------------------------
app.use('/api/auth', authRoutes)
app.use('/api/profiles', profileRoutes)

// ---------------------------------------------------------------
// Fichiers statiques + fallback React Router (production uniquement)
// ---------------------------------------------------------------
if (isProduction) {
  const publicDir = path.join(__dirname, '..', 'public')
  app.use(express.static(publicDir))

  // Toutes les routes non-API renvoient index.html (React Router côté client)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'))
  })
} else {
  // En développement : health check simple
  app.get('/', (_req, res) => {
    res.json({ message: 'MyDartTraining API is running' })
  })
}

// ---------------------------------------------------------------
// Socket.io — événements temps réel
// ---------------------------------------------------------------
io.on('connection', (socket) => {
  console.log(`Socket connecté : ${socket.id}`)
  socket.on('disconnect', () => {
    console.log(`Socket déconnecté : ${socket.id}`)
  })
})

// ---------------------------------------------------------------
// Démarrage du serveur
// ---------------------------------------------------------------
const PORT = Number(process.env.PORT) || 3000
httpServer.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT} (${process.env.NODE_ENV ?? 'development'})`)
})

export { io }

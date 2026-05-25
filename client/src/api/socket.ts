import { io } from 'socket.io-client'

/**
 * Instance Socket.io.
 * - En développement : connexion vers VITE_API_URL (http://localhost:3000)
 * - En production   : connexion vers la même origine (même serveur)
 * autoConnect: false → la connexion se fait manuellement après login.
 */
const SOCKET_URL = import.meta.env.VITE_API_URL || window.location.origin

const socket = io(SOCKET_URL, {
  autoConnect: false,
})

export default socket

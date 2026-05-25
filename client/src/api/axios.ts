import axios from 'axios'

/**
 * Instance Axios configurée pour l'API.
 * - En développement : VITE_API_URL=http://localhost:3000 (requêtes absolues)
 * - En production   : VITE_API_URL='' (URLs relatives, même serveur)
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

// Injecte automatiquement le token JWT dans chaque requête
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Redirige vers /login si le serveur retourne 401
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const status = (error as { response?: { status?: number } }).response?.status
    if (status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default api

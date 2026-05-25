import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../store/authStore'
import type { User } from '../types'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { login, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Redirige si déjà connecté ou gère le callback Google OAuth
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true })
      return
    }

    // Token reçu après callback Google OAuth
    const token = searchParams.get('token')
    if (token) {
      void fetchMeWithToken(token)
      return
    }

    // Erreur OAuth
    const oauthError = searchParams.get('error')
    if (oauthError) {
      setError('La connexion via Google a échoué. Veuillez réessayer.')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Récupère les infos utilisateur après callback Google et stocke la session. */
  const fetchMeWithToken = async (token: string) => {
    try {
      const res = await api.get<User>('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
      login(res.data, token)
      navigate('/home', { replace: true })
    } catch {
      setError('Erreur lors de la connexion via Google.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await api.post<{ user: User; token: string }>('/api/auth/login', {
        email,
        password,
      })
      login(res.data.user, res.data.token)
      navigate('/home', { replace: true })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error
      setError(msg ?? 'Email ou mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  /** Redirige vers l'endpoint OAuth Google (dev ou prod). */
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL ?? ''}/api/auth/google`
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* En-tête */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">MyDartTraining</h1>
          <p className="text-gray-400 mt-2 text-sm">Connectez-vous à votre compte</p>
        </div>

        <div className="bg-[#111111] border border-[#1f1f1f] rounded-2xl p-8 shadow-xl">

          {/* Message d'erreur */}
          {error && (
            <div className="mb-5 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Formulaire email / mot de passe */}
          <form onSubmit={(e) => { void handleSubmit(e) }} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Adresse e-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#22c55e] transition-colors"
                placeholder="vous@exemple.fr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-[#22c55e] transition-colors"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Connexion en cours…' : 'Se connecter'}
            </button>
          </form>

          {/* Séparateur */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2a2a2a]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-[#111111] text-gray-500">ou</span>
            </div>
          </div>

          {/* Bouton Google OAuth */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continuer avec Google
          </button>

          <p className="text-center text-gray-500 text-sm mt-6">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-[#22c55e] hover:text-[#16a34a] font-medium transition-colors">
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

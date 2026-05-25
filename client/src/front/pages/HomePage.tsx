import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../store/authStore'
import type { Profile } from '../types'

// Modes de jeu disponibles
const GAME_MODES = [
  {
    id: 'solo',
    label: 'Solo',
    description: 'Jouez en local avec vos profils, sans connexion requise.',
    color: '#3b82f6',
  },
  {
    id: 'online',
    label: 'Online',
    description: 'Affrontez des joueurs du monde entier en temps réel.',
    color: '#22c55e',
  },
  {
    id: 'training',
    label: 'Training',
    description: 'Entraînez-vous et suivez vos statistiques.',
    color: '#f59e0b',
  },
]

function HomePage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(true)

  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  // Charge les profils de l'utilisateur au montage
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const res = await api.get<Profile[]>('/api/profiles')
        setProfiles(res.data)
      } catch {
        // Silencieux : la liste reste vide
      } finally {
        setLoadingProfiles(false)
      }
    }
    void loadProfiles()
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Barre de navigation */}
      <header className="border-b border-[#1f1f1f] px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">MyDartTraining</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">
            Bonjour,{' '}
            <span className="text-white font-medium">{user?.username}</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-white border border-[#2a2a2a] hover:border-[#3a3a3a] px-3 py-1.5 rounded-lg transition-colors"
          >
            Déconnexion
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Profils */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Mes profils</h2>
            {profiles.length < 8 && (
              <button className="text-sm text-[#22c55e] hover:text-[#16a34a] font-medium transition-colors">
                + Nouveau profil
              </button>
            )}
          </div>

          {loadingProfiles ? (
            <p className="text-gray-500 text-sm">Chargement…</p>
          ) : profiles.length === 0 ? (
            <div className="bg-[#111111] border border-dashed border-[#2a2a2a] rounded-xl p-8 text-center">
              <p className="text-gray-500 text-sm mb-3">Vous n&apos;avez pas encore de profil.</p>
              <button className="text-sm bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium px-4 py-2 rounded-lg transition-colors">
                Créer un profil
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="bg-[#111111] border border-[#1f1f1f] rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:border-[#2a2a2a] transition-colors"
                >
                  {/* Avatar coloré */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: `${profile.color}30`, color: profile.color }}
                  >
                    {profile.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white text-sm font-medium text-center truncate w-full text-center">
                    {profile.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Modes de jeu */}
        <section>
          <h2 className="text-lg font-semibold text-white mb-4">Choisissez un mode</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {GAME_MODES.map((mode) => (
              <button
                key={mode.id}
                className="group text-left bg-[#111111] border border-[#1f1f1f] hover:border-[#2a2a2a] rounded-2xl p-6 transition-all hover:bg-[#141414]"
              >
                {/* Icône lettre colorée */}
                <div
                  className="w-10 h-10 rounded-xl mb-4 flex items-center justify-center text-base font-bold"
                  style={{ backgroundColor: `${mode.color}20`, color: mode.color }}
                >
                  {mode.label[0]}
                </div>
                <h3 className="text-base font-semibold text-white mb-1">{mode.label}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{mode.description}</p>
                <div
                  className="mt-4 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: mode.color }}
                >
                  Jouer →
                </div>
              </button>
            ))}
          </div>
        </section>

      </main>
    </div>
  )
}

export default HomePage

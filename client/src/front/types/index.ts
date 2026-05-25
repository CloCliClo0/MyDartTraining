// ============================================================
// Types TypeScript partagés côté client
// ============================================================

export type GameMode = '501' | '301' | '180' | 'cricket' | 'around_the_world' | 'practice'
export type GameStatus = 'waiting' | 'in_progress' | 'finished' | 'abandoned'

export interface User {
  id: number
  username: string
  email: string
  avatar: string | null
  createdAt: string
  updatedAt: string
}

export interface Profile {
  id: number
  userId: number
  name: string
  color: string
  avatar: string | null
  createdAt: string
  updatedAt: string
}

export interface Game {
  id: number
  mode: GameMode
  status: GameStatus
  startingScore: number | null
  doubleOut: boolean
  doubleIn: boolean
  winnerId: number | null
  startedAt: string | null
  finishedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  token: string
}

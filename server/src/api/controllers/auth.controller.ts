import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../../sql/models/User'
import { AuthRequest } from '../middlewares/auth.middleware'

/** Génère un JWT signé pour l'utilisateur. */
const signToken = (id: number, email: string): string =>
  jwt.sign({ id, email }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  } as jwt.SignOptions)

// ---------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body as {
      username: string
      email: string
      password: string
    }

    // Vérifie si l'e-mail est déjà utilisé
    const existingEmail = await User.findOne({ where: { email } })
    if (existingEmail) {
      res.status(409).json({ error: 'Cette adresse e-mail est déjà utilisée' })
      return
    }

    // Vérifie si le pseudo est déjà pris
    const existingUsername = await User.findOne({ where: { username } })
    if (existingUsername) {
      res.status(409).json({ error: 'Ce pseudo est déjà pris' })
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({ username, email, password: hashedPassword })

    const token = signToken(user.id, user.email)
    const { password: _pw, ...userWithoutPassword } = user.toJSON()

    res.status(201).json({ user: userWithoutPassword, token })
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de l\'inscription' })
  }
}

// ---------------------------------------------------------------
// POST /api/auth/login
// ---------------------------------------------------------------
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string }

    const user = await User.findOne({ where: { email } })
    if (!user) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect' })
      return
    }

    // Compte créé via Google (pas de mot de passe)
    if (!user.password) {
      res.status(401).json({ error: 'Ce compte utilise la connexion Google' })
      return
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      res.status(401).json({ error: 'Email ou mot de passe incorrect' })
      return
    }

    const token = signToken(user.id, user.email)
    const { password: _pw, ...userWithoutPassword } = user.toJSON()

    res.json({ user: userWithoutPassword, token })
  } catch {
    res.status(500).json({ error: 'Erreur serveur lors de la connexion' })
  }
}

// ---------------------------------------------------------------
// GET /api/auth/google/callback → redirige vers le client avec le token
// ---------------------------------------------------------------
export const googleCallback = (req: Request, res: Response): void => {
  // L'utilisateur est déjà vérifié par Passport (req.user = instance User)
  const user = req.user as User
  const token = signToken(user.id, user.email)
  // Redirige vers le front avec le token dans l'URL
  res.redirect(`${process.env.CLIENT_URL ?? ''}/login?token=${token}`)
}

// ---------------------------------------------------------------
// GET /api/auth/me (protégé JWT)
// ---------------------------------------------------------------
export const me = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user!.id, {
      attributes: { exclude: ['password', 'googleId'] },
    })

    if (!user) {
      res.status(404).json({ error: 'Utilisateur introuvable' })
      return
    }

    res.json(user)
  } catch {
    res.status(500).json({ error: 'Erreur serveur' })
  }
}

import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  id: number
  email: string
}

/** Request étendu avec le payload JWT injecté. */
export interface AuthRequest extends Request {
  user?: JwtPayload
}

/**
 * Middleware d'authentification JWT.
 * Vérifie le token dans le header Authorization: Bearer <token>.
 * Retourne 401 si absent ou invalide.
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token manquant ou invalide' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload
    req.user = payload
    next()
  } catch {
    res.status(401).json({ error: 'Token expiré ou invalide' })
  }
}

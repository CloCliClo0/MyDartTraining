import { Router } from 'express'
import passport from 'passport'
import * as authController from '../controllers/auth.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validation.middleware'

const router = Router()

// POST /api/auth/register
router.post(
  '/register',
  validate([
    { field: 'username', required: true, minLength: 3, maxLength: 50 },
    { field: 'email',    required: true, isEmail: true },
    { field: 'password', required: true, minLength: 8, maxLength: 255 },
  ]),
  authController.register,
)

// POST /api/auth/login
router.post(
  '/login',
  validate([
    { field: 'email',    required: true, isEmail: true },
    { field: 'password', required: true },
  ]),
  authController.login,
)

// GET /api/auth/google → redirige vers la page de consentement Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false }),
)

// GET /api/auth/google/callback → reçu depuis Google
router.get(
  '/google/callback',
  (req, res, next) => {
    // failureRedirect évalué à l'exécution de la requête (pas au chargement du module)
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${process.env.CLIENT_URL ?? ''}/login?error=auth_failed`,
    })(req, res, next)
  },
  authController.googleCallback,
)

// GET /api/auth/me → infos de l'utilisateur connecté
router.get('/me', authenticate, authController.me)

export default router

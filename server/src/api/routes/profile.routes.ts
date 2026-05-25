import { Router } from 'express'
import * as profileController from '../controllers/profile.controller'
import { authenticate } from '../middlewares/auth.middleware'
import { validate } from '../middlewares/validation.middleware'

const router = Router()

// Toutes les routes profils nécessitent un JWT valide
router.use(authenticate)

// GET    /api/profiles
router.get('/', profileController.getProfiles)

// POST   /api/profiles
router.post(
  '/',
  validate([{ field: 'name', required: true, minLength: 1, maxLength: 50 }]),
  profileController.createProfile,
)

// PUT    /api/profiles/:id
router.put('/:id', profileController.updateProfile)

// DELETE /api/profiles/:id
router.delete('/:id', profileController.deleteProfile)

export default router

import { Response } from 'express'
import Profile from '../../sql/models/Profile'
import { AuthRequest } from '../middlewares/auth.middleware'

// ---------------------------------------------------------------
// GET /api/profiles
// ---------------------------------------------------------------
export const getProfiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profiles = await Profile.findAll({
      where: { userId: req.user!.id },
      order: [['createdAt', 'ASC']],
    })
    res.json(profiles)
  } catch {
    res.status(500).json({ error: 'Erreur lors de la récupération des profils' })
  }
}

// ---------------------------------------------------------------
// POST /api/profiles
// ---------------------------------------------------------------
export const createProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Vérifie la limite de 8 profils par compte
    const count = await Profile.count({ where: { userId: req.user!.id } })
    if (count >= 8) {
      res.status(400).json({ error: 'Maximum 8 profils par compte atteint' })
      return
    }

    const { name, color, avatar } = req.body as {
      name: string
      color?: string
      avatar?: string
    }

    const profile = await Profile.create({
      userId: req.user!.id,
      name,
      color: color ?? '#ffffff',
      avatar: avatar ?? null,
    })

    res.status(201).json(profile)
  } catch {
    res.status(500).json({ error: 'Erreur lors de la création du profil' })
  }
}

// ---------------------------------------------------------------
// PUT /api/profiles/:id
// ---------------------------------------------------------------
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // S'assure que le profil appartient bien à l'utilisateur connecté
    const profile = await Profile.findOne({
      where: { id: req.params.id, userId: req.user!.id },
    })

    if (!profile) {
      res.status(404).json({ error: 'Profil introuvable' })
      return
    }

    const { name, color, avatar } = req.body as {
      name?: string
      color?: string
      avatar?: string | null
    }

    await profile.update({
      ...(name !== undefined && { name }),
      ...(color !== undefined && { color }),
      ...(avatar !== undefined && { avatar }),
    })

    res.json(profile)
  } catch {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' })
  }
}

// ---------------------------------------------------------------
// DELETE /api/profiles/:id
// ---------------------------------------------------------------
export const deleteProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await Profile.findOne({
      where: { id: req.params.id, userId: req.user!.id },
    })

    if (!profile) {
      res.status(404).json({ error: 'Profil introuvable' })
      return
    }

    await profile.destroy()
    res.status(204).send()
  } catch {
    res.status(500).json({ error: 'Erreur lors de la suppression du profil' })
  }
}

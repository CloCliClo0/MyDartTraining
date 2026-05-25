import { Request, Response, NextFunction } from 'express'

interface ValidationRule {
  field: string
  required?: boolean
  minLength?: number
  maxLength?: number
  isEmail?: boolean
}

/**
 * Middleware de validation des données entrantes (req.body).
 * Retourne 400 avec le détail des erreurs si la validation échoue.
 */
export const validate = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = []

    for (const rule of rules) {
      const value = req.body[rule.field] as unknown
      const isEmpty = value === undefined || value === null || value === ''

      if (rule.required && isEmpty) {
        errors.push(`Le champ "${rule.field}" est requis`)
        continue
      }

      if (!isEmpty) {
        const str = String(value)
        if (rule.minLength !== undefined && str.length < rule.minLength) {
          errors.push(`"${rule.field}" doit contenir au moins ${rule.minLength} caractères`)
        }
        if (rule.maxLength !== undefined && str.length > rule.maxLength) {
          errors.push(`"${rule.field}" ne doit pas dépasser ${rule.maxLength} caractères`)
        }
        if (rule.isEmail === true && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) {
          errors.push(`"${rule.field}" doit être une adresse e-mail valide`)
        }
      }
    }

    if (errors.length > 0) {
      res.status(400).json({ error: errors.join('. ') })
      return
    }

    next()
  }
}

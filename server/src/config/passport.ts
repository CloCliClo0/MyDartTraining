import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../sql/models/User'

/**
 * Stratégie Google OAuth2.
 * Crée le compte si l'utilisateur n'existe pas encore,
 * ou lie le compte Google à un compte existant par e-mail.
 */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value
        if (!email) {
          return done(new Error('Aucune adresse e-mail fournie par Google'))
        }

        // Cherche d'abord par googleId
        let user = await User.findOne({ where: { googleId: profile.id } })

        if (!user) {
          // Cherche par e-mail (compte classique existant)
          user = await User.findOne({ where: { email } })

          if (user) {
            // Lie le compte Google au compte classique existant
            await user.update({ googleId: profile.id })
          } else {
            // Crée un nouveau compte via Google
            const username = profile.displayName || email.split('@')[0]
            user = await User.create({
              googleId: profile.id,
              username,
              email,
              password: null,
              avatar: profile.photos?.[0]?.value ?? null,
            })
          }
        }

        return done(null, user)
      } catch (error) {
        return done(error as Error)
      }
    },
  ),
)

export default passport

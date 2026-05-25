import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../../config/database'

interface UserAttributes {
  id: number
  username: string
  email: string
  password: string | null  // null pour les comptes Google OAuth
  googleId: string | null  // identifiant Google OAuth
  avatar: string | null
  createdAt?: Date
  updatedAt?: Date
}

interface UserCreationAttributes
  extends Optional<UserAttributes, 'id' | 'avatar' | 'password' | 'googleId'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number
  declare username: string
  declare email: string
  declare password: string | null
  declare googleId: string | null
  declare avatar: string | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    googleId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true,  // null pour les utilisateurs Google OAuth
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  },
)

export default User

import { DataTypes, Model, Optional } from 'sequelize'
import sequelize from '../../config/database'
import User from './User'

interface ProfileAttributes {
  id: number
  userId: number
  name: string
  color: string
  avatar: string | null
  createdAt?: Date
  updatedAt?: Date
}

interface ProfileCreationAttributes extends Optional<ProfileAttributes, 'id' | 'avatar'> {}

class Profile extends Model<ProfileAttributes, ProfileCreationAttributes> implements ProfileAttributes {
  declare id: number
  declare userId: number
  declare name: string
  declare color: string
  declare avatar: string | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

Profile.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
      onDelete: 'CASCADE',
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING(7),
      allowNull: false,
      defaultValue: '#ffffff',
    },
    avatar: {
      type: DataTypes.STRING(500),
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    tableName: 'profiles',
    timestamps: true,
  },
)

// Un User peut avoir max 8 profils
User.hasMany(Profile, {
  foreignKey: 'userId',
  as: 'profiles',
  constraints: true,
})
Profile.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
})

export default Profile

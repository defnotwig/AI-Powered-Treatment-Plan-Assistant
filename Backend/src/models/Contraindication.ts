import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Contraindication Attributes
interface ContraindicationAttributes {
  id: string;
  drug: string;
  condition: string;
  type: 'absolute' | 'relative';
  reason: string;
  alternatives: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface ContraindicationCreationAttributes extends Optional<ContraindicationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Contraindication Model
class Contraindication extends Model<ContraindicationAttributes, ContraindicationCreationAttributes> implements ContraindicationAttributes {
  public id!: string;
  public drug!: string;
  public condition!: string;
  public type!: 'absolute' | 'relative';
  public reason!: string;
  public alternatives!: string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Contraindication.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    drug: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    condition: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('absolute', 'relative'),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    alternatives: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: 'contraindications',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['drug'] },
      { fields: ['condition'] },
      { fields: ['type'] },
    ],
  }
);

export { Contraindication, ContraindicationAttributes, ContraindicationCreationAttributes };

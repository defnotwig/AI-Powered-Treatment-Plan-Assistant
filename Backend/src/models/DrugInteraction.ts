import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// DrugInteraction Attributes
interface DrugInteractionAttributes {
  id: string;
  drug1: string;
  drug2: string;
  severity: 'major' | 'moderate' | 'minor';
  effect: string;
  mechanism: string;
  management: string;
  evidence: 'definitive' | 'probable' | 'theoretical';
  createdAt?: Date;
  updatedAt?: Date;
}

interface DrugInteractionCreationAttributes extends Optional<DrugInteractionAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// DrugInteraction Model
class DrugInteraction extends Model<DrugInteractionAttributes, DrugInteractionCreationAttributes> implements DrugInteractionAttributes {
  public id!: string;
  public drug1!: string;
  public drug2!: string;
  public severity!: 'major' | 'moderate' | 'minor';
  public effect!: string;
  public mechanism!: string;
  public management!: string;
  public evidence!: 'definitive' | 'probable' | 'theoretical';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DrugInteraction.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    drug1: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    drug2: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    severity: {
      type: DataTypes.ENUM('major', 'moderate', 'minor'),
      allowNull: false,
    },
    effect: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mechanism: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    management: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    evidence: {
      type: DataTypes.ENUM('definitive', 'probable', 'theoretical'),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'drug_interactions',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['drug1'] },
      { fields: ['drug2'] },
      { fields: ['severity'] },
    ],
  }
);

export { DrugInteraction, DrugInteractionAttributes, DrugInteractionCreationAttributes };

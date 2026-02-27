import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// DosageGuideline Attributes
interface DosageGuidelineAttributes {
  id: string;
  drug: string;
  indication: string;
  standardDose: string;
  maxDose: string;
  renalAdjustment: object;
  hepaticAdjustment: string;
  geriatricAdjustment: string;
  pediatricFormula: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface DosageGuidelineCreationAttributes extends Optional<DosageGuidelineAttributes, 'id' | 'pediatricFormula' | 'createdAt' | 'updatedAt'> {}

// DosageGuideline Model
class DosageGuideline extends Model<DosageGuidelineAttributes, DosageGuidelineCreationAttributes> implements DosageGuidelineAttributes {
  public id!: string;
  public drug!: string;
  public indication!: string;
  public standardDose!: string;
  public maxDose!: string;
  public renalAdjustment!: object;
  public hepaticAdjustment!: string;
  public geriatricAdjustment!: string;
  public pediatricFormula!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

DosageGuideline.init(
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
    indication: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    standardDose: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'standard_dose',
    },
    maxDose: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'max_dose',
    },
    renalAdjustment: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
      field: 'renal_adjustment',
    },
    hepaticAdjustment: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'hepatic_adjustment',
    },
    geriatricAdjustment: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'geriatric_adjustment',
    },
    pediatricFormula: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'pediatric_formula',
    },
  },
  {
    sequelize,
    tableName: 'dosage_guidelines',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['drug'] },
      { fields: ['indication'] },
    ],
  }
);

export { DosageGuideline, DosageGuidelineAttributes, DosageGuidelineCreationAttributes };

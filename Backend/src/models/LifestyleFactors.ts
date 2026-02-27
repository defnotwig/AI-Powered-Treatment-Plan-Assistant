import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// LifestyleFactors Attributes
interface LifestyleFactorsAttributes {
  id: string;
  patientId: string;
  smokingStatus: 'never' | 'former' | 'current';
  smokingPacksPerDay: number | null;
  smokingYears: number | null;
  alcoholFrequency: 'none' | 'occasional' | 'moderate' | 'heavy';
  alcoholDrinksPerWeek: number | null;
  exerciseFrequency: 'sedentary' | 'light' | 'moderate' | 'active';
  exerciseMinutesPerWeek: number | null;
  diet: 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'other';
  chiefComplaint: object;
  createdAt?: Date;
  updatedAt?: Date;
}

interface LifestyleFactorsCreationAttributes extends Optional<LifestyleFactorsAttributes, 'id' | 'smokingPacksPerDay' | 'smokingYears' | 'alcoholDrinksPerWeek' | 'exerciseMinutesPerWeek' | 'createdAt' | 'updatedAt'> {}

// LifestyleFactors Model
class LifestyleFactors extends Model<LifestyleFactorsAttributes, LifestyleFactorsCreationAttributes> implements LifestyleFactorsAttributes {
  public id!: string;
  public patientId!: string;
  public smokingStatus!: 'never' | 'former' | 'current';
  public smokingPacksPerDay!: number | null;
  public smokingYears!: number | null;
  public alcoholFrequency!: 'none' | 'occasional' | 'moderate' | 'heavy';
  public alcoholDrinksPerWeek!: number | null;
  public exerciseFrequency!: 'sedentary' | 'light' | 'moderate' | 'active';
  public exerciseMinutesPerWeek!: number | null;
  public diet!: 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'other';
  public chiefComplaint!: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

LifestyleFactors.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'patient_id',
      references: {
        model: 'patients',
        key: 'id',
      },
    },
    smokingStatus: {
      type: DataTypes.ENUM('never', 'former', 'current'),
      allowNull: false,
      field: 'smoking_status',
    },
    smokingPacksPerDay: {
      type: DataTypes.FLOAT,
      allowNull: true,
      field: 'smoking_packs_per_day',
    },
    smokingYears: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'smoking_years',
    },
    alcoholFrequency: {
      type: DataTypes.ENUM('none', 'occasional', 'moderate', 'heavy'),
      allowNull: false,
      field: 'alcohol_frequency',
    },
    alcoholDrinksPerWeek: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'alcohol_drinks_per_week',
    },
    exerciseFrequency: {
      type: DataTypes.ENUM('sedentary', 'light', 'moderate', 'active'),
      allowNull: false,
      field: 'exercise_frequency',
    },
    exerciseMinutesPerWeek: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'exercise_minutes_per_week',
    },
    diet: {
      type: DataTypes.ENUM('standard', 'vegetarian', 'vegan', 'keto', 'other'),
      allowNull: false,
    },
    chiefComplaint: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'chief_complaint',
    },
  },
  {
    sequelize,
    tableName: 'lifestyle_factors',
    timestamps: true,
    underscored: true,
  }
);

export { LifestyleFactors, LifestyleFactorsAttributes, LifestyleFactorsCreationAttributes };

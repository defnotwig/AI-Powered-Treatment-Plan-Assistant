import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// MedicalHistory Attributes
interface MedicalHistoryAttributes {
  id: string;
  patientId: string;
  conditions: object[];
  allergies: object[];
  pastSurgeries: object[];
  familyHistory: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface MedicalHistoryCreationAttributes extends Optional<MedicalHistoryAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// MedicalHistory Model
class MedicalHistory extends Model<MedicalHistoryAttributes, MedicalHistoryCreationAttributes> implements MedicalHistoryAttributes {
  public id!: string;
  public patientId!: string;
  public conditions!: object[];
  public allergies!: object[];
  public pastSurgeries!: object[];
  public familyHistory!: string[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

MedicalHistory.init(
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
    conditions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    allergies: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    pastSurgeries: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      field: 'past_surgeries',
    },
    familyHistory: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      field: 'family_history',
    },
  },
  {
    sequelize,
    tableName: 'medical_histories',
    timestamps: true,
    underscored: true,
  }
);

export { MedicalHistory, MedicalHistoryAttributes, MedicalHistoryCreationAttributes };

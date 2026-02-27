import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// Patient Attributes
interface PatientAttributes {
  id: string;
  age: number;
  sex: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  bmi: number;
  systolicBp: number;
  diastolicBp: number;
  heartRate: number;
  temperature: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PatientCreationAttributes extends Optional<PatientAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Patient Model
class Patient extends Model<PatientAttributes, PatientCreationAttributes> implements PatientAttributes {
  public id!: string;
  public age!: number;
  public sex!: 'male' | 'female' | 'other';
  public weight!: number;
  public height!: number;
  public bmi!: number;
  public systolicBp!: number;
  public diastolicBp!: number;
  public heartRate!: number;
  public temperature!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Patient.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: 150,
      },
    },
    sex: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: false,
      defaultValue: 'other',
    },
    weight: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    height: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    bmi: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    systolicBp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'systolic_bp',
    },
    diastolicBp: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'diastolic_bp',
    },
    heartRate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'heart_rate',
    },
    temperature: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'patients',
    timestamps: true,
    underscored: true,
  }
);

export { Patient, PatientAttributes, PatientCreationAttributes };

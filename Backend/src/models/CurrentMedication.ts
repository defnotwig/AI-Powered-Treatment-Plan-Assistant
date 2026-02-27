import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// CurrentMedication Attributes
interface CurrentMedicationAttributes {
  id: string;
  patientId: string;
  drugName: string;
  genericName: string;
  dosage: string;
  frequency: string;
  route: 'oral' | 'IV' | 'topical' | 'injection' | 'sublingual';
  startDate: string;
  prescribedBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface CurrentMedicationCreationAttributes extends Optional<CurrentMedicationAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// CurrentMedication Model
class CurrentMedication extends Model<CurrentMedicationAttributes, CurrentMedicationCreationAttributes> implements CurrentMedicationAttributes {
  public id!: string;
  public patientId!: string;
  public drugName!: string;
  public genericName!: string;
  public dosage!: string;
  public frequency!: string;
  public route!: 'oral' | 'IV' | 'topical' | 'injection' | 'sublingual';
  public startDate!: string;
  public prescribedBy!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

CurrentMedication.init(
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
    drugName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'drug_name',
    },
    genericName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'generic_name',
    },
    dosage: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    frequency: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    route: {
      type: DataTypes.ENUM('oral', 'IV', 'topical', 'injection', 'sublingual'),
      allowNull: false,
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: 'start_date',
    },
    prescribedBy: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'prescribed_by',
    },
  },
  {
    sequelize,
    tableName: 'current_medications',
    timestamps: true,
    underscored: true,
  }
);

export { CurrentMedication, CurrentMedicationAttributes, CurrentMedicationCreationAttributes };

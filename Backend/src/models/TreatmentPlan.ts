import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { TreatmentPlanResponse, RiskLevel } from '../types';

// TreatmentPlan Attributes
interface TreatmentPlanAttributes {
  id: string;
  patientId: string;
  treatmentData: TreatmentPlanResponse;
  overallRisk: RiskLevel;
  riskScore: number;
  confidenceScore: number;
  status: 'pending' | 'approved' | 'modified' | 'rejected';
  approvedBy: string | null;
  approvedAt: Date | null;
  rejectionReason: string | null;
  modifications: object | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface TreatmentPlanCreationAttributes extends Optional<TreatmentPlanAttributes, 'id' | 'status' | 'approvedBy' | 'approvedAt' | 'rejectionReason' | 'modifications' | 'createdAt' | 'updatedAt'> {}

// TreatmentPlan Model
class TreatmentPlan extends Model<TreatmentPlanAttributes, TreatmentPlanCreationAttributes> implements TreatmentPlanAttributes {
  public id!: string;
  public patientId!: string;
  public treatmentData!: TreatmentPlanResponse;
  public overallRisk!: RiskLevel;
  public riskScore!: number;
  public confidenceScore!: number;
  public status!: 'pending' | 'approved' | 'modified' | 'rejected';
  public approvedBy!: string | null;
  public approvedAt!: Date | null;
  public rejectionReason!: string | null;
  public modifications!: object | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

TreatmentPlan.init(
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
    treatmentData: {
      type: DataTypes.JSONB,
      allowNull: false,
      field: 'treatment_data',
    },
    overallRisk: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
      allowNull: false,
      field: 'overall_risk',
    },
    riskScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'risk_score',
      validate: {
        min: 0,
        max: 100,
      },
    },
    confidenceScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'confidence_score',
      validate: {
        min: 0,
        max: 100,
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'modified', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
    approvedBy: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'approved_by',
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'approved_at',
    },
    rejectionReason: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'rejection_reason',
    },
    modifications: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'treatment_plans',
    timestamps: true,
    underscored: true,
  }
);

export { TreatmentPlan, TreatmentPlanAttributes, TreatmentPlanCreationAttributes };

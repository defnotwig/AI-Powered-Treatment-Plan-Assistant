import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

// AuditLog Attributes
interface AuditLogAttributes {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: 'created' | 'approved' | 'modified' | 'rejected' | 'viewed';
  patientId: string;
  treatmentPlanId: string | null;
  changes: object | null;
  reason: string | null;
  riskLevel: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AuditLogCreationAttributes extends Optional<AuditLogAttributes, 'id' | 'treatmentPlanId' | 'changes' | 'reason' | 'riskLevel' | 'ipAddress' | 'userAgent' | 'createdAt' | 'updatedAt'> {}

// AuditLog Model
class AuditLog extends Model<AuditLogAttributes, AuditLogCreationAttributes> implements AuditLogAttributes {
  public id!: string;
  public timestamp!: Date;
  public userId!: string;
  public userName!: string;
  public action!: 'created' | 'approved' | 'modified' | 'rejected' | 'viewed';
  public patientId!: string;
  public treatmentPlanId!: string | null;
  public changes!: object | null;
  public reason!: string | null;
  public riskLevel!: string | null;
  public ipAddress!: string | null;
  public userAgent!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AuditLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    userId: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'user_id',
    },
    userName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'user_name',
    },
    action: {
      type: DataTypes.ENUM('created', 'approved', 'modified', 'rejected', 'viewed'),
      allowNull: false,
    },
    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'patient_id',
    },
    treatmentPlanId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'treatment_plan_id',
    },
    changes: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    riskLevel: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'risk_level',
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address',
    },
    userAgent: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'user_agent',
    },
  },
  {
    sequelize,
    tableName: 'audit_logs',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['patient_id'] },
      { fields: ['treatment_plan_id'] },
      { fields: ['timestamp'] },
      { fields: ['action'] },
    ],
  }
);

export { AuditLog, AuditLogAttributes, AuditLogCreationAttributes };

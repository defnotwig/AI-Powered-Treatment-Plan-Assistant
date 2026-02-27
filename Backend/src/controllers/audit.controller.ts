import { Request, Response } from 'express';
import logger from '../config/logger';
import { AuditLog } from '../models';
import { Op, WhereOptions } from 'sequelize';

interface TimestampFilter {
  [Op.gte]?: Date;
  [Op.lte]?: Date;
}

interface AuditLogWhere {
  action?: string;
  timestamp?: TimestampFilter;
}

// Get audit logs for a patient
export const getPatientAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.params;
    
    const logs = await AuditLog.findAll({
      where: { patientId },
      order: [['timestamp', 'DESC']],
    });

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    logger.error('Get patient audit logs error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get audit logs for a treatment plan
export const getTreatmentPlanAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { treatmentPlanId } = req.params;
    
    const logs = await AuditLog.findAll({
      where: { treatmentPlanId },
      order: [['timestamp', 'DESC']],
    });

    res.json({
      success: true,
      data: logs,
    });
  } catch (error) {
    logger.error('Get treatment plan audit logs error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get all audit logs with optional filtering
export const getAllAuditLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    const { action, startDate, endDate, limit = 100, offset = 0 } = req.query;
    
    const where: AuditLogWhere = {};
    
    if (action) {
      where.action = action as string;
    }
    
    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        where.timestamp[Op.lte] = new Date(endDate as string);
      }
    }
    
    const { count, rows } = await AuditLog.findAndCountAll({
      where: where as WhereOptions,
      order: [['timestamp', 'DESC']],
      limit: Number.parseInt(limit as string, 10),
      offset: Number.parseInt(offset as string, 10),
    });

    res.json({
      success: true,
      data: {
        total: count,
        logs: rows,
      },
    });
  } catch (error) {
    logger.error('Get all audit logs error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get audit logs',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

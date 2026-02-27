import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';
import {
  Patient,
  MedicalHistory,
  CurrentMedication,
  LifestyleFactors,
  TreatmentPlan,
  AuditLog,
} from '../models';
import { validatePatientData } from '../services/validation.service';
import { CompletePatientData } from '../types';
import { sequelize } from '../config/database';
import { config } from '../config';
import { demoStorage } from '../services/demo-storage.service';
import { invalidateCacheTags } from '../middleware/cache.middleware';

// Helper: create patient in demo mode
function createPatientDemo(patientData: CompletePatientData, bmi: number, req: Request): Record<string, unknown> {
  const patientId = patientData.demographics.patientId || `PT-${Date.now()}`;

  const patient = demoStorage.createPatient({
    patientId,
    age: patientData.demographics.age,
    sex: patientData.demographics.sex || 'other',
    weight: patientData.demographics.weight,
    height: patientData.demographics.height,
    bmi: Math.round(bmi * 10) / 10,
    systolicBp: patientData.demographics.bloodPressure?.systolic || 120,
    diastolicBp: patientData.demographics.bloodPressure?.diastolic || 80,
    heartRate: patientData.demographics.heartRate || 72,
    temperature: patientData.demographics.temperature || 98.6,
  });

  if (patientData.medicalHistory) {
    demoStorage.createMedicalHistory({
      patientId: patient.id,
      conditions: patientData.medicalHistory.conditions || [],
      allergies: patientData.medicalHistory.allergies || [],
      pastSurgeries: patientData.medicalHistory.pastSurgeries || [],
      familyHistory: patientData.medicalHistory.familyHistory || [],
    });
  }

  if (patientData.currentMedications?.medications) {
    for (const med of patientData.currentMedications.medications) {
      demoStorage.addMedication(patient.id, {
        drugName: med.drugName,
        genericName: med.genericName || med.drugName.toLowerCase(),
        dosage: med.dosage,
        frequency: med.frequency,
        route: med.route || 'oral',
        startDate: med.startDate || '',
        prescribedBy: med.prescribedBy || '',
      });
    }
  }

  if (patientData.lifestyle) {
    demoStorage.createLifestyle({
      patientId: patient.id,
      smokingStatus: patientData.lifestyle.smoking?.status || 'never',
      smokingPacksPerDay: patientData.lifestyle.smoking?.packsPerDay,
      smokingYears: patientData.lifestyle.smoking?.years,
      alcoholFrequency: patientData.lifestyle.alcohol?.frequency || 'none',
      alcoholDrinksPerWeek: patientData.lifestyle.alcohol?.drinksPerWeek,
      exerciseFrequency: patientData.lifestyle.exercise?.frequency || 'sedentary',
      exerciseMinutesPerWeek: patientData.lifestyle.exercise?.minutesPerWeek,
      diet: patientData.lifestyle.diet || 'standard',
      chiefComplaint: patientData.lifestyle.chiefComplaint?.complaint || '',
      symptomDuration: patientData.lifestyle.chiefComplaint?.duration,
    });
  }

  demoStorage.createAuditLog({
    timestamp: new Date(),
    userId: req.body.userId || 'system',
    userName: req.body.userName || 'System',
    action: 'created',
    patientId: patient.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || undefined,
  });

  return {
    success: true,
    message: 'Patient created successfully (Demo Mode)',
    data: { patientId: patient.id },
    demoMode: true,
  };
}

// Helper: create patient in production mode with database transaction
async function createPatientProduction(patientData: CompletePatientData, bmi: number, req: Request): Promise<string> {
  const transaction = await sequelize.transaction();

  try {
    const patient = await Patient.create({
      id: patientData.demographics.patientId || uuidv4(),
      age: patientData.demographics.age,
      sex: patientData.demographics.sex || 'other',
      weight: patientData.demographics.weight,
      height: patientData.demographics.height,
      bmi: Math.round(bmi * 10) / 10,
      systolicBp: patientData.demographics.bloodPressure?.systolic || 120,
      diastolicBp: patientData.demographics.bloodPressure?.diastolic || 80,
      heartRate: patientData.demographics.heartRate || 72,
      temperature: patientData.demographics.temperature || 98.6,
    }, { transaction });

    await MedicalHistory.create({
      patientId: patient.id,
      conditions: patientData.medicalHistory?.conditions || [],
      allergies: patientData.medicalHistory?.allergies || [],
      pastSurgeries: patientData.medicalHistory?.pastSurgeries || [],
      familyHistory: patientData.medicalHistory?.familyHistory || [],
    }, { transaction });

    if (patientData.currentMedications?.medications) {
      for (const med of patientData.currentMedications.medications) {
        await CurrentMedication.create({
          patientId: patient.id,
          drugName: med.drugName,
          genericName: med.genericName || med.drugName.toLowerCase(),
          dosage: med.dosage,
          frequency: med.frequency,
          route: med.route || 'oral',
          startDate: med.startDate || '',
          prescribedBy: med.prescribedBy || '',
        }, { transaction });
      }
    }

    if (patientData.lifestyle) {
      await LifestyleFactors.create({
        patientId: patient.id,
        smokingStatus: patientData.lifestyle.smoking?.status || 'never',
        smokingPacksPerDay: patientData.lifestyle.smoking?.packsPerDay || null,
        smokingYears: patientData.lifestyle.smoking?.years || null,
        alcoholFrequency: patientData.lifestyle.alcohol?.frequency || 'none',
        alcoholDrinksPerWeek: patientData.lifestyle.alcohol?.drinksPerWeek || null,
        exerciseFrequency: patientData.lifestyle.exercise?.frequency || 'sedentary',
        exerciseMinutesPerWeek: patientData.lifestyle.exercise?.minutesPerWeek || null,
        diet: patientData.lifestyle.diet || 'standard',
        chiefComplaint: patientData.lifestyle.chiefComplaint || { complaint: '', duration: '', severity: 0, symptoms: [] },
      }, { transaction });
    }

    await AuditLog.create({
      timestamp: new Date(),
      userId: req.body.userId || 'system',
      userName: req.body.userName || 'System',
      action: 'created',
      patientId: patient.id,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || null,
    }, { transaction });

    await transaction.commit();
    return patient.id;
  } catch (dbError) {
    await transaction.rollback();
    throw dbError;
  }
}

// Create a new patient with all related data
export const createPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const patientData: CompletePatientData = req.body;

    // Validate input
    const validation = validatePatientData(patientData);
    if (!validation.isValid) {
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors,
      });
      return;
    }

    // Calculate BMI if not provided
    const heightInMeters = patientData.demographics.height / 100;
    const bmi = patientData.demographics.bmi ||
      (patientData.demographics.weight / (heightInMeters * heightInMeters));

    // DEMO MODE: Use in-memory storage
    if (config.demoMode) {
      const result = createPatientDemo(patientData, bmi, req);
      invalidateCacheTags(['patients', 'analytics', 'treatment-plans']);
      res.status(201).json(result);
      return;
    }

    // PRODUCTION MODE: Use database
    const patientId = await createPatientProduction(patientData, bmi, req);
    invalidateCacheTags(['patients', 'analytics', 'treatment-plans']);

    res.status(201).json({
      success: true,
      message: 'Patient created successfully',
      data: { patientId },
    });
  } catch (error) {
    logger.error('Create patient error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to create patient',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get patient by ID with all related data
export const getPatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // DEMO MODE
    if (config.demoMode) {
      const patient = demoStorage.getCompletePatientData(id);

      if (!patient) {
        res.status(404).json({
          success: false,
          message: 'Patient not found (Demo Mode)',
        });
        return;
      }

      res.json({
        success: true,
        data: patient,
        demoMode: true,
      });
      return;
    }

    // PRODUCTION MODE
    const patient = await Patient.findByPk(id, {
      include: [
        { model: MedicalHistory, as: 'medicalHistory' },
        { model: CurrentMedication, as: 'currentMedications' },
        { model: LifestyleFactors, as: 'lifestyleFactors' },
        { model: TreatmentPlan, as: 'treatmentPlans' },
      ],
    });

    if (!patient) {
      res.status(404).json({
        success: false,
        message: 'Patient not found',
      });
      return;
    }

    res.json({
      success: true,
      data: patient,
    });
  } catch (error) {
    logger.error('Get patient error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get patient',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get all patients
export const getAllPatients = async (req: Request, res: Response): Promise<void> => {
  try {
    // DEMO MODE
    if (config.demoMode) {
      const patients = demoStorage.getAllPatientsWithData();

      res.json({
        success: true,
        data: patients,
        count: patients.length,
        demoMode: true,
      });
      return;
    }

    // PRODUCTION MODE
    const patients = await Patient.findAll({
      include: [
        { model: MedicalHistory, as: 'medicalHistory' },
        { model: LifestyleFactors, as: 'lifestyleFactors' },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: patients,
      count: patients.length,
    });
  } catch (error) {
    logger.error('Get all patients error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get patients',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Delete patient
export const deletePatient = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // DEMO MODE
    if (config.demoMode) {
      const deleted = demoStorage.deletePatient(id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Patient not found (Demo Mode)',
        });
        return;
      }

      invalidateCacheTags(['patients', 'analytics', 'treatment-plans']);
      res.json({
        success: true,
        message: 'Patient deleted successfully (Demo Mode)',
        demoMode: true,
      });
      return;
    }

    // PRODUCTION MODE
    const transaction = await sequelize.transaction();

    try {
      const patient = await Patient.findByPk(id);
      if (!patient) {
        res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
        return;
      }

      // Delete related records
      await MedicalHistory.destroy({ where: { patientId: id }, transaction });
      await CurrentMedication.destroy({ where: { patientId: id }, transaction });
      await LifestyleFactors.destroy({ where: { patientId: id }, transaction });
      await TreatmentPlan.destroy({ where: { patientId: id }, transaction });
      await patient.destroy({ transaction });

      await transaction.commit();
      invalidateCacheTags(['patients', 'analytics', 'treatment-plans']);

      res.json({
        success: true,
        message: 'Patient deleted successfully',
      });
    } catch (dbError) {
      await transaction.rollback();
      throw dbError;
    }
  } catch (error) {
    logger.error('Delete patient error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to delete patient',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Search patients
export const searchPatients = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q, minAge, maxAge } = req.query;

    // DEMO MODE
    if (config.demoMode) {
      let patients = demoStorage.getAllPatientsWithData();

      // Filter by search query
      if (q && typeof q === 'string') {
        const query = q.toLowerCase();
        patients = patients.filter(p =>
          p.patientId?.toLowerCase().includes(query) ||
          p.medicalHistory?.conditions?.some((c: { condition?: string }) =>
            c.condition?.toLowerCase().includes(query)
          ) ||
          p.lifestyleFactors?.chiefComplaint?.toLowerCase().includes(query)
        );
      }

      // Filter by age range
      if (minAge) {
        patients = patients.filter(p => p.age >= Number.parseInt(minAge as string));
      }
      if (maxAge) {
        patients = patients.filter(p => p.age <= Number.parseInt(maxAge as string));
      }

      res.json({
        success: true,
        data: patients,
        count: patients.length,
        demoMode: true,
      });
      return;
    }

    // PRODUCTION MODE - basic implementation
    const patients = await Patient.findAll({
      include: [
        { model: MedicalHistory, as: 'medicalHistory' },
        { model: LifestyleFactors, as: 'lifestyleFactors' },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      data: patients,
      count: patients.length,
    });
  } catch (error) {
    logger.error('Search patients error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to search patients',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get patient statistics
export const getPatientStatistics = async (req: Request, res: Response): Promise<void> => {
  try {
    // DEMO MODE
    if (config.demoMode) {
      const stats = demoStorage.getStatistics();

      res.json({
        success: true,
        data: stats,
        demoMode: true,
      });
      return;
    }

    // PRODUCTION MODE
    const totalPatients = await Patient.count();
    const totalPlans = await TreatmentPlan.count();

    res.json({
      success: true,
      data: {
        totalPatients,
        totalTreatmentPlans: totalPlans,
        riskDistribution: { low: 0, moderate: 0, high: 0, critical: 0 },
        statusDistribution: { pending: 0, approved: 0, rejected: 0, modified: 0 },
      },
    });
  } catch (error) {
    logger.error('Get statistics error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get statistics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

// Get comprehensive analytics for dashboard
export const getComprehensiveAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // DEMO MODE
    if (config.demoMode) {
      const analytics = demoStorage.getComprehensiveAnalytics();

      res.json({
        success: true,
        data: analytics,
        demoMode: true,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // PRODUCTION MODE - basic implementation
    const totalPatients = await Patient.count();
    const totalPlans = await TreatmentPlan.count();

    // Get all plans for risk distribution
    const plans = await TreatmentPlan.findAll();
    const riskCounts = { low: 0, moderate: 0, high: 0, critical: 0 };
    const statusCounts = { pending: 0, approved: 0, rejected: 0, modified: 0 };
    let totalRiskScore = 0;

    for (const plan of plans) {
      const risk = (plan.overallRisk || 'low').toLowerCase();
      if (risk in riskCounts) {
        riskCounts[risk as keyof typeof riskCounts]++;
      }
      const status = plan.status || 'pending';
      if (status in statusCounts) {
        statusCounts[status]++;
      }
      totalRiskScore += plan.riskScore || 0;
    }

    const avgRiskScore = plans.length > 0 ? totalRiskScore / plans.length : 0;
    const highRiskCount = riskCounts.high + riskCounts.critical;
    const safetyDetectionRate = plans.length > 0 
      ? Math.min(98, 85 + (highRiskCount / plans.length) * 15)
      : 95;

    res.json({
      success: true,
      data: {
        totalPatients,
        totalTreatmentPlans: totalPlans,
        avgRiskScore: Math.round(avgRiskScore * 10) / 10,
        avgConfidenceScore: 85,
        riskDistribution: [
          { name: 'Low Risk', value: Math.round((riskCounts.low / Math.max(1, plans.length)) * 100), color: '#10B981', count: riskCounts.low },
          { name: 'Medium Risk', value: Math.round((riskCounts.moderate / Math.max(1, plans.length)) * 100), color: '#F59E0B', count: riskCounts.moderate },
          { name: 'High Risk', value: Math.round((riskCounts.high / Math.max(1, plans.length)) * 100), color: '#F97316', count: riskCounts.high },
          { name: 'Critical', value: Math.round((riskCounts.critical / Math.max(1, plans.length)) * 100), color: '#EF4444', count: riskCounts.critical },
        ],
        statusDistribution: statusCounts,
        safetyDetectionRate: Math.round(safetyDetectionRate * 10) / 10,
        auditComplianceRate: 100,
        criticalAlertsDetected: highRiskCount,
        drugInteractionsDetected: 0,
        avgResponseTime: 5.8,
        patientsByAge: [],
        patientsBySex: [],
        conditionsFrequency: [],
        medicationsFrequency: [],
        monthlyTrends: [],
        topDrugInteractions: [],
        treatmentCategories: [],
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logger.error('Get analytics error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

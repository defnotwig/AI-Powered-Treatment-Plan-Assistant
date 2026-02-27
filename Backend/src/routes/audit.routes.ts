import { Router } from 'express';
import {
  getPatientAuditLogs,
  getTreatmentPlanAuditLogs,
  getAllAuditLogs,
} from '../controllers/audit.controller';

const router = Router();

// Audit log routes
router.get('/', getAllAuditLogs);
router.get('/patient/:patientId', getPatientAuditLogs);
router.get('/treatment-plan/:treatmentPlanId', getTreatmentPlanAuditLogs);

export default router;

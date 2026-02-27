import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'AI-Powered Treatment Plan Assistant API',
      version: '1.0.0',
      description:
        'Clinical decision support system that processes patient intake data through AI analysis ' +
        'to generate safety-checked, personalized treatment plans with drug interaction detection, ' +
        'contraindication flagging, and risk scoring.',
      contact: {
        name: 'API Support',
      },
      license: {
        name: 'MIT',
      },
    },
    servers: [
      {
        url: '/api/v1',
        description: 'API v1 (current)',
      },
      {
        url: '/api',
        description: 'Un-versioned (deprecated — includes Deprecation headers)',
      },
    ],
    tags: [
      { name: 'Health', description: 'Health check and monitoring' },
      { name: 'Patients', description: 'Patient records management' },
      { name: 'Treatment Plans', description: 'AI-powered treatment plan generation and management' },
      { name: 'Drug Database', description: 'Drug interactions, contraindications, and dosage guidelines' },
      { name: 'Audit Logs', description: 'Compliance and audit trail' },
      { name: 'Realtime', description: 'Server-Sent Events for live updates' },
      { name: 'ML', description: 'Machine learning model management' },
    ],
    components: {
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            correlationId: { type: 'string', format: 'uuid' },
          },
        },
        Patient: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            demographics: {
              type: 'object',
              properties: {
                age: { type: 'number', example: 67 },
                weight: { type: 'number', example: 82.5, description: 'Weight in kg' },
                height: { type: 'number', example: 175, description: 'Height in cm' },
                gender: { type: 'string', enum: ['male', 'female', 'other'] },
                bloodPressureSystolic: { type: 'number', example: 142 },
                bloodPressureDiastolic: { type: 'number', example: 88 },
                heartRate: { type: 'number', example: 76 },
                bmi: { type: 'number', example: 26.9 },
                serumCreatinine: { type: 'number', example: 1.2 },
              },
            },
            medicalHistory: {
              type: 'object',
              properties: {
                conditions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string', example: 'Hypertension' },
                      diagnosedYear: { type: 'number', example: 2018 },
                      status: { type: 'string', enum: ['active', 'resolved', 'managed'] },
                    },
                  },
                },
                allergies: { type: 'array', items: { type: 'string' }, example: ['Penicillin', 'Sulfa drugs'] },
                pastSurgeries: { type: 'array', items: { type: 'string' } },
                familyHistory: { type: 'array', items: { type: 'string' } },
              },
            },
            currentMedications: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'Lisinopril' },
                  dosage: { type: 'string', example: '10mg' },
                  frequency: { type: 'string', example: 'once daily' },
                  route: { type: 'string', example: 'oral' },
                },
              },
            },
            lifestyleFactors: {
              type: 'object',
              properties: {
                smoking: { type: 'boolean' },
                alcohol: { type: 'string', enum: ['none', 'occasional', 'moderate', 'heavy'] },
                exercise: { type: 'string', enum: ['sedentary', 'light', 'moderate', 'active'] },
                diet: { type: 'string', enum: ['poor', 'average', 'good', 'excellent'] },
                chiefComplaint: { type: 'string', example: 'Persistent chest pain' },
              },
            },
          },
        },
        TreatmentPlan: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            patientId: { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['pending', 'approved', 'rejected', 'modified'] },
            riskAssessment: {
              type: 'object',
              properties: {
                overallRisk: { type: 'string', enum: ['low', 'moderate', 'high', 'critical'] },
                riskScore: { type: 'number', example: 72 },
                confidence: { type: 'number', example: 0.87 },
              },
            },
            flaggedIssues: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', enum: ['drug_interaction', 'contraindication', 'dosage_issue', 'allergy_risk'] },
                  severity: { type: 'string', enum: ['low', 'moderate', 'high', 'critical'] },
                  description: { type: 'string' },
                  recommendation: { type: 'string' },
                },
              },
            },
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  medication: { type: 'string' },
                  dosage: { type: 'string' },
                  frequency: { type: 'string' },
                  duration: { type: 'string' },
                  rationale: { type: 'string' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        HealthCheck: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            status: { type: 'string', example: 'healthy' },
            timestamp: { type: 'string', format: 'date-time' },
            uptime: {
              type: 'object',
              properties: {
                seconds: { type: 'number' },
                human: { type: 'string', example: '2h 15m 30s' },
              },
            },
            memory: {
              type: 'object',
              properties: {
                rssMB: { type: 'number' },
                heapUsedMB: { type: 'number' },
              },
            },
            version: { type: 'string' },
            demoMode: { type: 'boolean' },
            openaiConfigured: { type: 'boolean' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(swaggerDefinition);

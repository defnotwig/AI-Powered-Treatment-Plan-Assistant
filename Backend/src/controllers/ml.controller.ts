import { Request, Response } from 'express';
import logger from '../config/logger';
import { adaptiveLearningService } from '../services/adaptive-learning.service';

export const getAdaptiveTrainingData = async (req: Request, res: Response): Promise<void> => {
  try {
    const rawLimit = req.query.limit;
    const limitStr = typeof rawLimit === 'string' ? rawLimit : '0';
    const limit = Number.parseInt(limitStr, 10);
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 2000) : undefined;

    const trainingData = adaptiveLearningService.getTrainingData(safeLimit);
    const samples = adaptiveLearningService.getSamples(safeLimit);

    res.json({
      success: true,
      data: {
        inputs: trainingData.inputs,
        outputs: trainingData.outputs,
        samples,
        stats: adaptiveLearningService.getStats(),
      },
    });
  } catch (error) {
    logger.error('Get adaptive training data error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch adaptive training data',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getAdaptiveLearningStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      data: adaptiveLearningService.getStats(),
    });
  } catch (error) {
    logger.error('Get adaptive learning stats error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to fetch adaptive learning stats',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const ingestAdaptiveSample = async (req: Request, res: Response): Promise<void> => {
  try {
    const { inputs, output, source, patientId } = req.body as {
      inputs?: number[];
      output?: number;
      source?: string;
      patientId?: string;
    };

    if (!Array.isArray(inputs) || inputs.length < 11 || typeof output !== 'number') {
      res.status(400).json({
        success: false,
        message: 'Invalid payload. Expected inputs[11] and numeric output.',
      });
      return;
    }

    const sample = adaptiveLearningService.addSample(inputs, output, source || 'manual-feedback', patientId);
    res.status(201).json({
      success: true,
      data: sample,
      stats: adaptiveLearningService.getStats(),
    });
  } catch (error) {
    logger.error('Ingest adaptive sample error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      message: 'Failed to ingest adaptive sample',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

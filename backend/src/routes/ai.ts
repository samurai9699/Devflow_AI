import express from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/rateLimiter';
import { aiService } from '../services/aiService';
import Joi from 'joi';

const router = express.Router();

const generateSchema = Joi.object({
    prompt: Joi.string().min(1).required(),
    type: Joi.string().valid('code', 'documentation', 'test', 'review').required(),
    language: Joi.string().optional(),
    context: Joi.string().optional(),
    provider: Joi.string().valid('openai', 'anthropic').default('openai'),
    maxTokens: Joi.number().min(100).max(4000).optional()
});

// Generate content with AI
router.post('/generate', authenticate, aiRateLimiter, async (req: AuthRequest, res, next) => {
    try {
        const { error, value } = generateSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { provider, ...aiRequest } = value;

        let result;
        if (provider === 'anthropic') {
            result = await aiService.generateWithAnthropic(aiRequest);
        } else {
            result = await aiService.generateWithOpenAI(aiRequest);
        }

        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
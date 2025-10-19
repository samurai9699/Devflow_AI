import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { workflowService } from '../services/workflowService';
import Joi from 'joi';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const workflowSchema = Joi.object({
    name: Joi.string().min(1).required(),
    description: Joi.string().optional(),
    steps: Joi.array().items(Joi.object({
        id: Joi.string().required(),
        type: Joi.string().valid('ai_generation', 'github_action', 'file_operation', 'webhook').required(),
        config: Joi.object().required(),
        dependencies: Joi.array().items(Joi.string()).optional()
    })).required(),
    triggers: Joi.array().items(Joi.object({
        type: Joi.string().valid('manual', 'github_pr', 'schedule').required(),
        config: Joi.object().required()
    })).required(),
    isPublic: Joi.boolean().optional()
});

// Get user workflows
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const workflows = await prisma.workflow.findMany({
            where: {
                OR: [
                    { userId: req.user!.id },
                    { isPublic: true }
                ]
            },
            include: {
                user: {
                    select: { name: true, email: true }
                },
                _count: {
                    select: { executions: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(workflows);
    } catch (error) {
        next(error);
    }
});

// Get workflow by ID
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const workflow = await prisma.workflow.findUnique({
            where: { id: req.params.id },
            include: {
                user: {
                    select: { name: true, email: true }
                },
                executions: {
                    take: 10,
                    orderBy: { startedAt: 'desc' },
                    select: {
                        id: true,
                        status: true,
                        startedAt: true,
                        completedAt: true,
                        tokensUsed: true,
                        timeTaken: true
                    }
                }
            }
        });

        if (!workflow) {
            return res.status(404).json({ error: 'Workflow not found' });
        }

        // Check access permissions
        if (workflow.userId !== req.user!.id && !workflow.isPublic) {
            return res.status(403).json({ error: 'Access denied' });
        }

        res.json(workflow);
    } catch (error) {
        next(error);
    }
});

// Create workflow
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { error, value } = workflowSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const workflow = await prisma.workflow.create({
            data: {
                ...value,
                userId: req.user!.id
            },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        });

        res.status(201).json(workflow);
    } catch (error) {
        next(error);
    }
});

// Update workflow
router.put('/:id', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { error, value } = workflowSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        // Check ownership
        const existingWorkflow = await prisma.workflow.findUnique({
            where: { id: req.params.id }
        });

        if (!existingWorkflow || existingWorkflow.userId !== req.user!.id) {
            return res.status(404).json({ error: 'Workflow not found' });
        }

        const workflow = await prisma.workflow.update({
            where: { id: req.params.id },
            data: value,
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        });

        res.json(workflow);
    } catch (error) {
        next(error);
    }
});

// Execute workflow
router.post('/:id/execute', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { input } = req.body;

        // Check subscription limits
        const subscription = await prisma.subscription.findUnique({
            where: { userId: req.user!.id }
        });

        if (!subscription) {
            return res.status(403).json({ error: 'No active subscription' });
        }

        if (subscription.monthlyExecutions >= subscription.maxMonthlyExecutions) {
            return res.status(403).json({ error: 'Monthly execution limit reached' });
        }

        const execution = await workflowService.executeWorkflow(
            req.params.id,
            req.user!.id,
            input
        );

        // Update execution count
        await prisma.subscription.update({
            where: { userId: req.user!.id },
            data: {
                monthlyExecutions: {
                    increment: 1
                }
            }
        });

        res.json(execution);
    } catch (error) {
        next(error);
    }
});

// Get workflow executions
router.get('/:id/executions', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const executions = await prisma.workflowExecution.findMany({
            where: {
                workflowId: req.params.id,
                userId: req.user!.id
            },
            skip,
            take: limit,
            orderBy: { startedAt: 'desc' },
            include: {
                workflow: {
                    select: { name: true }
                }
            }
        });

        const total = await prisma.workflowExecution.count({
            where: {
                workflowId: req.params.id,
                userId: req.user!.id
            }
        });

        res.json({
            executions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});

// Delete workflow
router.delete('/:id', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const workflow = await prisma.workflow.findUnique({
            where: { id: req.params.id }
        });

        if (!workflow || workflow.userId !== req.user!.id) {
            return res.status(404).json({ error: 'Workflow not found' });
        }

        await prisma.workflow.delete({
            where: { id: req.params.id }
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
});

export default router;
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get user analytics
router.get('/dashboard', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const userId = req.user!.id;
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Get execution stats
        const executionStats = await prisma.workflowExecution.groupBy({
            by: ['status'],
            where: {
                userId,
                startedAt: { gte: thirtyDaysAgo }
            },
            _count: { status: true }
        });

        // Get usage stats
        const usageStats = await prisma.usageTracking.aggregate({
            where: {
                userId,
                createdAt: { gte: thirtyDaysAgo }
            },
            _sum: { tokens: true, cost: true },
            _count: { action: true }
        });

        // Get workflow performance
        const topWorkflows = await prisma.workflow.findMany({
            where: { userId },
            include: {
                _count: { select: { executions: true } },
                executions: {
                    where: { startedAt: { gte: thirtyDaysAgo } },
                    select: { timeTaken: true, status: true }
                }
            },
            take: 5,
            orderBy: {
                executions: { _count: 'desc' }
            }
        });

        res.json({
            executionStats,
            usageStats,
            topWorkflows
        });
    } catch (error) {
        next(error);
    }
});

export default router;
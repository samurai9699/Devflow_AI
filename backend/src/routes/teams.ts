import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get user teams
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const teams = await prisma.team.findMany({
            where: {
                members: {
                    some: { userId: req.user!.id }
                }
            },
            include: {
                owner: { select: { name: true, email: true } },
                members: {
                    include: {
                        user: { select: { name: true, email: true } }
                    }
                },
                _count: { select: { workflows: true } }
            }
        });

        res.json(teams);
    } catch (error) {
        next(error);
    }
});

export default router;
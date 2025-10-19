import Queue from 'bull';
import Redis from 'redis';
import { PrismaClient } from '@prisma/client';
import { aiService, AIRequest } from './aiService';
import { logger } from '../utils/logger';
// Note: io will be imported dynamically to avoid circular dependency

const prisma = new PrismaClient();
const redis = Redis.createClient({ url: process.env.REDIS_URL });

// Create workflow execution queue
export const workflowQueue = new Queue('workflow execution', process.env.REDIS_URL!);

export interface WorkflowStep {
    id: string;
    type: 'ai_generation' | 'github_action' | 'file_operation' | 'webhook';
    config: any;
    dependencies?: string[];
}

export interface WorkflowDefinition {
    steps: WorkflowStep[];
    triggers: {
        type: 'manual' | 'github_pr' | 'schedule';
        config: any;
    }[];
}

class WorkflowService {
    async executeWorkflow(workflowId: string, userId: string, input?: any) {
        try {
            const workflow = await prisma.workflow.findUnique({
                where: { id: workflowId },
                include: { user: true }
            });

            if (!workflow) {
                throw new Error('Workflow not found');
            }

            // Create execution record
            const execution = await prisma.workflowExecution.create({
                data: {
                    workflowId,
                    userId,
                    input,
                    status: 'PENDING'
                }
            });

            // Add to queue for processing
            await workflowQueue.add('execute', {
                executionId: execution.id,
                workflowId,
                userId,
                steps: workflow.steps,
                input
            });

            return execution;
        } catch (error) {
            logger.error('Failed to start workflow execution:', error);
            throw error;
        }
    }

    async processWorkflowStep(step: WorkflowStep, context: any): Promise<any> {
        switch (step.type) {
            case 'ai_generation':
                return await this.processAIGeneration(step, context);
            case 'github_action':
                return await this.processGitHubAction(step, context);
            case 'file_operation':
                return await this.processFileOperation(step, context);
            case 'webhook':
                return await this.processWebhook(step, context);
            default:
                throw new Error(`Unknown step type: ${step.type}`);
        }
    }

    private async processAIGeneration(step: WorkflowStep, context: any) {
        const { prompt, type, language, provider = 'openai' } = step.config;

        const aiRequest: AIRequest = {
            prompt: this.interpolateTemplate(prompt, context),
            type,
            language,
            context: JSON.stringify(context)
        };

        let result;
        if (provider === 'anthropic') {
            result = await aiService.generateWithAnthropic(aiRequest);
        } else {
            result = await aiService.generateWithOpenAI(aiRequest);
        }

        // Track usage
        await this.trackUsage(context.userId, 'ai_generation', result.tokensUsed, result.cost);

        return {
            content: result.content,
            tokensUsed: result.tokensUsed,
            cost: result.cost
        };
    }

    private async processGitHubAction(step: WorkflowStep, context: any) {
        // GitHub integration logic
        const { action, repository, branch } = step.config;

        // This would integrate with GitHub API
        // For now, return mock data
        return {
            action,
            repository,
            branch,
            status: 'completed'
        };
    }

    private async processFileOperation(step: WorkflowStep, context: any) {
        const { operation, path, content } = step.config;

        // File operation logic (create, read, update, delete)
        return {
            operation,
            path,
            success: true
        };
    }

    private async processWebhook(step: WorkflowStep, context: any) {
        const { url, method, headers, body } = step.config;

        // Webhook call logic
        return {
            url,
            method,
            status: 200
        };
    }

    private interpolateTemplate(template: string, context: any): string {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return context[key] || match;
        });
    }

    private async trackUsage(userId: string, action: string, tokens?: number, cost?: number) {
        await prisma.usageTracking.create({
            data: {
                userId,
                action,
                tokens,
                cost,
                metadata: { timestamp: new Date() }
            }
        });
    }
}

// Queue processor
workflowQueue.process('execute', async (job) => {
    const { executionId, steps, input, userId } = job.data;
    const workflowService = new WorkflowService();

    try {
        await prisma.workflowExecution.update({
            where: { id: executionId },
            data: { status: 'RUNNING' }
        });

        // Emit real-time update (commented out to avoid circular dependency)
        // const { io } = await import('../server');
        // io.to(`workflow-${job.data.workflowId}`).emit('execution-update', {
        //     executionId,
        //     status: 'RUNNING'
        // });

        let context = { ...input, userId };
        const results = [];
        const logs = [];

        // Process steps sequentially (could be made parallel with dependency resolution)
        for (const step of steps) {
            const startTime = Date.now();

            try {
                const result = await workflowService.processWorkflowStep(step, context);
                const timeTaken = Date.now() - startTime;

                results.push(result);
                logs.push({
                    stepId: step.id,
                    status: 'completed',
                    timeTaken,
                    result
                });

                // Update context with step result
                context[step.id] = result;

            } catch (error) {
                logs.push({
                    stepId: step.id,
                    status: 'failed',
                    error: error.message
                });
                throw error;
            }
        }

        // Update execution as completed
        await prisma.workflowExecution.update({
            where: { id: executionId },
            data: {
                status: 'COMPLETED',
                output: results,
                logs,
                completedAt: new Date()
            }
        });

        // Emit completion (commented out to avoid circular dependency)
        // const { io } = await import('../server');
        // io.to(`workflow-${job.data.workflowId}`).emit('execution-update', {
        //     executionId,
        //     status: 'COMPLETED',
        //     results
        // });

    } catch (error) {
        logger.error('Workflow execution failed:', error);

        await prisma.workflowExecution.update({
            where: { id: executionId },
            data: {
                status: 'FAILED',
                error: error.message,
                completedAt: new Date()
            }
        });

        // Emit failure (commented out to avoid circular dependency)
        // const { io } = await import('../server');
        // io.to(`workflow-${job.data.workflowId}`).emit('execution-update', {
        //     executionId,
        //     status: 'FAILED',
        //     error: error.message
        // });
    }
});

export const workflowService = new WorkflowService();
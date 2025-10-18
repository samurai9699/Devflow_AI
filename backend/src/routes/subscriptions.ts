import express from 'express';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2023-10-16'
});

// Get current subscription
router.get('/current', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const subscription = await prisma.subscription.findUnique({
            where: { userId: req.user!.id }
        });

        res.json(subscription);
    } catch (error) {
        next(error);
    }
});

// Create checkout session
router.post('/checkout', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { priceId } = req.body;

        const session = await stripe.checkout.sessions.create({
            customer_email: req.user!.email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.FRONTEND_URL}/dashboard?success=true`,
            cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
            metadata: {
                userId: req.user!.id
            }
        });

        res.json({ url: session.url });
    } catch (error) {
        next(error);
    }
});

// Stripe webhook
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature']!;

    try {
        const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object as Stripe.Checkout.Session;
                await handleCheckoutCompleted(session);
                break;

            case 'invoice.payment_succeeded':
                const invoice = event.data.object as Stripe.Invoice;
                await handlePaymentSucceeded(invoice);
                break;

            case 'customer.subscription.deleted':
                const subscription = event.data.object as Stripe.Subscription;
                await handleSubscriptionCanceled(subscription);
                break;
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(400).send(`Webhook Error: ${error.message}`);
    }
});

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    const userId = session.metadata?.userId;
    if (!userId) return;

    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    await prisma.subscription.update({
        where: { userId },
        data: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            plan: getPlanFromPriceId(subscription.items.data[0].price.id),
            status: 'ACTIVE',
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            maxMonthlyExecutions: getExecutionLimit(subscription.items.data[0].price.id)
        }
    });
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
    // Handle successful payment
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
    await prisma.subscription.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
            status: 'CANCELED',
            plan: 'FREE',
            maxMonthlyExecutions: 100
        }
    });
}

function getPlanFromPriceId(priceId: string): 'FREE' | 'PRO' | 'ENTERPRISE' {
    // Map Stripe price IDs to plans
    const priceMap: Record<string, 'FREE' | 'PRO' | 'ENTERPRISE'> = {
        'price_pro_monthly': 'PRO',
        'price_enterprise_monthly': 'ENTERPRISE'
    };

    return priceMap[priceId] || 'FREE';
}

function getExecutionLimit(priceId: string): number {
    const limitMap: Record<string, number> = {
        'price_pro_monthly': 1000,
        'price_enterprise_monthly': 10000
    };

    return limitMap[priceId] || 100;
}

export default router;
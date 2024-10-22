// src/stripe/stripe.service.ts
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    }

    async createPaymentIntent(amount: number, currency: string) {
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount,
            currency,
            payment_method_types: ['card'],
        });
        return paymentIntent.client_secret;
    }
}

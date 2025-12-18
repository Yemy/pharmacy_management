// lib/stripe.ts
// Mock Stripe adapter for development and testing. Replace with real Stripe integration when ready.
export async function createPaymentIntentMock(amount: number, currency = 'php') {
  return {
    id: `pi_mock_${Date.now()}`,
    amount,
    currency,
    client_secret: `cs_mock_${Math.random().toString(36).slice(2)}`,
    status: 'requires_payment_method'
  }
}

export async function retrievePaymentMock(id: string) {
  return { id, status: 'succeeded' }
}
// Minimal mockable Stripe adapter
export async function createPaymentIntent(amount: number, currency = 'php') {
  // In production, call Stripe SDK. Here we return a mock client secret.
  return { id: `pi_mock_${Date.now()}`, client_secret: `cs_mock_${Date.now()}`, amount, currency }
}
import Stripe from 'stripe';

const stripeSecret = process.env.STRIPE_SECRET_KEY || '';

if (!stripeSecret) {
  // In production you'd throw or log properly
}

const stripe = new Stripe(stripeSecret, { apiVersion: '2022-11-15' });

export default stripe;

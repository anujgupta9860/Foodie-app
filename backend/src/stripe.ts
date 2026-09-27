// Stripe integration — STUBBED for local development.
// No real Stripe keys are needed to run the API; the orders route calls these
// functions so the wiring points are already in place.
//
// TODO (Stripe Connect, before production):
//   1. `npm install stripe` and set STRIPE_SECRET_KEY in .env.
//   2. Replace the mock returns below with real `stripe` SDK calls:
//        - createConnectedAccount -> stripe.accounts.create({ type: 'express', email, country: 'US' })
//          then generate an onboarding link via stripe.accountLinks.create(...).
//        - createPaymentIntent -> stripe.paymentIntents.create({
//              amount: amountCents, currency, customer,
//              transfer_data: { destination: <maker's connected account id> },
//              application_fee_amount: <platform commission in cents>,
//            })
//   3. Add a webhook endpoint (POST /api/webhooks/stripe) verifying the
//      Stripe signature header, and mark orders PAID / update payouts there.
//   4. Store the connected account id on Kitchen (add `stripeAccountId`).

export interface MockPaymentIntent {
  id: string;
  clientSecret: string;
  amountCents: number;
  currency: string;
  status: 'requires_payment_method';
}

export interface MockConnectedAccount {
  id: string;
  email: string;
  chargesEnabled: false;
  payoutsEnabled: false;
}

const rand = (prefix: string) =>
  `${prefix}_mock_${Math.random().toString(36).slice(2, 10)}`;

/** TODO: replace with stripe.accounts.create({ type: 'express', ... }) */
export async function createConnectedAccount(email: string): Promise<MockConnectedAccount> {
  return {
    id: rand('acct'),
    email,
    chargesEnabled: false,
    payoutsEnabled: false,
  };
}

export interface CreatePaymentIntentInput {
  amountCents: number;
  currency?: string;
  customerId?: string;
  /** Maker's Stripe connected account id — wired once Stripe Connect is live. */
  destinationAccountId?: string;
  /** Platform commission in cents — wired once Stripe Connect is live. */
  applicationFeeCents?: number;
}

/** TODO: replace with stripe.paymentIntents.create({ ... transfer_data ... }) */
export async function createPaymentIntent(
  input: CreatePaymentIntentInput,
): Promise<MockPaymentIntent> {
  return {
    id: rand('pi'),
    clientSecret: `${rand('pi')}_secret_mock`,
    amountCents: input.amountCents,
    currency: input.currency ?? 'usd',
    status: 'requires_payment_method',
  };
}


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new (await import('https://esm.sh/stripe@14.21.0')).default(
  Deno.env.get('STRIPE_SECRET_KEY') ?? '',
  {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
  }
)

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (request) => {
  const signature = request.headers.get('Stripe-Signature')
  const body = await request.text()
  let receivedEvent

  try {
    receivedEvent = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
      undefined,
      cryptoProvider
    )
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return new Response(err.message, { status: 400 })
  }

  console.log('Received event:', receivedEvent.type)

  try {
    switch (receivedEvent.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(receivedEvent.data.object)
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(receivedEvent.data.object)
        break
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(receivedEvent.data.object)
        break
      case 'invoice.payment_failed':
        await handlePaymentFailed(receivedEvent.data.object)
        break
      default:
        console.log(`Unhandled event type: ${receivedEvent.type}`)
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    return new Response('Webhook processing failed', { status: 500 })
  }

  return new Response('Webhook processed successfully', { status: 200 })
})

async function handleSubscriptionChange(subscription: any) {
  const customerId = subscription.customer
  const subscriptionId = subscription.id
  const status = subscription.status
  const currentPeriodEnd = new Date(subscription.current_period_end * 1000)
  
  // Get price to determine tier
  const priceId = subscription.items.data[0]?.price?.id
  let tier = 'free'
  
  // Map your actual Stripe price IDs to tiers
  if (priceId === 'price_1234567890abcdef') tier = 'pro'
  if (priceId === 'price_0987654321fedcba') tier = 'business'

  // Update subscriber record
  const { error } = await supabaseClient
    .from('subscribers')
    .update({
      subscribed: status === 'active',
      subscription_tier: tier,
      subscription_end: currentPeriodEnd.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Error updating subscriber:', error)
    throw error
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  const customerId = subscription.customer

  const { error } = await supabaseClient
    .from('subscribers')
    .update({
      subscribed: false,
      subscription_tier: 'free',
      subscription_end: null,
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_customer_id', customerId)

  if (error) {
    console.error('Error updating subscriber on deletion:', error)
    throw error
  }
}

async function handlePaymentSucceeded(invoice: any) {
  console.log('Payment succeeded for invoice:', invoice.id)
  // Additional logic for successful payments if needed
}

async function handlePaymentFailed(invoice: any) {
  console.log('Payment failed for invoice:', invoice.id)
  // Additional logic for failed payments if needed
}

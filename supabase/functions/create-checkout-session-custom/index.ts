import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    console.log('create-checkout-session-custom: Function called');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { priceId, userId, userEmail, successUrl, cancelUrl } = await req.json();
    console.log('create-checkout-session-custom: Request data:', { priceId, userId, userEmail });

    if (!priceId || !userId || !userEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'Payment system not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Get or create customer
    let customer
    console.log('create-checkout-session-custom: Looking up customer for user:', userId);
    
    const { data: subscriber } = await supabaseClient
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (subscriber?.stripe_customer_id) {
      console.log('create-checkout-session-custom: Found existing customer:', subscriber.stripe_customer_id);
      customer = await stripe.customers.retrieve(subscriber.stripe_customer_id)
    } else {
      console.log('create-checkout-session-custom: Creating new customer for:', userEmail);
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          user_id: userId,
        },
      })

      // Update subscriber record with Stripe customer ID
      await supabaseClient
        .from('subscribers')
        .upsert({
          user_id: userId,
          email: userEmail,
          stripe_customer_id: customer.id,
        })
    }

    console.log('create-checkout-session-custom: Creating checkout session for customer:', customer.id);
    
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      payment_method_types: ['card'],
      subscription_data: {
        metadata: {
          user_id: userId,
          app_name: 'HonestInvoice'
        }
      },
      metadata: {
        user_id: userId,
        user_email: userEmail
      }
    });

    console.log('create-checkout-session-custom: Session created successfully:', session.id);
    
    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('create-checkout-session-custom: Error occurred:', error);
    
    return new Response(
      JSON.stringify({ error: 'Unable to create checkout session' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
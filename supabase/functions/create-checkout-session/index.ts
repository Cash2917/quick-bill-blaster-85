
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token)

    if (userError || !user) {
      throw new Error('No user found')
    }

    const { priceId, successUrl, cancelUrl } = await req.json()

    const stripe = new (await import('https://esm.sh/stripe@14.21.0')).default(
      Deno.env.get('STRIPE_SECRET_KEY') ?? '',
      {
        apiVersion: '2023-10-16',
        httpClient: Stripe.createFetchHttpClient(),
      }
    )

    // Get or create customer
    let customer
    const { data: subscriber } = await supabaseClient
      .from('subscribers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (subscriber?.stripe_customer_id) {
      customer = await stripe.customers.retrieve(subscriber.stripe_customer_id)
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      })

      // Update subscriber record with Stripe customer ID
      await supabaseClient
        .from('subscribers')
        .upsert({
          user_id: user.id,
          email: user.email!,
          stripe_customer_id: customer.id,
        })
    }

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
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

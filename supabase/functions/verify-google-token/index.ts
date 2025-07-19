import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface GoogleTokenPayload {
  iss: string;
  sub: string;
  aud: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name: string;
  family_name: string;
  iat: number;
  exp: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const { credential, googleUser } = await req.json();

    if (!credential) {
      return new Response(
        JSON.stringify({ error: 'No credential provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify the Google token with Google's API
    const googleResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );

    if (!googleResponse.ok) {
      throw new Error('Invalid Google token');
    }

    const tokenData: GoogleTokenPayload = await googleResponse.json();

    // Verify the token is for our application
    const expectedAudience = Deno.env.get('GOOGLE_CLIENT_ID');
    if (tokenData.aud !== expectedAudience) {
      throw new Error('Token audience mismatch');
    }

    // Verify token hasn't expired
    const now = Math.floor(Date.now() / 1000);
    if (tokenData.exp < now) {
      throw new Error('Token has expired');
    }

    // Verify email is verified
    if (!tokenData.email_verified) {
      throw new Error('Email not verified by Google');
    }

    // Verify the token data matches what we received
    if (tokenData.sub !== googleUser.id || tokenData.email !== googleUser.email) {
      throw new Error('Token data mismatch');
    }

    console.log('Google token verified successfully for:', tokenData.email);

    return new Response(
      JSON.stringify({ 
        verified: true, 
        user: {
          id: tokenData.sub,
          email: tokenData.email,
          name: tokenData.name,
          picture: tokenData.picture,
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Token verification error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Token verification failed' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401 
      }
    );
  }
});
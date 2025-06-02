
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreateSellerUserRequest {
  email: string
  password: string
  sellerName: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🚀 [create-seller-user] Function started')

    // Get request body
    const body: CreateSellerUserRequest = await req.json()
    console.log('📧 [create-seller-user] Creating user for:', body.email)
    console.log('👤 [create-seller-user] Seller name:', body.sellerName)

    // Validate input
    if (!body.email || !body.password || !body.sellerName) {
      console.error('❌ [create-seller-user] Missing required fields')
      return new Response(
        JSON.stringify({ 
          error: 'Email, password and seller name are required',
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Supabase Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('📝 [create-seller-user] Creating user in Supabase Auth...')

    // Create user in Supabase Auth
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        role: 'vendedor',
        name: body.sellerName
      }
    })

    if (userError) {
      console.error('❌ [create-seller-user] Error creating user:', userError)
      return new Response(
        JSON.stringify({ 
          error: `Failed to create user: ${userError.message}`,
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!userData.user) {
      console.error('❌ [create-seller-user] No user data returned')
      return new Response(
        JSON.stringify({ 
          error: 'No user data returned from creation',
          success: false 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('✅ [create-seller-user] User created successfully!')
    console.log('🆔 [create-seller-user] User ID:', userData.user.id)
    console.log('📧 [create-seller-user] Email:', userData.user.email)

    // Log the operation
    const { error: logError } = await supabaseAdmin
      .from('client_user_creation_log')
      .insert({
        email_cliente: body.email,
        operation_type: 'CREATE_SELLER_USER',
        result_message: `Seller user created successfully for ${body.sellerName}`
      })

    if (logError) {
      console.warn('⚠️ [create-seller-user] Failed to log operation:', logError)
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Seller user created successfully for ${body.sellerName}`,
        user: {
          id: userData.user.id,
          email: userData.user.email,
          created_at: userData.user.created_at
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('💥 [create-seller-user] Critical error:', error)
    return new Response(
      JSON.stringify({ 
        error: `Internal server error: ${error.message}`,
        success: false 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

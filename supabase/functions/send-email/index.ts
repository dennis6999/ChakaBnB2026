import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { guestEmail, guestName, propertyName, checkIn, checkOut, totalPrice } = await req.json()

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        // Resend's free tier requires you to use their onboarding domain (or verify your own)
        // Note: Free tier only allows sending TO the email address you registered your Resend account with!
        from: 'ChakaBnB Bookings <onboarding@resend.dev>',
        to: guestEmail,
        subject: `Booking Confirmed: ${propertyName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
            <div style="background-color: #064e3b; padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Booking Confirmed! ✅</h1>
            </div>
            <div style="padding: 32px;">
                <p style="font-size: 16px; color: #1c1917;">Hi <strong>${guestName}</strong>,</p>
                <p style="font-size: 16px; color: #44403c;">You're all set for your trip to <strong>${propertyName}</strong>. Here are the details of your reservation:</p>
                
                <div style="background-color: #f5f5f4; border-radius: 8px; padding: 24px; margin: 24px 0;">
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="margin-bottom: 12px; font-size: 15px;"><strong style="color: #57534e;">Check-in:</strong> ${checkIn}</li>
                        <li style="margin-bottom: 12px; font-size: 15px;"><strong style="color: #57534e;">Check-out:</strong> ${checkOut}</li>
                        <li style="font-size: 15px;"><strong style="color: #57534e;">Total Price:</strong> KES ${totalPrice?.toLocaleString()} (Payment on Arrival)</li>
                    </ul>
                </div>

                <p style="font-size: 16px; color: #44403c;">We look forward to hosting you in Chaka! If you have any questions, you can contact the host directly through the ChakaBnB app inbox.</p>
                <br>
                <p style="font-size: 14px; color: #78716c;">- The ChakaBnB Team</p>
            </div>
          </div>
        `,
      }),
    })

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
})

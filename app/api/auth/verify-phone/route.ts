import { neon } from "@neondatabase/serverless"

const OTP_WEBHOOK_URL = "https://whatsapp-finance-agent-dg5mi7z5va-uc.a.run.app/otp/send"

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return Response.json({ error: "Teléfono requerido" }, { status: 400 })
    }

    let normalizedPhone = phoneNumber.replace(/[\D]/g, "")
    if (normalizedPhone.startsWith("51") && normalizedPhone.length >= 11) {
      normalizedPhone = normalizedPhone.slice(2)
    }

    const sql = neon(process.env.DATABASE_URL!)
    let result = await sql`SELECT id FROM users WHERE whatsapp_number = ${normalizedPhone}`
    if (result.length === 0 && phoneNumber) {
      const withCountry = `51${normalizedPhone}`
      result = await sql`SELECT id FROM users WHERE whatsapp_number = ${withCountry}`
    }

    if (result.length === 0) {
      return Response.json({ error: "Número de teléfono no registrado en el sistema" }, { status: 401 })
    }

    // Send OTP via WhatsApp webhook
    // The webhook generates and stores the OTP, then sends it via WhatsApp
    const phoneWithCountry = normalizedPhone.startsWith("51") ? normalizedPhone : `51${normalizedPhone}`
    
    try {
      const webhookResponse = await fetch(OTP_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone_number: phoneWithCountry,
        }),
      })

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text()
        console.error("OTP webhook failed:", errorText)
        return Response.json({ 
          error: "Error al enviar el código. Intenta de nuevo." 
        }, { status: 500 })
      }

      const webhookData = await webhookResponse.json()
      console.log("OTP sent successfully:", { phone: phoneWithCountry, success: webhookData.success })

    } catch (webhookError) {
      console.error("OTP webhook error:", webhookError)
      return Response.json({ 
        error: "Error al enviar el código por WhatsApp. Intenta de nuevo." 
      }, { status: 500 })
    }

    return Response.json({ 
      success: true,
      message: "Código enviado por WhatsApp"
    })
  } catch (error) {
    console.error("Phone verification error:", error)
    return Response.json({ error: "Error al verificar el teléfono" }, { status: 500 })
  }
}

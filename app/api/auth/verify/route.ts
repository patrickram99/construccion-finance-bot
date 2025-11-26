import { neon } from "@neondatabase/serverless"

export async function POST(request: Request) {
  try {
    const { phoneNumber, code } = await request.json()

    if (!phoneNumber || !code) {
      return Response.json({ error: "Teléfono y código son requeridos" }, { status: 400 })
    }

    // Normalize phone: keep digits only and strip country code (e.g., Peru +51) when present
    let normalizedPhone = phoneNumber.replace(/[\D]/g, "")
    // If the number includes Peru country code '51' (common case), drop it
    if (normalizedPhone.startsWith("51") && normalizedPhone.length >= 11) {
      normalizedPhone = normalizedPhone.slice(2)
    }

    if (normalizedPhone.length < 9) {
      return Response.json({ error: "Número de teléfono inválido" }, { status: 400 })
    }

  const sql = neon(process.env.DATABASE_URL!)

    // Try exact match first; if not found, attempt matching with country code variant for robustness
    let userResult = await sql`SELECT id, name FROM users WHERE whatsapp_number = ${normalizedPhone}`
    if (userResult.length === 0 && phoneNumber) {
      const withCountry = `51${normalizedPhone}`
      userResult = await sql`SELECT id, name FROM users WHERE whatsapp_number = ${withCountry}`
    }

    if (userResult.length === 0) {
      return Response.json({ error: "Número de teléfono no registrado en el sistema" }, { status: 401 })
    }

    const userId = userResult[0].id
    const userName = userResult[0].name

    // Debug: check what OTPs exist for this user/code (without expiry filter)
    // Database stores times in Peru timezone (America/Lima, UTC-5)
    const debugOtps = await sql`
      SELECT id, code, expires_at, used, created_at, 
             NOW() AT TIME ZONE 'America/Lima' as db_now_peru
      FROM otps 
      WHERE user_id = ${userId} 
        AND code = ${String(code).trim()}
      ORDER BY created_at DESC
      LIMIT 3
    `
    console.log("DEBUG OTP lookup", {
      userId,
      codeProvided: String(code).trim(),
      normalizedPhone,
      serverNow: new Date().toISOString(),
      matchingOtps: debugOtps,
    })

    // Use Peru timezone for comparison since DB stores Peru time
    const otpResult = await sql`
      SELECT id, created_at, expires_at FROM otps 
      WHERE user_id = ${userId} 
        AND code = ${String(code).trim()} 
        AND used = false 
        AND expires_at >= (NOW() AT TIME ZONE 'America/Lima')
      ORDER BY expires_at DESC, created_at DESC
      LIMIT 1
    `

    if (otpResult.length === 0) {
      // Minimal server-side debug context; do not leak to client.
      console.warn("OTP verification failed", {
        userId,
        now: new Date().toISOString(),
        phoneTried: normalizedPhone,
        debugOtps,
      })
      return Response.json({ error: "Código inválido o expirado" }, { status: 401 })
    }

    await sql`UPDATE otps SET used = true WHERE id = ${otpResult[0].id}`

    // Create a simple token (in production, use proper JWT)
    const token = Buffer.from(`${userId}:${Date.now()}`).toString("base64")

    return Response.json({
      token,
      userId,
      userName,
    })
  } catch (error) {
    console.error("Auth error:", error)
    return Response.json({ error: "Error en la autenticación. Intenta de nuevo." }, { status: 500 })
  }
}

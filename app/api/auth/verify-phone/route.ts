import { neon } from "@neondatabase/serverless"

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

    return Response.json({ success: true })
  } catch (error) {
    console.error("Phone verification error:", error)
    return Response.json({ error: "Error al verificar el teléfono" }, { status: 500 })
  }
}

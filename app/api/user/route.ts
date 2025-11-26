import { neon } from "@neondatabase/serverless"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return Response.json({ error: "userId es requerido" }, { status: 400 })
    }

    const sql = neon(process.env.DATABASE_URL!)
    const userIdNum = parseInt(userId, 10)

    const result = await sql`
      SELECT id, name, email, whatsapp_number
      FROM users 
      WHERE id = ${userIdNum}
      LIMIT 1
    `

    if (result.length === 0) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    return Response.json(result[0])
  } catch (error) {
    console.error("User fetch error:", error)
    return Response.json({ error: "Error al obtener datos del usuario" }, { status: 500 })
  }
}

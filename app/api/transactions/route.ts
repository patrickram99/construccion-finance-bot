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

    // Use correct column names from schema: occurred_at instead of date
    const transactions = await sql`
      SELECT 
        id, 
        user_id,
        amount, 
        currency,
        category, 
        description, 
        type, 
        occurred_at as date
      FROM transactions 
      WHERE user_id = ${userIdNum}
      ORDER BY occurred_at DESC
    `

    return Response.json(transactions)
  } catch (error) {
    console.error("Transactions error:", error)
    return Response.json({ error: "Error al obtener transacciones" }, { status: 500 })
  }
}

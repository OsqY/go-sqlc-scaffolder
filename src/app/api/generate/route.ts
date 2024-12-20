import { generateDTO, generateQueries, generateSchema } from "@/lib/sqlGenerator"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const entity = await req.json()

  const generated = {
    sql: generateSchema(entity),
    dto: generateDTO(entity),
    queries: generateQueries(entity)
  }

  return NextResponse.json(generated)
}

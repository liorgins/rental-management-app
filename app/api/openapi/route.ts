import fs from "fs"
import path from "path"

import yaml from "js-yaml"
import { NextResponse } from "next/server"

// GET /api/openapi - Serve the OpenAPI specification
export async function GET() {
  try {
    const openApiPath = path.join(process.cwd(), "openapi.yaml")
    const yamlContent = fs.readFileSync(openApiPath, "utf8")
    const openApiSpec = yaml.load(yamlContent)

    return NextResponse.json(openApiSpec, {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error) {
    console.error("Failed to load OpenAPI specification:", error)
    return NextResponse.json(
      { error: "Failed to load API specification" },
      { status: 500 }
    )
  }
}

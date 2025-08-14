import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "API Documentation - Rental Management",
  description:
    "Interactive API documentation for the Rental Management application",
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-white">{children}</div>
}

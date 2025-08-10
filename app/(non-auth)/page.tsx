import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">My Rentals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            Manage your rental properties with ease.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <a href="/dashboard">Go to Dashboard</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileCheck, FileText, FolderOpen, Users, Shield, Link2 } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
      </div>

      {/* Frameworks Section */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Frameworks</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">SOC 2 Type II</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">0 of 82 controls</span>
                    <span className="text-sm font-medium text-primary">0%</span>
                  </div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "0%" }} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow border-dashed opacity-60">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Shield className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-muted-foreground">HIPAA</h3>
                  <p className="text-sm text-muted-foreground mt-1">Coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Overview Section */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <span className="font-semibold text-foreground">Team</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">0%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">0/0 members complete</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <span className="font-semibold text-foreground">Tech</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">0%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">0/0 integrations compliant</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <span className="font-semibold text-foreground">Controls</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">0%</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">0 of 82 controls</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <span className="font-semibold text-foreground">Policies</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-foreground">0</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">Active policies</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Getting Started Section */}
      <section>
        <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Getting Started</h2>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Configure your organization</p>
                  <p className="text-sm text-muted-foreground">Set up your company profile and invite team members</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Connect integrations</p>
                  <p className="text-sm text-muted-foreground">Link AWS, GitHub, Slack and other services</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">Review SOC 2 controls</p>
                  <p className="text-sm text-muted-foreground">Map controls to your organization's processes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

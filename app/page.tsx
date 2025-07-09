import { Suspense } from "react"
import DashboardHeader from "@/components/dashboard-header"
import MetricsCards from "../components/metrics-cards"
import DemandTabs from "../components/demand-tabs"
import ProductTable from "../components/product-table"
import DemandChart from "../components/demand-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Smart Inventory Management</h1>
            <p className="text-gray-600 mt-1">AI-powered demand prediction and stock optimization</p>
          </div>
        </div>

        <Suspense fallback={<div>Loading metrics...</div>}>
          <MetricsCards />
        </Suspense>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Demand Forecast Overview</CardTitle>
                <CardDescription>7-day demand prediction trends</CardDescription>
              </CardHeader>
              <CardContent>
                <DemandChart />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Spike Alerts</CardTitle>
                <CardDescription>Upcoming demand spikes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium text-red-900">Diwali Festival</p>
                      <p className="text-sm text-red-700">Oct 24-26</p>
                    </div>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">High</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-yellow-900">Weekend Sale</p>
                      <p className="text-sm text-yellow-700">Oct 21-22</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">Medium</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <p className="font-medium text-blue-900">Back to School</p>
                      <p className="text-sm text-blue-700">Nov 1-15</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">Low</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <DemandTabs />

        <Suspense fallback={<div>Loading products...</div>}>
          <ProductTable />
        </Suspense>
      </main>
    </div>
  )
}

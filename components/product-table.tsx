import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, TrendingUp, Package } from "lucide-react"

const products = [
  {
    id: 1,
    name: "Basmati Rice 5kg",
    category: "Groceries",
    sku: "GR001-5KG",
    currentStock: 245,
    predictedDemand: "High",
    demandScore: 92,
    reorderPoint: 150,
    suggestedOrder: 500,
    riskLevel: "High",
    festivalImpact: "Diwali +340%",
  },
  {
    id: 2,
    name: "LED String Lights",
    category: "Electronics",
    sku: "EL045-LED",
    currentStock: 89,
    predictedDemand: "High",
    demandScore: 89,
    reorderPoint: 50,
    suggestedOrder: 300,
    riskLevel: "Medium",
    festivalImpact: "Diwali +280%",
  },
  {
    id: 3,
    name: "Cotton Kurta Set",
    category: "Fashion",
    sku: "FS123-CTN",
    currentStock: 156,
    predictedDemand: "Medium",
    demandScore: 67,
    reorderPoint: 100,
    suggestedOrder: 200,
    riskLevel: "Low",
    festivalImpact: "Diwali +150%",
  },
  {
    id: 4,
    name: "Sweets Gift Box",
    category: "Food",
    sku: "FD089-SWT",
    currentStock: 45,
    predictedDemand: "High",
    demandScore: 94,
    reorderPoint: 80,
    suggestedOrder: 400,
    riskLevel: "High",
    festivalImpact: "Diwali +450%",
  },
]

export default function ProductTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Package className="h-5 w-5" />
          <span>High Demand Products</span>
        </CardTitle>
        <CardDescription>
          Products with high probability of demand spikes based on our ML prediction algorithms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Product</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">SKU</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Current Stock</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Demand Score</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Festival Impact</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Suggested Order</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {product.riskLevel === "High" && <AlertTriangle className="h-5 w-5 text-red-500" />}
                        {product.riskLevel === "Medium" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                        {product.riskLevel === "Low" && <Package className="h-5 w-5 text-green-500" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm text-gray-600">{product.sku}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{product.currentStock}</span>
                      {product.currentStock < product.reorderPoint && (
                        <Badge variant="destructive" className="text-xs">
                          Low
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Progress value={product.demandScore} className="w-16" />
                      <span className="text-sm font-medium">{product.demandScore}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-1">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-green-600">{product.festivalImpact}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-medium text-blue-600">{product.suggestedOrder} units</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Order Now
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

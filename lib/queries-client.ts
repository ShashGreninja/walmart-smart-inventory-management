// Client-side API queries for the frontend components

export interface Prediction {
  id: string
  productId: string
  currentStock: number
  stockPredicted: number
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  comment: string | null
  success: boolean
  createdAt: string
  product?: {
    id: string
    productId: string
    name: string | null
    description: string | null
    category: string | null
    createdAt: string
    updatedAt: string
  }
}

export interface ProductCounts {
  high: number
  medium: number
  low: number
  critical: number
  all: number
}

export interface DashboardProduct {
  id: string
  name: string
  category: string
  sku: string
  currentStock: number
  predictedDemand: string
  demandScore: number
  reorderPoint: number
  suggestedOrder: number
  riskLevel: string
  comment: string | null
  shortfall: number
  festivalImpact: string
}

// Fetch all predictions from the API
export async function fetchAllPredictions(): Promise<Prediction[]> {
  try {
    const response = await fetch('/api/predictions')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.predictions || []
  } catch (error) {
    console.error('Error fetching predictions:', error)
    return []
  }
}

// Fetch predictions with product counts grouped by risk level
export async function fetchPredictionsWithCounts(): Promise<{
  predictions: Prediction[]
  counts: ProductCounts
}> {
  try {
    const response = await fetch('/api/predictions/dashboard')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return {
      predictions: data.predictions || [],
      counts: data.counts || { high: 0, medium: 0, low: 0, critical: 0, all: 0 }
    }
  } catch (error) {
    console.error('Error fetching predictions with counts:', error)
    return {
      predictions: [],
      counts: { high: 0, medium: 0, low: 0, critical: 0, all: 0 }
    }
  }
}

// Generate festival impact text based on comment and demand data
function generateFestivalImpact(comment: string | null, predictedDemand: number, currentStock: number): string {
  const demandMultiplier = Math.max(1, predictedDemand / currentStock)
  const increasePercent = Math.round((demandMultiplier - 1) * 100)
  
  if (comment) {
    if (comment.includes('High Temperature')) {
      return `Summer +${increasePercent}%`
    } else if (comment.includes('Low Temperature')) {
      return `Winter +${increasePercent}%`
    } else if (comment.includes('Moving Average Trend')) {
      return `Trend +${increasePercent}%`
    } else if (comment.includes('Base Demand')) {
      return `Regular +${increasePercent}%`
    }
  }
  
  // Default festival impact
  return `Forecast +${increasePercent}%`
}

// Transform prediction data to dashboard product format
export function transformPredictionToProduct(prediction: Prediction): DashboardProduct {
  const shortfall = Math.max(0, prediction.stockPredicted - prediction.currentStock)
  
  // Calculate demand score based on the prediction vs current stock ratio
  const demandScore = Math.min(100, Math.round((prediction.stockPredicted / Math.max(1, prediction.currentStock)) * 20))
  
  // Map risk levels to demand categories
  const predictedDemand = mapRiskLevelToDemand(prediction.riskLevel)
  
  // Calculate suggested order (shortfall + safety buffer)
  const suggestedOrder = shortfall > 0 ? Math.round(shortfall * 1.2) : 0
  
  // Estimate reorder point (30% of predicted demand)
  const reorderPoint = Math.round(prediction.stockPredicted * 0.3)
  
  // Generate festival impact based on comment
  const festivalImpact = generateFestivalImpact(prediction.comment, prediction.stockPredicted, prediction.currentStock)
  
  return {
    id: prediction.id,
    name: prediction.product?.name || `Product ${prediction.productId}`,
    category: prediction.product?.category || 'Unknown',
    sku: prediction.productId,
    currentStock: prediction.currentStock,
    predictedDemand,
    demandScore,
    reorderPoint,
    suggestedOrder,
    riskLevel: prediction.riskLevel,
    comment: prediction.comment,
    shortfall,
    festivalImpact
  }
}

// Map risk levels to demand categories for UI
function mapRiskLevelToDemand(riskLevel: string): string {
  switch (riskLevel) {
    case 'CRITICAL':
      return 'High'
    case 'HIGH':
      return 'High'
    case 'MEDIUM':
      return 'Medium'
    case 'LOW':
      return 'Low'
    default:
      return 'Medium'
  }
}

// Get product counts for different demand levels
export function calculateProductCounts(predictions: Prediction[]): ProductCounts {
  const counts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    all: predictions.length
  }
  
  predictions.forEach(prediction => {
    switch (prediction.riskLevel) {
      case 'CRITICAL':
        counts.critical++
        counts.high++  // Critical is also counted as high for UI
        break
      case 'HIGH':
        counts.high++
        break
      case 'MEDIUM':
        counts.medium++
        break
      case 'LOW':
        counts.low++
        break
    }
  })
  
  return counts
}

// Filter predictions by demand level
export function filterPredictionsByDemand(predictions: Prediction[], demandFilter: string): Prediction[] {
  if (demandFilter === 'all') return predictions
  
  switch (demandFilter.toLowerCase()) {
    case 'high':
      return predictions.filter(p => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH')
    case 'medium':
      return predictions.filter(p => p.riskLevel === 'MEDIUM')
    case 'low':
      return predictions.filter(p => p.riskLevel === 'LOW')
    default:
      return predictions
  }
}

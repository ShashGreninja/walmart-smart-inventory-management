import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingUp, Package } from 'lucide-react';

const products = [
	{
		id: 1,
		name: 'Basmati Rice 5kg',
		category: 'Groceries',
		sku: 'GR001-5KG',
		currentStock: 245,
		predictedDemand: 'High',
		demandScore: 92,
		reorderPoint: 150,
		suggestedOrder: 500,
		riskLevel: 'High',
		festivalImpact: 'Diwali +340%',
		comment: 'High Temperature',
	},
	{
		id: 2,
		name: 'LED String Lights',
		category: 'Electronics',
		sku: 'EL045-LED',
		currentStock: 89,
		predictedDemand: 'High',
		demandScore: 89,
		reorderPoint: 50,
		suggestedOrder: 300,
		riskLevel: 'Medium',
		festivalImpact: 'Diwali +280%',
		comment: 'Moving Average Trend',
	},
	{
		id: 3,
		name: 'Cotton Kurta Set',
		category: 'Fashion',
		sku: 'FS123-CTN',
		currentStock: 156,
		predictedDemand: 'Medium',
		demandScore: 67,
		reorderPoint: 100,
		suggestedOrder: 200,
		riskLevel: 'Low',
		festivalImpact: 'Diwali +150%',
		comment: 'Base Demand',
	},
	{
		id: 4,
		name: 'Sweets Gift Box',
		category: 'Food',
		sku: 'FD089-SWT',
		currentStock: 45,
		predictedDemand: 'High',
		demandScore: 94,
		reorderPoint: 80,
		suggestedOrder: 400,
		riskLevel: 'High',
		festivalImpact: 'Diwali +450%',
		comment: 'High Temperature',
	},
	{
		id: 5,
		name: 'Decorative Diyas',
		category: 'Home Decor',
		sku: 'HD012-DYA',
		currentStock: 120,
		predictedDemand: 'Medium',
		demandScore: 75,
		reorderPoint: 60,
		suggestedOrder: 250,
		riskLevel: 'Medium',
		festivalImpact: 'Diwali +200%',
		comment: 'Moving Average Trend',
	},
	{
		id: 6,
		name: 'Organic Honey',
		category: 'Groceries',
		sku: 'GR025-HNY',
		currentStock: 85,
		predictedDemand: 'Low',
		demandScore: 45,
		reorderPoint: 40,
		suggestedOrder: 100,
		riskLevel: 'Low',
		festivalImpact: 'Diwali +50%',
		comment: 'Base Demand',
	},
	{
		id: 7,
		name: 'Bluetooth Speaker',
		category: 'Electronics',
		sku: 'EL098-BTS',
		currentStock: 67,
		predictedDemand: 'Low',
		demandScore: 38,
		reorderPoint: 30,
		suggestedOrder: 80,
		riskLevel: 'Low',
		festivalImpact: 'Diwali +25%',
		comment: 'Low Temperature',
	},
];

interface Product {
	id: string | number;
	name: string;
	category: string;
	sku: string;
	currentStock: number;
	predictedDemand: string;
	demandScore: number;
	reorderPoint: number;
	suggestedOrder: number;
	riskLevel: string;
	comment?: string | null;
	shortfall?: number;
	festivalImpact?: string;
}

interface ProductTableProps {
	demandFilter?: string;
	products?: Product[];
}

export default function ProductTable({ demandFilter = 'all', products: propProducts }: ProductTableProps) {
	// Use provided products or fall back to default products
	const allProducts = propProducts || products;

	// Filter products based on demand level
	const filteredProducts = allProducts.filter((product) => {
		if (demandFilter === 'all') return true;
		return product.predictedDemand.toLowerCase() === demandFilter.toLowerCase();
	});

	const getTableTitle = () => {
		switch (demandFilter) {
			case 'high':
				return 'High Demand Products';
			case 'medium':
				return 'Medium Demand Products';
			case 'low':
				return 'Low Demand Products';
			default:
				return 'All Products';
		}
	};

	const getTableDescription = () => {
		switch (demandFilter) {
			case 'high':
				return 'Products with high probability of demand spikes - immediate attention required';
			case 'medium':
				return 'Products with moderate demand forecasts - monitor closely';
			case 'low':
				return 'Products with stable demand patterns - standard monitoring';
			default:
				return 'Complete inventory overview with ML-based demand predictions';
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center space-x-2">
					<Package className="h-5 w-5" />
					<span>{getTableTitle()}</span>
					<Badge variant="outline" className="ml-2">
						{filteredProducts.length} items
					</Badge>
				</CardTitle>
				<CardDescription>{getTableDescription()}</CardDescription>
			</CardHeader>
			<CardContent>
				{filteredProducts.length === 0 ? (
					<div className="text-center py-8">
						<Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
						<p className="text-gray-500">No products found for the selected filter.</p>
					</div>
				) : (
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
								{filteredProducts.map((product) => (
									<tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50">
										<td className="py-4 px-4">
											<div className="flex items-center space-x-3">
												<div className="flex-shrink-0">
													{product.riskLevel === 'High' && (
														<AlertTriangle className="h-5 w-5 text-red-500" />
													)}
													{product.riskLevel === 'Medium' && (
														<AlertTriangle className="h-5 w-5 text-yellow-500" />
													)}
													{product.riskLevel === 'Low' && (
														<Package className="h-5 w-5 text-green-500" />
													)}
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
												<Badge
													variant="outline"
													className={`text-xs ${
														product.predictedDemand === 'High'
															? 'border-red-300 text-red-700'
															: product.predictedDemand === 'Medium'
															? 'border-yellow-300 text-yellow-700'
															: 'border-green-300 text-green-700'
													}`}
												>
													{product.predictedDemand}
												</Badge>
											</div>
										</td>
										<td className="py-4 px-4">
											<div className="flex flex-col space-y-1">
												<div className="flex items-center space-x-1">
													<TrendingUp className="h-4 w-4 text-green-500" />
													<span className="text-sm font-medium text-green-600">
														{product.festivalImpact || 'No forecast'}
													</span>
												</div>
												{product.comment && (
													<div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
														{product.comment}
													</div>
												)}
											</div>
										</td>
										<td className="py-4 px-4">
											<span className="font-medium text-blue-600">
												{product.suggestedOrder} units
											</span>
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
				)}
			</CardContent>
		</Card>
	);
}

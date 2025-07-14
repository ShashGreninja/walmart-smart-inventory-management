import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertTriangle, Package, DollarSign } from 'lucide-react';

const metrics = [
	{
		title: 'High Demand Products',
		value: '9',
		change: '+23% from last week',
		trend: 'up',
		icon: TrendingUp,
		color: 'text-red-600',
		bgColor: 'bg-red-50',
	},
	{
		title: 'Predicted Revenue Impact',
		value: '₹2.4M',
		change: '+15% from forecast',
		trend: 'up',
		icon: DollarSign,
		color: 'text-green-600',
		bgColor: 'bg-green-50',
	},
	{
		title: 'Stock Optimization Score',
		value: '87.3%',
		change: '+5.2% from last month',
		trend: 'up',
		icon: Package,
		color: 'text-blue-600',
		bgColor: 'bg-blue-50',
	},
	{
		title: 'Supply Risk Alerts',
		value: '12',
		change: '-8 from yesterday',
		trend: 'down',
		icon: AlertTriangle,
		color: 'text-orange-600',
		bgColor: 'bg-orange-50',
	},
];

export default function MetricsCards() {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
			{metrics.map((metric, index) => {
				const Icon = metric.icon;
				return (
					<Card key={index} className="relative overflow-hidden">
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-gray-600">{metric.title}</CardTitle>
							<div className={`p-2 rounded-lg ${metric.bgColor}`}>
								<Icon className={`h-4 w-4 ${metric.color}`} />
							</div>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-gray-900">{metric.value}</div>
							<div className="flex items-center mt-1">
								{metric.trend === 'up' ? (
									<TrendingUp className="h-3 w-3 text-green-500 mr-1" />
								) : (
									<TrendingDown className="h-3 w-3 text-green-500 mr-1" />
								)}
								<p className="text-xs text-green-600">{metric.change}</p>
							</div>
						</CardContent>
					</Card>
				);
			})}
		</div>
	);
}

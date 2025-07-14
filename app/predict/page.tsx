import InventoryPredictor from '@/components/inventory-predictor';
import DashboardHeader from '@/components/dashboard-header';

export default function PredictPage() {
	return (
		<div className="min-h-screen bg-gray-50">
			<DashboardHeader />

			<main className="container mx-auto px-4 py-6">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-2">AI Inventory Prediction</h1>
					<p className="text-xl text-gray-600">
						Get intelligent demand forecasts and stock optimization recommendations
					</p>
				</div>

				<InventoryPredictor />
			</main>
		</div>
	);
}

import InventoryPredictor from '@/components/inventory-predictor';

export default function PredictPage() {
	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="container mx-auto px-4">
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-2">Smart Inventory Management</h1>
					<p className="text-xl text-gray-600">Get AI-powered inventory predictions for your products</p>
				</div>

				<InventoryPredictor />
			</div>
		</div>
	);
}

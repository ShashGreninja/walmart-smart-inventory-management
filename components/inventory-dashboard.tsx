'use client';

import { useState, useEffect, useMemo } from 'react';
import DemandTabs from './demand-tabs';
import ProductTable from './product-table';
import {
	fetchPredictionsWithCounts,
	transformPredictionToProduct,
	filterPredictionsByDemand,
	type Prediction,
	type ProductCounts,
	type DashboardProduct,
} from '@/lib/queries-client';

export default function InventoryDashboard() {
	const [demandFilter, setDemandFilter] = useState<string>('all');
	const [predictions, setPredictions] = useState<Prediction[]>([]);
	const [productCounts, setProductCounts] = useState<ProductCounts>({
		high: 0,
		medium: 0,
		low: 0,
		critical: 0,
		all: 0,
	});
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Fetch predictions from database
	useEffect(() => {
		async function loadPredictions() {
			try {
				setLoading(true);
				setError(null);

				const { predictions: fetchedPredictions, counts } = await fetchPredictionsWithCounts();

				setPredictions(fetchedPredictions);
				setProductCounts(counts);

				console.log(`Loaded ${fetchedPredictions.length} predictions from database`);
			} catch (err) {
				console.error('Error loading predictions:', err);
				setError('Failed to load predictions from database');
			} finally {
				setLoading(false);
			}
		}

		loadPredictions();
	}, []);

	// Transform and filter predictions for display
	const products = useMemo(() => {
		if (!predictions.length) return [];

		const filteredPredictions = filterPredictionsByDemand(predictions, demandFilter);
		return filteredPredictions.map(transformPredictionToProduct);
	}, [predictions, demandFilter]);

	const handleFilterChange = (filter: string) => {
		setDemandFilter(filter);
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="animate-pulse">
					<div className="h-12 bg-gray-200 rounded-md mb-6"></div>
					<div className="h-64 bg-gray-200 rounded-md"></div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div className="bg-red-50 border border-red-200 rounded-md p-4">
					<h3 className="text-red-800 font-medium">Error Loading Data</h3>
					<p className="text-red-600 text-sm mt-1">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Database Status Indicator */}
			<div className="bg-green-50 border border-green-200 rounded-md p-3">
				<div className="flex items-center space-x-2">
					<div className="w-2 h-2 bg-green-500 rounded-full"></div>
					<span className="text-green-800 text-sm font-medium">
						Live data from database: {predictions.length} predictions loaded
					</span>
				</div>
			</div>

			{/* Demand Filter Tabs */}
			<DemandTabs onFilterChange={handleFilterChange} productCounts={productCounts} />

			{/* Filtered Product Table */}
			<ProductTable demandFilter={demandFilter} products={products} />
		</div>
	);
}

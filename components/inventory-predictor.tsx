'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PredictionResult {
	success: boolean;
	data: any;
	productId: string;
	currentStock: number;
}

interface PredictionError {
	error: string;
}

export default function InventoryPredictor() {
	const [productId, setProductId] = useState('');
	const [currentStock, setCurrentStock] = useState('');
	const [loading, setLoading] = useState(false);
	const [batchLoading, setBatchLoading] = useState(false);
	const [result, setResult] = useState<PredictionResult | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [batchResult, setBatchResult] = useState<any>(null);
	const [batchError, setBatchError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!productId || !currentStock) {
			setError('Please fill in all fields');
			return;
		}

		const stockNumber = parseInt(currentStock);
		if (isNaN(stockNumber) || stockNumber < 0) {
			setError('Current stock must be a valid positive number');
			return;
		}

		setLoading(true);
		setError(null);
		setResult(null);

		try {
			const response = await fetch('/api/predict', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					productId: productId.trim(),
					currentStock: stockNumber,
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to get prediction');
			}

			setResult(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An unexpected error occurred');
		} finally {
			setLoading(false);
		}
	};

	const handleReset = () => {
		setProductId('');
		setCurrentStock('');
		setResult(null);
		setError(null);
	};

	const handleBatchPredict = async () => {
		setBatchLoading(true);
		setBatchError(null);
		setBatchResult(null);

		try {
			const response = await fetch('/api/batch-predict', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || 'Failed to run batch prediction');
			}

			setBatchResult(data);
		} catch (err) {
			setBatchError(err instanceof Error ? err.message : 'An unexpected error occurred');
		} finally {
			setBatchLoading(false);
		}
	};

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<Card>
				<CardHeader>
					<CardTitle className="text-2xl font-bold text-center">Inventory Prediction</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="productId" className="text-sm font-medium">
								Product ID
							</label>
							<Input
								id="productId"
								type="text"
								placeholder="Enter product ID (e.g., PROD-123)"
								value={productId}
								onChange={(e) => setProductId(e.target.value)}
								disabled={loading}
								className="w-full"
							/>
						</div>

						<div className="space-y-2">
							<label htmlFor="currentStock" className="text-sm font-medium">
								Current Stock Level
							</label>
							<Input
								id="currentStock"
								type="number"
								placeholder="Enter current stock quantity"
								value={currentStock}
								onChange={(e) => setCurrentStock(e.target.value)}
								disabled={loading}
								min="0"
								className="w-full"
							/>
						</div>

						<div className="flex gap-3">
							<Button type="submit" disabled={loading} className="flex-1">
								{loading ? 'Predicting...' : 'Get Prediction'}
							</Button>
							<Button type="button" variant="outline" onClick={handleReset} disabled={loading}>
								Reset
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			{/* Batch Prediction Card */}
			<Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
				<CardHeader>
					<CardTitle className="text-lg text-blue-800">Batch Prediction</CardTitle>
					<p className="text-sm text-blue-600">
						Run AI predictions for all products in the database and update the prediction records.
					</p>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="bg-white/70 p-4 rounded-lg border border-blue-200">
							<h4 className="font-medium text-blue-800 mb-2">What this does:</h4>
							<ul className="text-sm text-blue-700 space-y-1">
								<li>• Fetches all products from the database</li>
								<li>• Runs AI predictions for each product using current stock levels</li>
								<li>• Updates the prediction database with new results</li>
								<li>• Calculates risk levels (Critical, High, Medium, Low)</li>
							</ul>
						</div>

						<Button
							onClick={handleBatchPredict}
							disabled={batchLoading || loading}
							className="w-full bg-blue-600 hover:bg-blue-700"
						>
							{batchLoading ? 'Running Batch Prediction...' : 'Run Batch Prediction'}
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Batch Error Display */}
			{batchError && (
				<Card className="border-red-200 bg-red-50">
					<CardContent className="pt-6">
						<div className="flex items-center gap-2">
							<Badge variant="destructive">Batch Error</Badge>
							<span className="text-red-700">{batchError}</span>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Batch Results Display */}
			{batchResult && (
				<Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<Badge variant="default" className="bg-green-600">
								Success
							</Badge>
							Batch Prediction Results
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						{/* Summary Stats */}
						<div className="bg-white/70 p-4 rounded-lg border border-green-200">
							<h4 className="font-medium text-gray-800 mb-3">Summary</h4>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								<div className="text-center p-3 bg-white rounded border">
									<div className="text-2xl font-bold text-blue-600">
										{batchResult.summary?.totalProducts || 0}
									</div>
									<div className="text-xs text-gray-500 uppercase tracking-wide">Total Products</div>
								</div>
								<div className="text-center p-3 bg-white rounded border">
									<div className="text-2xl font-bold text-green-600">
										{batchResult.summary?.successfulPredictions || 0}
									</div>
									<div className="text-xs text-gray-500 uppercase tracking-wide">Successful</div>
								</div>
								<div className="text-center p-3 bg-white rounded border">
									<div className="text-2xl font-bold text-red-600">
										{batchResult.summary?.failedPredictions || 0}
									</div>
									<div className="text-xs text-gray-500 uppercase tracking-wide">Failed</div>
								</div>
								<div className="text-center p-3 bg-white rounded border">
									<div className="text-2xl font-bold text-purple-600">
										{batchResult.summary?.successRate || '0%'}
									</div>
									<div className="text-xs text-gray-500 uppercase tracking-wide">Success Rate</div>
								</div>
							</div>
						</div>

						{/* Risk Distribution */}
						{batchResult.summary?.riskDistribution && (
							<div className="bg-white/70 p-4 rounded-lg border border-green-200">
								<h4 className="font-medium text-gray-800 mb-3">Risk Distribution</h4>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
									{Object.entries(batchResult.summary.riskDistribution).map(([risk, count]) => (
										<div key={risk} className="text-center p-3 bg-white rounded border">
											<div
												className={`text-lg font-bold ${
													risk === 'CRITICAL'
														? 'text-red-600'
														: risk === 'HIGH'
														? 'text-orange-600'
														: risk === 'MEDIUM'
														? 'text-yellow-600'
														: 'text-green-600'
												}`}
											>
												{count as number}
											</div>
											<div className="text-xs text-gray-500 uppercase tracking-wide">{risk}</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Sample Results */}
						{batchResult.results && batchResult.results.length > 0 && (
							<div className="bg-white/70 p-4 rounded-lg border border-green-200">
								<h4 className="font-medium text-gray-800 mb-3">
									Sample Results ({batchResult.results.length} shown)
								</h4>
								<div className="space-y-2 max-h-64 overflow-y-auto">
									{batchResult.results.map((item: any, index: number) => (
										<div
											key={index}
											className="bg-white p-3 rounded border-l-4 border-l-blue-500 text-sm"
										>
											<div className="flex justify-between items-center">
												<span className="font-mono font-medium">{item.productId}</span>
												<Badge
													variant={
														item.riskLevel === 'CRITICAL'
															? 'destructive'
															: item.riskLevel === 'HIGH'
															? 'secondary'
															: 'default'
													}
												>
													{item.riskLevel}
												</Badge>
											</div>
											<div className="text-gray-600 mt-1">
												Stock: {item.currentStock} → Predicted: {item.stockPredicted}
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						<div className="text-sm text-gray-600 bg-white/50 p-3 rounded">
							<strong>Execution Time:</strong> {batchResult.summary?.executionTime || 'N/A'}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Error Display */}
			{error && (
				<Card className="border-red-200 bg-red-50">
					<CardContent className="pt-6">
						<div className="flex items-center gap-2">
							<Badge variant="destructive">Error</Badge>
							<span className="text-red-700">{error}</span>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Results Display */}
			{result && (
				<Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
					<CardHeader>
						<CardTitle className="text-lg flex items-center gap-2">
							<Badge variant="default" className="bg-green-600">
								✓ Success
							</Badge>
							Inventory Prediction Results
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						{/* Input Summary */}
						<div className="bg-white/70 p-4 rounded-lg border border-green-200">
							<h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
								📦 Product Information
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
										<span className="text-blue-600 font-semibold text-sm">ID</span>
									</div>
									<div>
										<p className="text-xs text-gray-500 uppercase tracking-wide">Product ID</p>
										<p className="font-mono font-semibold text-gray-800">{result.productId}</p>
									</div>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
										<span className="text-orange-600 font-semibold text-sm">📊</span>
									</div>
									<div>
										<p className="text-xs text-gray-500 uppercase tracking-wide">Current Stock</p>
										<p className="font-semibold text-gray-800">{result.currentStock} units</p>
									</div>
								</div>
							</div>
						</div>

						{/* Prediction Results */}
						<div className="bg-white/70 p-4 rounded-lg border border-green-200">
							<h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
								🤖 AI Prediction Analysis
							</h3>

							{/* Check if result.data is an array and has prediction data */}
							{Array.isArray(result.data) && result.data.length > 0 ? (
								<div className="space-y-3">
									{result.data.map((item: any, index: number) => (
										<div key={index} className="bg-white p-3 rounded border-l-4 border-l-blue-500">
											<div className="flex justify-between items-start">
												<div className="flex-1">
													<p className="text-sm text-gray-600">Prediction #{index + 1}</p>
													{typeof item === 'object' ? (
														<div className="mt-2 space-y-1">
															{Object.entries(item).map(([key, value]) => (
																<div key={key} className="flex justify-between">
																	<span className="text-sm font-medium text-gray-700 capitalize">
																		{key.replace(/_/g, ' ')}:
																	</span>
																	<span className="text-sm text-gray-900 font-mono">
																		{typeof value === 'number'
																			? value.toFixed(2)
																			: String(value)}
																	</span>
																</div>
															))}
														</div>
													) : (
														<p className="text-sm text-gray-900 font-mono mt-1">
															{String(item)}
														</p>
													)}
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="bg-white p-4 rounded border">
									<div className="text-center">
										<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
											<span className="text-blue-600 text-xl">📈</span>
										</div>
										<h4 className="font-medium text-gray-800 mb-2">Raw Prediction Data</h4>
										<div className="bg-gray-50 p-3 rounded text-left">
											<code className="text-sm text-gray-700">
												{typeof result.data === 'object'
													? JSON.stringify(result.data, null, 2)
													: String(result.data)}
											</code>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Summary Stats */}
						<div className="bg-white/70 p-4 rounded-lg border border-green-200">
							<h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
								📊 Quick Summary
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div className="text-center p-3 bg-white rounded border">
									<div className="text-2xl font-bold text-blue-600">{result.currentStock}</div>
									<div className="text-xs text-gray-500 uppercase tracking-wide">Current Stock</div>
								</div>
								<div className="text-center p-3 bg-white rounded border">
									<div className="text-2xl font-bold text-green-600">
										{Array.isArray(result.data) ? result.data.length : '1'}
									</div>
									<div className="text-xs text-gray-500 uppercase tracking-wide">Predictions</div>
								</div>
								<div className="text-center p-3 bg-white rounded border">
									<div className="text-2xl font-bold text-purple-600">✓</div>
									<div className="text-xs text-gray-500 uppercase tracking-wide">Status</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Loading State */}
			{loading && (
				<Card>
					<CardContent className="pt-6">
						<div className="flex items-center justify-center space-x-2">
							<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
							<span className="text-gray-600">Processing prediction...</span>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

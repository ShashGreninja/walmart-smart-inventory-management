import { NextRequest, NextResponse } from 'next/server';
import { predictionQueries } from '@/lib/queries';
import { RiskLevel } from '@prisma/client';

interface PredictionResult {
	success: boolean;
	data: any;
	productId: string;
	currentStock: number;
	error?: string;
}

interface BatchResult {
	timestamp: string;
	totalRequests: number;
	successfulRequests: number;
	failedRequests: number;
	results: PredictionResult[];
	executionTime: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// Parse prediction data to extract stock prediction and risk level
const parsePredictionData = (data: any): { stockPredicted: number; riskLevel: RiskLevel; comment: string } => {
	if (!data || !Array.isArray(data) || data.length === 0) {
		throw new Error('Invalid prediction data format');
	}

	const predictionText = data[0] as string;

	// Extract stock prediction (number before "units")
	const stockMatch = predictionText.match(/📊\s*(\d+)\s*units/);
	const stockPredicted = stockMatch ? parseInt(stockMatch[1]) : 0;

	// Extract risk level
	let riskLevel: RiskLevel = 'MEDIUM';
	if (predictionText.includes('Critical risk')) {
		riskLevel = 'CRITICAL';
	} else if (predictionText.includes('High risk')) {
		riskLevel = 'HIGH';
	} else if (predictionText.includes('Low risk')) {
		riskLevel = 'LOW';
	}

	// Extract comment (everything after the risk level)
	const commentMatch = predictionText.match(/(?:Critical|High|Medium|Low)\s*risk,\s*(.+)$/);
	const comment = commentMatch ? commentMatch[1] : 'No additional context';

	return { stockPredicted, riskLevel, comment };
};

// Generate random stock levels for testing (you can modify this logic)
const generateRandomStock = (): number => {
	return Math.floor(Math.random() * 100) + 1; // Random number between 1 and 100
};

const delay = (ms: number): Promise<void> => {
	return new Promise((resolve) => setTimeout(resolve, ms));
};

const makePredictionRequest = async (productId: string, currentStock: number): Promise<PredictionResult> => {
	try {
		console.log(`Making request for ${productId} with stock ${currentStock}...`);

		const response = await fetch(`${API_BASE_URL}/api/predict`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				productId,
				currentStock,
			}),
		});

		const data = await response.json();

		if (!response.ok) {
			// Save failed prediction to database
			try {
				await predictionQueries.upsertPrediction({
					productId,
					currentStock,
					stockPredicted: 0,
					riskLevel: 'MEDIUM',
					success: false,
				});
			} catch (dbError) {
				console.error(`Failed to save failed prediction for ${productId}:`, dbError);
			}

			return {
				success: false,
				data: null,
				productId,
				currentStock,
				error: data.error || `HTTP ${response.status}`,
			};
		}

		// Parse prediction data and save to database
		try {
			const { stockPredicted, riskLevel, comment } = parsePredictionData(data.data);

			await predictionQueries.upsertPrediction({
				productId,
				currentStock,
				stockPredicted,
				riskLevel,
				comment,
				success: true,
			});

			console.log(`✅ Saved/Updated prediction for ${productId} in database`);
		} catch (parseError) {
			console.error(`Failed to parse/save prediction for ${productId}:`, parseError);

			// Save with default values if parsing fails
			await predictionQueries.upsertPrediction({
				productId,
				currentStock,
				stockPredicted: 0,
				riskLevel: 'MEDIUM',
				success: false,
			});
		}

		return {
			success: true,
			data: data.data,
			productId,
			currentStock,
		};
	} catch (error) {
		// Save failed prediction to database
		try {
			await predictionQueries.upsertPrediction({
				productId,
				currentStock,
				stockPredicted: 0,
				riskLevel: 'MEDIUM',
				success: false,
			});
		} catch (dbError) {
			console.error(`Failed to save failed prediction for ${productId}:`, dbError);
		}

		return {
			success: false,
			data: null,
			productId,
			currentStock,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
};

const runBatchPredictions = async (): Promise<any> => {
	const startTime = Date.now();
	const timestamp = new Date().toISOString();

	console.log(`🚀 Starting batch predictions at ${timestamp}`);
	console.log('='.repeat(50));

	const results: PredictionResult[] = [];
	let successCount = 0;
	let failCount = 0;

	// Loop through P001 to P040
	for (let i = 1; i <= 40; i++) {
		const productId = `P${i.toString().padStart(3, '0')}`; // P001, P002, etc.
		const currentStock = generateRandomStock();

		try {
			const result = await makePredictionRequest(productId, currentStock);
			results.push(result);

			if (result.success) {
				successCount++;
				console.log(`${productId}: Success - Saved to database`);
			} else {
				failCount++;
				console.log(`${productId}: Failed - ${result.error}`);
			}
		} catch (error) {
			failCount++;
			const errorResult: PredictionResult = {
				success: false,
				data: null,
				productId,
				currentStock,
				error: error instanceof Error ? error.message : 'Request failed',
			};
			results.push(errorResult);
			console.log(`${productId}: Request failed - ${error}`);
		}

		// Add a small delay between requests to avoid overwhelming the server
		await delay(500); // 500ms delay
	}

	const endTime = Date.now();
	const executionTime = `${(endTime - startTime) / 1000} seconds`;

	// Console output
	console.log('='.repeat(50));
	console.log('📊 BATCH PREDICTION COMPLETED');
	console.log('='.repeat(50));
	console.log(`Successful predictions: ${successCount}`);
	console.log(`Failed predictions: ${failCount}`);
	console.log(`📈 Success rate: ${((successCount / 40) * 100).toFixed(2)}%`);
	console.log(`⏱️  Total execution time: ${executionTime}`);
	console.log(`💾 All predictions saved to database`);

	// Get prediction statistics from database
	try {
		const stats = await predictionQueries.getPredictionStats();
		console.log(`📊 Database Statistics:`);
		console.log(`   Total predictions in DB: ${stats.total}`);
		console.log(`   Success rate: ${stats.successRate.toFixed(2)}%`);
		console.log(`   Risk distribution:`, stats.riskDistribution);
	} catch (error) {
		console.error('Failed to get prediction statistics:', error);
	}

	// Return batch summary for API calls
	const formattedResults = results
		.filter((r) => r.success && r.data)
		.slice(0, 10)
		.map((r) => {
			try {
				const { stockPredicted, riskLevel } = parsePredictionData(r.data);
				return {
					productId: r.productId,
					currentStock: r.currentStock,
					stockPredicted,
					riskLevel,
					success: r.success,
				};
			} catch {
				return {
					productId: r.productId,
					currentStock: r.currentStock,
					stockPredicted: 0,
					riskLevel: 'MEDIUM',
					success: false,
				};
			}
		});

	return {
		totalProducts: 40,
		successfulPredictions: successCount,
		failedPredictions: failCount,
		successRate: `${((successCount / 40) * 100).toFixed(2)}%`,
		executionTime,
		results: formattedResults,
	};
};

// HTTP POST endpoint to trigger batch predictions
export async function POST(request: NextRequest) {
	try {
		console.log('Starting batch predictions via API...');
		const batchSummary = await runBatchPredictions();

		// Get latest statistics from database
		const stats = await predictionQueries.getPredictionStats();

		return NextResponse.json({
			success: true,
			message: 'Batch predictions completed successfully',
			summary: {
				...batchSummary,
				riskDistribution: stats.riskDistribution,
			},
			statistics: stats,
		});
	} catch (error) {
		console.error('Batch prediction API error:', error);
		return NextResponse.json(
			{
				success: false,
				error: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

// HTTP GET endpoint to get batch prediction info
export async function GET() {
	try {
		const stats = await predictionQueries.getPredictionStats();

		return NextResponse.json({
			message: 'Batch Prediction API',
			description: 'Run batch predictions for products P001-P040',
			endpoints: {
				POST: '/api/batch-predict - Run batch predictions',
				GET: '/api/batch-predict - Get prediction statistics',
			},
			currentStatistics: stats,
		});
	} catch (error) {
		return NextResponse.json(
			{
				error: 'Failed to get statistics',
				message: error instanceof Error ? error.message : 'Unknown error',
			},
			{ status: 500 }
		);
	}
}

// Run the batch predictions
if (require.main === module) {
	runBatchPredictions()
		.then((result) => {
			console.log('Batch predictions completed with summary:', result);
			process.exit(0);
		})
		.catch((error) => {
			console.error('Batch prediction failed:', error);
			process.exit(1);
		});
}

export { runBatchPredictions, makePredictionRequest };

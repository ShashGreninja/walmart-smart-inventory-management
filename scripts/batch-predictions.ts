import fs from 'fs';
import path from 'path';

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

const API_BASE_URL = 'http://localhost:3000'; // Change this if your server runs on a different port
const OUTPUT_FILE = 'batch_predictions.json';
const OUTPUT_DIR = 'batch_results';

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
			return {
				success: false,
				data: null,
				productId,
				currentStock,
				error: data.error || `HTTP ${response.status}`,
			};
		}

		return {
			success: true,
			data: data.data,
			productId,
			currentStock,
		};
	} catch (error) {
		return {
			success: false,
			data: null,
			productId,
			currentStock,
			error: error instanceof Error ? error.message : 'Unknown error',
		};
	}
};

const runBatchPredictions = async (): Promise<void> => {
	const startTime = Date.now();
	const timestamp = new Date().toISOString();

	console.log(`🚀 Starting batch predictions at ${timestamp}`);
	console.log('='.repeat(50));

	const results: PredictionResult[] = [];
	let successCount = 0;
	let failCount = 0;

	// Create output directory if it doesn't exist
	if (!fs.existsSync(OUTPUT_DIR)) {
		fs.mkdirSync(OUTPUT_DIR, { recursive: true });
	}

	// Loop through P001 to P040
	for (let i = 1; i <= 40; i++) {
		const productId = `P${i.toString().padStart(3, '0')}`; // P001, P002, etc.
		const currentStock = generateRandomStock();

		try {
			const result = await makePredictionRequest(productId, currentStock);
			results.push(result);

			if (result.success) {
				successCount++;
				console.log(`✅ ${productId}: Success`);
			} else {
				failCount++;
				console.log(`❌ ${productId}: Failed - ${result.error}`);
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
			console.log(`❌ ${productId}: Request failed - ${error}`);
		}

		// Add a small delay between requests to avoid overwhelming the server
		await delay(500); // 500ms delay
	}

	const endTime = Date.now();
	const executionTime = `${(endTime - startTime) / 1000} seconds`;

	// Prepare batch result
	const batchResult: BatchResult = {
		timestamp,
		totalRequests: 40,
		successfulRequests: successCount,
		failedRequests: failCount,
		results,
		executionTime,
	};

	// Save to JSON file
	const outputPath = path.join(OUTPUT_DIR, OUTPUT_FILE);
	fs.writeFileSync(outputPath, JSON.stringify(batchResult, null, 2));

	// Save summary to a separate file
	const summaryPath = path.join(OUTPUT_DIR, 'batch_summary.txt');
	const summary = `
Batch Prediction Summary
========================
Timestamp: ${timestamp}
Total Requests: ${batchResult.totalRequests}
Successful: ${batchResult.successfulRequests}
Failed: ${batchResult.failedRequests}
Success Rate: ${((batchResult.successfulRequests / batchResult.totalRequests) * 100).toFixed(2)}%
Execution Time: ${batchResult.executionTime}

Product Range: P001 to P040
Output Files:
- Detailed Results: ${outputPath}
- Summary: ${summaryPath}
`;

	fs.writeFileSync(summaryPath, summary);

	// Console output
	console.log('='.repeat(50));
	console.log('📊 BATCH PREDICTION COMPLETED');
	console.log('='.repeat(50));
	console.log(`✅ Successful predictions: ${successCount}`);
	console.log(`❌ Failed predictions: ${failCount}`);
	console.log(`📈 Success rate: ${((successCount / 40) * 100).toFixed(2)}%`);
	console.log(`⏱️  Total execution time: ${executionTime}`);
	console.log(`📁 Results saved to: ${outputPath}`);
	console.log(`📄 Summary saved to: ${summaryPath}`);
};

// Run the batch predictions
if (require.main === module) {
	runBatchPredictions().catch((error) => {
		console.error('❌ Batch prediction failed:', error);
		process.exit(1);
	});
}

export { runBatchPredictions, makePredictionRequest };

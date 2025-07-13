#!/usr/bin/env node

import { runBatchPredictions } from './batch-predictions.js';

console.log('Walmart Smart Inventory - Batch Prediction Runner');
console.log('This script will test predictions for products P001 to P040\n');

// Check if server is likely running
const checkServer = async (): Promise<boolean> => {
	try {
		const response = await fetch('http://localhost:3000/api/predict');
		return response.status !== 0;
	} catch {
		return false;
	}
};

const main = async () => {
	console.log('🔍 Checking if server is running...');

	const serverRunning = await checkServer();
	if (!serverRunning) {
		console.log("Warning: Server doesn't appear to be running on http://localhost:3000");
		console.log('Make sure to start your Next.js server first with: npm run dev\n');
	} else {
		console.log('Server is running!\n');
	}

	await runBatchPredictions();
};

main().catch(console.error);

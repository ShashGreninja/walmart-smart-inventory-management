import { PrismaClient, RiskLevel } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

// Function to parse prediction data from batch results
function parsePredictionData(dataString: string) {
	// Extract predicted units from string like "📊 942 units, Critical risk, High Temperature"
	const unitsMatch = dataString.match(/📊 (\d+) units/);
	const riskMatch = dataString.match(/(Critical|High|Medium|Low) risk/);

	// Extract comment (everything after the risk level)
	const commentMatch = dataString.match(/(?:Critical|High|Medium|Low) risk,\s*(.+)$/);

	const predictedUnits = unitsMatch ? parseInt(unitsMatch[1]) : 0;
	const riskLevel = riskMatch ? (riskMatch[1].toUpperCase() as RiskLevel) : 'MEDIUM';
	const comment = commentMatch ? commentMatch[1].trim() : null;

	return {
		predictedUnits,
		riskLevel,
		comment,
	};
}

async function seedPredictions() {
	try {
		console.log('🌱 Starting prediction seeding...');

		// Read the batch predictions file
		const batchResultsPath = path.join(process.cwd(), 'batch_results', 'batch_predictions.json');
		const batchData = JSON.parse(fs.readFileSync(batchResultsPath, 'utf-8'));

		console.log(`📊 Found ${batchData.results.length} predictions to seed`);

		// Clear existing predictions
		console.log('🧹 Clearing existing predictions...');
		await prisma.prediction.deleteMany();

		// Process each prediction result
		const predictions = [];

		for (const result of batchData.results) {
			if (result.success && result.data && result.data.length > 0) {
				const { predictedUnits, riskLevel, comment } = parsePredictionData(result.data[0]);

				predictions.push({
					productId: result.productId,
					currentStock: result.currentStock,
					stockPredicted: predictedUnits,
					riskLevel: riskLevel,
					comment: comment,
					success: true,
					createdAt: new Date(batchData.timestamp),
				});
			}
		}

		console.log(`📝 Creating ${predictions.length} predictions...`);

		// Batch create all predictions
		await prisma.prediction.createMany({
			data: predictions,
			skipDuplicates: true,
		});

		// Get statistics
		const stats = await prisma.prediction.groupBy({
			by: ['riskLevel'],
			_count: {
				riskLevel: true,
			},
		});

		console.log('\n✅ Prediction seeding completed!');
		console.log('📈 Statistics:');
		stats.forEach((stat) => {
			console.log(`   ${stat.riskLevel}: ${stat._count.riskLevel} predictions`);
		});

		// Show some examples
		console.log('\n🔍 Sample predictions:');
		const samplePredictions = await prisma.prediction.findMany({
			take: 5,
			include: {
				product: true,
			},
			orderBy: {
				stockPredicted: 'desc',
			},
		});

		samplePredictions.forEach((pred) => {
			console.log(
				`   ${pred.product?.name || pred.productId}: ${pred.currentStock} → ${pred.stockPredicted} units (${
					pred.riskLevel
				})`
			);
		});

		// Products needing immediate attention
		console.log('\n🚨 Products needing immediate attention (Critical risk + low stock):');
		const criticalProducts = await prisma.prediction.findMany({
			where: {
				riskLevel: 'CRITICAL',
				currentStock: {
					lt: 30,
				},
			},
			include: {
				product: true,
			},
			orderBy: {
				currentStock: 'asc',
			},
			take: 10,
		});

		criticalProducts.forEach((pred) => {
			const shortfall = pred.stockPredicted - pred.currentStock;
			console.log(
				`   ${pred.product?.name || pred.productId}: Only ${pred.currentStock} units, need ${
					pred.stockPredicted
				} (shortfall: ${shortfall})`
			);
		});
	} catch (error) {
		console.error('Error seeding predictions:', error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
}

// Run the seeding
if (require.main === module) {
	seedPredictions()
		.then(() => {
			console.log('\nPrediction seeding process completed successfully!');
			process.exit(0);
		})
		.catch((error) => {
			console.error('Prediction seeding failed:', error);
			process.exit(1);
		});
}

export { seedPredictions };

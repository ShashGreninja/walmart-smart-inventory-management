import { predictionQueries, dashboardQueries } from '@/lib/queries';

// Script to analyze the seeded prediction data
async function analyzePredictions() {
	try {
		console.log('📊 Analyzing Prediction Data\n');

		// Get overall statistics
		const stats = await predictionQueries.getPredictionStats();
		console.log('📈 Overall Statistics:');
		console.log(`   Total Predictions: ${stats.total}`);
		console.log(`   Success Rate: ${stats.successRate.toFixed(1)}%`);
		console.log(`   Risk Distribution:`);
		Object.entries(stats.riskDistribution).forEach(([risk, count]) => {
			console.log(`     ${risk}: ${count} products`);
		});

		// Get critical products with low stock
		console.log('\n🚨 Critical Risk Products with Low Stock (<30 units):');
		const criticalLowStock = await predictionQueries.getPredictionsByRisk('CRITICAL');
		const filteredCritical = criticalLowStock.filter((p) => p.currentStock < 30);

		filteredCritical.forEach((pred) => {
			const shortfall = pred.stockPredicted - pred.currentStock;
			console.log(
				`   ${pred.product?.name || pred.productId}: ${pred.currentStock} → ${
					pred.stockPredicted
				} units (need ${shortfall} more)`
			);
		});

		// Get products with highest predicted demand
		console.log('\n📈 Top 10 Highest Predicted Demand:');
		const allPredictions = await predictionQueries.getAllPredictions(100);
		const topDemand = allPredictions.sort((a, b) => b.stockPredicted - a.stockPredicted).slice(0, 10);

		topDemand.forEach((pred, index) => {
			console.log(
				`   ${index + 1}. ${pred.product?.name || pred.productId}: ${pred.stockPredicted} units predicted`
			);
		});

		// Get products with largest stock shortfalls
		console.log('\n⚠️  Top 10 Largest Stock Shortfalls:');
		const shortfalls = allPredictions
			.map((pred) => ({
				...pred,
				shortfall: pred.stockPredicted - pred.currentStock,
			}))
			.filter((pred) => pred.shortfall > 0)
			.sort((a, b) => b.shortfall - a.shortfall)
			.slice(0, 10);

		shortfalls.forEach((pred, index) => {
			console.log(
				`   ${index + 1}. ${pred.product?.name || pred.productId}: Need ${pred.shortfall} more units (${
					pred.currentStock
				} → ${pred.stockPredicted})`
			);
		});

		// Get products that are adequately stocked
		console.log('\n✅ Well-Stocked Products (current stock >= predicted):');
		const wellStocked = allPredictions
			.filter((pred) => pred.currentStock >= pred.stockPredicted)
			.sort((a, b) => b.currentStock - b.stockPredicted - (a.currentStock - a.stockPredicted));

		if (wellStocked.length > 0) {
			wellStocked.forEach((pred) => {
				const surplus = pred.currentStock - pred.stockPredicted;
				console.log(
					`   ${pred.product?.name || pred.productId}: ${pred.currentStock} units (surplus: ${surplus})`
				);
			});
		} else {
			console.log('   ⚠️  No products are adequately stocked based on predictions!');
		}

		// Dashboard summary
		console.log('\n📊 Dashboard Summary:');
		const dashboardData = await dashboardQueries.getDashboardData();
		console.log(`   Total Products: ${dashboardData.totalProducts}`);
		console.log(`   Low Stock Count: ${dashboardData.lowStockCount}`);
		console.log(`   Critical Risk (24h): ${dashboardData.criticalRiskCount}`);
	} catch (error) {
		console.error('❌ Error analyzing predictions:', error);
	}
}

// Export for use in other scripts
export { analyzePredictions };

// Run if called directly
if (require.main === module) {
	analyzePredictions()
		.then(() => console.log('\n✅ Analysis completed!'))
		.catch(console.error)
		.finally(() => process.exit(0));
}

import { PrismaClient, RiskLevel } from '@prisma/client';

const prisma = new PrismaClient();

// Product Queries
export const productQueries = {
	// Get all products
	getAllProducts: async () => {
		return await prisma.product.findMany({
			include: {
				inventoryRecords: {
					orderBy: { lastUpdated: 'desc' },
					take: 1, // Get latest inventory record
				},
				predictions: {
					orderBy: { createdAt: 'desc' },
					take: 1, // Get latest prediction
				},
			},
		});
	},

	// Get product by ID
	getProductById: async (productId: string) => {
		return await prisma.product.findUnique({
			where: { productId },
			include: {
				inventoryRecords: {
					orderBy: { lastUpdated: 'desc' },
					take: 1,
				},
				predictions: {
					orderBy: { createdAt: 'desc' },
					take: 5, // Get last 5 predictions
				},
			},
		});
	},

	// Get products by category
	getProductsByCategory: async (category: string) => {
		return await prisma.product.findMany({
			where: { category },
			include: {
				inventoryRecords: {
					orderBy: { lastUpdated: 'desc' },
					take: 1,
				},
			},
		});
	},

	// Create new product
	createProduct: async (data: {
		productId: string;
		name: string;
		description?: string;
		category?: string;
		initialStock: number;
	}) => {
		return await prisma.product.create({
			data: {
				productId: data.productId,
				name: data.name,
				description: data.description,
				category: data.category,
				inventoryRecords: {
					create: {
						stockLevel: data.initialStock,
					},
				},
			},
			include: {
				inventoryRecords: true,
			},
		});
	},

	// Update product
	updateProduct: async (
		productId: string,
		data: Partial<{
			name: string;
			description: string;
			category: string;
		}>
	) => {
		return await prisma.product.update({
			where: { productId },
			data,
		});
	},

	// Delete product
	deleteProduct: async (productId: string) => {
		return await prisma.product.delete({
			where: { productId },
		});
	},
};

// Inventory Queries
export const inventoryQueries = {
	// Get current stock levels
	getCurrentStockLevels: async () => {
		return await prisma.inventoryRecord.findMany({
			include: {
				product: true,
			},
			orderBy: { lastUpdated: 'desc' },
		});
	},

	// Get stock for specific product
	getProductStock: async (productId: string) => {
		return await prisma.inventoryRecord.findFirst({
			where: { productId },
			orderBy: { lastUpdated: 'desc' },
			include: {
				product: true,
			},
		});
	},

	// Update stock level
	updateStockLevel: async (productId: string, newStockLevel: number) => {
		return await prisma.inventoryRecord.create({
			data: {
				productId,
				stockLevel: newStockLevel,
			},
			include: {
				product: true,
			},
		});
	},

	// Get low stock products (less than specified threshold)
	getLowStockProducts: async (threshold: number = 20) => {
		return await prisma.inventoryRecord.findMany({
			where: {
				stockLevel: {
					lte: threshold,
				},
			},
			include: {
				product: true,
			},
			orderBy: { stockLevel: 'asc' },
		});
	},

	// Get stock history for a product
	getStockHistory: async (productId: string, limit: number = 10) => {
		return await prisma.inventoryRecord.findMany({
			where: { productId },
			orderBy: { lastUpdated: 'desc' },
			take: limit,
			include: {
				product: true,
			},
		});
	},
};

// Prediction Queries
export const predictionQueries = {
	// Create new prediction
	createPrediction: async (data: {
		productId: string;
		currentStock: number;
		stockPredicted: number;
		riskLevel: RiskLevel;
		comment?: string;
		success?: boolean;
	}) => {
		return await prisma.prediction.create({
			data,
			include: {
				product: true,
			},
		});
	},

	// Upsert prediction (update existing or create new)
	upsertPrediction: async (data: {
		productId: string;
		currentStock: number;
		stockPredicted: number;
		riskLevel: RiskLevel;
		comment?: string;
		success?: boolean;
	}) => {
		// Try to find the most recent prediction for this product
		const existingPrediction = await prisma.prediction.findFirst({
			where: { productId: data.productId },
			orderBy: { createdAt: 'desc' },
		});

		if (existingPrediction) {
			// Update the existing prediction
			return await prisma.prediction.update({
				where: { id: existingPrediction.id },
				data: {
					currentStock: data.currentStock,
					stockPredicted: data.stockPredicted,
					riskLevel: data.riskLevel,
					comment: data.comment,
					success: data.success,
					createdAt: new Date(), // Update timestamp to reflect new prediction
				},
				include: {
					product: true,
				},
			});
		} else {
			// Create new prediction if none exists
			return await prisma.prediction.create({
				data,
				include: {
					product: true,
				},
			});
		}
	},

	// Get all predictions
	getAllPredictions: async (limit: number = 50) => {
		return await prisma.prediction.findMany({
			orderBy: { createdAt: 'desc' },
			take: limit,
			include: {
				product: true,
			},
		});
	},

	// Get predictions by product
	getProductPredictions: async (productId: string, limit: number = 10) => {
		return await prisma.prediction.findMany({
			where: { productId },
			orderBy: { createdAt: 'desc' },
			take: limit,
			include: {
				product: true,
			},
		});
	},

	// Get predictions by risk level
	getPredictionsByRisk: async (riskLevel: RiskLevel) => {
		return await prisma.prediction.findMany({
			where: { riskLevel },
			orderBy: { createdAt: 'desc' },
			include: {
				product: true,
			},
		});
	},

	// Get latest prediction for each product
	getLatestPredictions: async () => {
		const products = await prisma.product.findMany({
			include: {
				predictions: {
					orderBy: { createdAt: 'desc' },
					take: 1,
				},
			},
		});

		return products
			.filter((product) => product.predictions.length > 0)
			.map((product) => ({
				...product.predictions[0],
				product,
			}));
	},

	// Get prediction statistics
	getPredictionStats: async () => {
		const totalPredictions = await prisma.prediction.count();
		const successfulPredictions = await prisma.prediction.count({
			where: { success: true },
		});

		const riskCounts = await prisma.prediction.groupBy({
			by: ['riskLevel'],
			_count: {
				riskLevel: true,
			},
		});

		return {
			total: totalPredictions,
			successful: successfulPredictions,
			successRate: totalPredictions > 0 ? (successfulPredictions / totalPredictions) * 100 : 0,
			riskDistribution: riskCounts.reduce((acc, item) => {
				acc[item.riskLevel] = item._count.riskLevel;
				return acc;
			}, {} as Record<RiskLevel, number>),
		};
	},
};

// Dashboard Queries
export const dashboardQueries = {
	// Get dashboard overview
	getDashboardData: async () => {
		const [totalProducts, lowStockCount, criticalRiskCount, recentPredictions, stockDistribution] =
			await Promise.all([
				prisma.product.count(),
				prisma.inventoryRecord.count({
					where: { stockLevel: { lte: 20 } },
				}),
				prisma.prediction.count({
					where: {
						riskLevel: 'CRITICAL',
						createdAt: {
							gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
						},
					},
				}),
				prisma.prediction.findMany({
					orderBy: { createdAt: 'desc' },
					take: 5,
					include: { product: true },
				}),
				prisma.inventoryRecord.groupBy({
					by: ['stockLevel'],
					_count: {
						stockLevel: true,
					},
				}),
			]);

		return {
			totalProducts,
			lowStockCount,
			criticalRiskCount,
			recentPredictions,
			stockDistribution,
		};
	},

	// Get products needing attention (low stock + high risk)
	getProductsNeedingAttention: async () => {
		return await prisma.product.findMany({
			include: {
				inventoryRecords: {
					orderBy: { lastUpdated: 'desc' },
					take: 1,
				},
				predictions: {
					orderBy: { createdAt: 'desc' },
					take: 1,
				},
			},
			where: {
				OR: [
					{
						inventoryRecords: {
							some: {
								stockLevel: { lte: 20 },
							},
						},
					},
					{
						predictions: {
							some: {
								riskLevel: { in: ['CRITICAL', 'HIGH'] },
								createdAt: {
									gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
								},
							},
						},
					},
				],
			},
		});
	},
};

// Utility function to close Prisma connection
export const closePrismaConnection = async () => {
	await prisma.$disconnect();
};

export { prisma };

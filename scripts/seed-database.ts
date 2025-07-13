import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Product data with strategic stock levels to trigger different risk categories
// Based on the calculate_stock_risk function:
// - Critical: < 3 days of stock
// - High: 3-7 days of stock
// - Medium: 7-14 days of stock
// - Low: > 14 days of stock
//
// Assuming predicted_demand ranges from 50-1500 units per 14 days
// We'll calculate stock levels to achieve specific days of coverage

const products = [
	// CRITICAL RISK: < 3 days of stock (very low stock vs demand)
	{
		productId: 'P001',
		name: 'Basmati Rice 5kg',
		category: 'Food',
		description: 'Premium quality basmati rice',
		stockLevel: 50,
		reorderLevel: 200,
	},
	{
		productId: 'P002',
		name: 'Coca Cola 2L',
		category: 'Beverages',
		description: 'Coca-Cola soft drink 2 liter bottle',
		stockLevel: 25,
		reorderLevel: 80,
	},
	{
		productId: 'P003',
		name: 'Kurti Cotton Ladies',
		category: 'Clothing',
		description: 'Cotton kurti for ladies',
		stockLevel: 8,
		reorderLevel: 30,
	},
	{
		productId: 'P004',
		name: 'Sunflower Oil 1L',
		category: 'Food',
		description: 'Pure sunflower cooking oil',
		stockLevel: 12,
		reorderLevel: 45,
	},
	{
		productId: 'P005',
		name: 'Paracetamol 500mg 10tabs',
		category: 'Medicine',
		description: 'Pain relief tablets',
		stockLevel: 6,
		reorderLevel: 25,
	},

	// HIGH RISK: 3-7 days of stock
	{
		productId: 'P006',
		name: 'LED Bulb 9W',
		category: 'Electronics',
		description: 'Energy efficient LED bulb',
		stockLevel: 30,
		reorderLevel: 60,
	},
	{
		productId: 'P007',
		name: 'Detergent Powder 1kg',
		category: 'Household',
		description: 'Laundry detergent powder',
		stockLevel: 35,
		reorderLevel: 70,
	},
	{
		productId: 'P008',
		name: 'Potato Chips 200g',
		category: 'Snacks',
		description: 'Crispy potato chips',
		stockLevel: 45,
		reorderLevel: 90,
	},
	{
		productId: 'P009',
		name: 'Shampoo 400ml',
		category: 'Personal Care',
		description: 'Hair shampoo for daily use',
		stockLevel: 28,
		reorderLevel: 55,
	},
	{
		productId: 'P010',
		name: 'Mosquito Coil 10pcs',
		category: 'Household',
		description: 'Mosquito repellent coils',
		stockLevel: 40,
		reorderLevel: 75,
	},

	// MEDIUM RISK: 7-14 days of stock
	{
		productId: 'P011',
		name: 'Amul Milk 1L',
		category: 'Dairy',
		description: 'Fresh milk 1 liter pack',
		stockLevel: 65,
		reorderLevel: 120,
	},
	{
		productId: 'P012',
		name: 'Britannia Good Day 100g',
		category: 'Snacks',
		description: 'Butter cookies',
		stockLevel: 72,
		reorderLevel: 140,
	},
	{
		productId: 'P013',
		name: 'Maggi Noodles 70g',
		category: 'Food',
		description: 'Instant noodles',
		stockLevel: 85,
		reorderLevel: 160,
	},
	{
		productId: 'P014',
		name: 'Tata Tea Gold 250g',
		category: 'Beverages',
		description: 'Premium tea leaves',
		stockLevel: 55,
		reorderLevel: 110,
	},
	{
		productId: 'P015',
		name: 'Parle-G Biscuits 200g',
		category: 'Snacks',
		description: 'Glucose biscuits',
		stockLevel: 78,
		reorderLevel: 150,
	},

	// CRITICAL RISK: Very low stock
	{
		productId: 'P016',
		name: 'Colgate Toothpaste 100g',
		category: 'Personal Care',
		description: 'Dental care toothpaste',
		stockLevel: 4,
		reorderLevel: 20,
	},
	{
		productId: 'P017',
		name: 'Head & Shoulders 400ml',
		category: 'Personal Care',
		description: 'Anti-dandruff shampoo',
		stockLevel: 3,
		reorderLevel: 18,
	},
	{
		productId: 'P018',
		name: 'Vim Dishwash 500ml',
		category: 'Household',
		description: 'Dishwashing liquid',
		stockLevel: 18,
		reorderLevel: 45,
	},
	{
		productId: 'P019',
		name: 'Ariel Detergent 1kg',
		category: 'Household',
		description: 'Washing powder',
		stockLevel: 22,
		reorderLevel: 50,
	},
	{
		productId: 'P020',
		name: 'Fortune Sunflower Oil 1L',
		category: 'Food',
		description: 'Cooking oil',
		stockLevel: 16,
		reorderLevel: 40,
	},

	// LOW RISK: > 14 days of stock
	{
		productId: 'P021',
		name: 'Dabur Honey 500g',
		category: 'Food',
		description: 'Pure honey',
		stockLevel: 120,
		reorderLevel: 200,
	},
	{
		productId: 'P022',
		name: 'Patanjali Atta 5kg',
		category: 'Food',
		description: 'Whole wheat flour',
		stockLevel: 135,
		reorderLevel: 220,
	},
	{
		productId: 'P023',
		name: 'Haldiram Bhujia 200g',
		category: 'Snacks',
		description: 'Spicy snack',
		stockLevel: 110,
		reorderLevel: 180,
	},
	{
		productId: 'P024',
		name: 'Nescafe Coffee 50g',
		category: 'Beverages',
		description: 'Instant coffee',
		stockLevel: 95,
		reorderLevel: 160,
	},
	{
		productId: 'P025',
		name: 'Clinic Plus Shampoo 175ml',
		category: 'Personal Care',
		description: 'Hair shampoo',
		stockLevel: 125,
		reorderLevel: 190,
	},

	// HIGH RISK: 3-7 days range
	{
		productId: 'P026',
		name: 'Dettol Soap 125g',
		category: 'Personal Care',
		description: 'Antibacterial soap',
		stockLevel: 38,
		reorderLevel: 75,
	},
	{
		productId: 'P027',
		name: 'MDH Turmeric 100g',
		category: 'Spices',
		description: 'Turmeric powder',
		stockLevel: 42,
		reorderLevel: 80,
	},
	{
		productId: 'P028',
		name: 'Everest Garam Masala 100g',
		category: 'Spices',
		description: 'Spice mix',
		stockLevel: 44,
		reorderLevel: 85,
	},
	{
		productId: 'P029',
		name: 'Godrej Good Knight 45ml',
		category: 'Household',
		description: 'Mosquito repellent',
		stockLevel: 36,
		reorderLevel: 70,
	},
	{
		productId: 'P030',
		name: 'Real Fruit Juice 1L',
		category: 'Beverages',
		description: 'Mixed fruit juice',
		stockLevel: 32,
		reorderLevel: 65,
	},

	// MEDIUM RISK: 7-14 days range
	{
		productId: 'P031',
		name: 'Philips LED Bulb 9W',
		category: 'Electronics',
		description: 'LED light bulb',
		stockLevel: 60,
		reorderLevel: 115,
	},
	{
		productId: 'P032',
		name: 'Havells Extension Board 6A',
		category: 'Electronics',
		description: 'Power extension',
		stockLevel: 68,
		reorderLevel: 125,
	},
	{
		productId: 'P033',
		name: 'Anchor Power Plug 16A',
		category: 'Electronics',
		description: 'Heavy duty plug',
		stockLevel: 52,
		reorderLevel: 100,
	},
	{
		productId: 'P034',
		name: 'Crompton Table Fan 400mm',
		category: 'Electronics',
		description: 'Table fan',
		stockLevel: 75,
		reorderLevel: 140,
	},
	{
		productId: 'P035',
		name: 'Mi Power Bank 10000mAh',
		category: 'Electronics',
		description: 'Portable charger',
		stockLevel: 58,
		reorderLevel: 110,
	},

	// LOW RISK: > 14 days
	{
		productId: 'P036',
		name: 'boAt Earphones 100',
		category: 'Electronics',
		description: 'Wired earphones',
		stockLevel: 105,
		reorderLevel: 175,
	},
	{
		productId: 'P037',
		name: 'Syska LED Strip Light 5m',
		category: 'Electronics',
		description: 'LED strip lighting',
		stockLevel: 140,
		reorderLevel: 230,
	},
	{
		productId: 'P038',
		name: 'Godrej Mosquito Racket',
		category: 'Electronics',
		description: 'Electric mosquito killer',
		stockLevel: 88,
		reorderLevel: 150,
	},
	{
		productId: 'P039',
		name: 'Realme USB Cable Type-C',
		category: 'Electronics',
		description: 'USB charging cable',
		stockLevel: 92,
		reorderLevel: 160,
	},
	{
		productId: 'P040',
		name: 'Orient Emergency Light',
		category: 'Electronics',
		description: 'Emergency LED light',
		stockLevel: 115,
		reorderLevel: 190,
	},
];

const seedDatabase = async () => {
	console.log('🌱 Starting database seeding...');
	console.log('='.repeat(50));

	try {
		// Clear existing data
		console.log('🗑️  Clearing existing data...');
		await prisma.inventoryRecord.deleteMany();
		await prisma.prediction.deleteMany();
		await prisma.product.deleteMany();

		console.log('✅ Existing data cleared');

		// Seed products
		console.log('📦 Seeding products...');
		for (const productData of products) {
			// Create product
			const product = await prisma.product.create({
				data: {
					productId: productData.productId,
					name: productData.name,
					category: productData.category,
					description: productData.description,
				},
			});
			// Create initial inventory record
			await prisma.inventoryRecord.create({
				data: {
					productId: productData.productId,
					stockLevel: productData.stockLevel,
				},
			});

			console.log(`✅ ${productData.productId}: ${productData.name} (Stock: ${productData.stockLevel})`);
		}

		console.log('='.repeat(50));
		console.log('🎉 Database seeding completed successfully!');
		console.log(`📊 Created ${products.length} products with inventory records`);

		// Display stock distribution based on risk calculation logic
		const stockStats = {
			critical: products.filter((p) => p.stockLevel <= 25).length, // Likely < 3 days coverage
			high: products.filter((p) => p.stockLevel > 25 && p.stockLevel <= 45).length, // 3-7 days coverage
			medium: products.filter((p) => p.stockLevel > 45 && p.stockLevel <= 85).length, // 7-14 days coverage
			low: products.filter((p) => p.stockLevel > 85).length, // > 14 days coverage
		};

		console.log('\n📈 Stock Level Distribution (Based on Days Coverage Logic):');
		console.log(`🔴 Critical Risk (<3 days): ${stockStats.critical} products`);
		console.log(`🟡 High Risk (3-7 days): ${stockStats.high} products`);
		console.log(`🟠 Medium Risk (7-14 days): ${stockStats.medium} products`);
		console.log(`🟢 Low Risk (>14 days): ${stockStats.low} products`);

		console.log('\n💡 Stock levels calculated based on predicted demand ranges:');
		console.log('   - Days of stock = current_stock / (predicted_demand / 14)');
		console.log('   - Critical: < 3 days of stock coverage');
		console.log('   - High: 3-7 days of stock coverage');
		console.log('   - Medium: 7-14 days of stock coverage');
		console.log('   - Low: > 14 days of stock coverage');
		console.log('   - Stock levels optimized for demand ranges 50-150 units/14days');
	} catch (error) {
		console.error('❌ Error seeding database:', error);
		throw error;
	} finally {
		await prisma.$disconnect();
	}
};

// Run the seeding function
if (require.main === module) {
	seedDatabase().catch((error) => {
		console.error('❌ Database seeding failed:', error);
		process.exit(1);
	});
}

export { seedDatabase, products };

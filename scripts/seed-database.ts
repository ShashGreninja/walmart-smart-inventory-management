import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Product data with strategic stock levels to create varied risk predictions
// Based on actual batch prediction results, adjusting stock to get:
// - Critical: Stock much less than predicted (< 20% of predicted)
// - High: Stock less than predicted (20-50% of predicted)
// - Medium: Stock moderately less than predicted (50-80% of predicted)
// - Low: Stock adequate or higher (80%+ of predicted)

const products = [
	// CRITICAL RISK: Very low stock vs high predicted demand
	{
		productId: 'P001',
		name: 'Basmati Rice 5kg',
		category: 'Food',
		description: 'Premium quality basmati rice',
		stockLevel: 65, // Predicted: 942 -> Critical (6.9% coverage)
		reorderLevel: 200,
	},
	{
		productId: 'P002',
		name: 'Coca Cola 2L',
		category: 'Beverages',
		description: 'Coca-Cola soft drink 2 liter bottle',
		stockLevel: 41, // Predicted: 1407 -> Critical (2.9% coverage)
		reorderLevel: 80,
	},
	{
		productId: 'P003',
		name: 'Kurti Cotton Ladies',
		category: 'Clothing',
		description: 'Cotton kurti for ladies',
		stockLevel: 29, // Predicted: 609 -> Critical (4.8% coverage)
		reorderLevel: 30,
	},
	{
		productId: 'P004',
		name: 'Sunflower Oil 1L',
		category: 'Food',
		description: 'Pure sunflower cooking oil',
		stockLevel: 98, // Predicted: 514 -> High (19.1% coverage)
		reorderLevel: 45,
	},
	{
		productId: 'P005',
		name: 'Paracetamol 500mg 10tabs',
		category: 'Medicine',
		description: 'Paracetamol tablets for pain relief',
		stockLevel: 22, // Predicted: 264 -> Critical (8.3% coverage)
		reorderLevel: 50,
	},

	// HIGH RISK: Low stock but not critical
	{
		productId: 'P006',
		name: 'LED Bulb 9W',
		category: 'Electronics',
		description: '9W LED energy saving bulb',
		stockLevel: 89, // Predicted: 223 -> Medium (39.9% coverage)
		reorderLevel: 40,
	},
	{
		productId: 'P007',
		name: 'Detergent Powder 1kg',
		category: 'Household',
		description: 'Laundry detergent powder',
		stockLevel: 170, // Predicted: 568 -> High (29.9% coverage)
		reorderLevel: 100,
	},
	{
		productId: 'P008',
		name: 'Potato Chips 200g',
		category: 'Snacks',
		description: 'Crispy potato chips snack',
		stockLevel: 23, // Predicted: 1935 -> Critical (1.2% coverage)
		reorderLevel: 80,
	},
	{
		productId: 'P009',
		name: 'Shampoo 400ml',
		category: 'Personal Care',
		description: 'Hair shampoo 400ml bottle',
		stockLevel: 174, // Predicted: 347 -> Medium (50.1% coverage)
		reorderLevel: 60,
	},
	{
		productId: 'P010',
		name: 'Mosquito Coil 10pcs',
		category: 'Household',
		description: 'Mosquito repellent coils pack',
		stockLevel: 238, // Predicted: 794 -> High (30.0% coverage)
		reorderLevel: 150,
	},

	// MEDIUM RISK: Moderate stock coverage
	{
		productId: 'P011',
		name: 'Amul Milk 1L',
		category: 'Dairy',
		description: 'Fresh milk 1 liter pack',
		stockLevel: 405, // Predicted: 676 -> Medium (59.9% coverage)
		reorderLevel: 120,
	},
	{
		productId: 'P012',
		name: 'Britannia Good Day 100g',
		category: 'Snacks',
		description: 'Good Day biscuits pack',
		stockLevel: 288, // Predicted: 480 -> Medium (60.0% coverage)
		reorderLevel: 80,
	},
	{
		productId: 'P013',
		name: 'Maggi Noodles 70g',
		category: 'Food',
		description: 'Instant noodles pack',
		stockLevel: 475, // Predicted: 793 -> Medium (59.9% coverage)
		reorderLevel: 150,
	},
	{
		productId: 'P014',
		name: 'Tata Tea Gold 250g',
		category: 'Beverages',
		description: 'Premium tea blend',
		stockLevel: 389, // Predicted: 486 -> Low (80.0% coverage)
		reorderLevel: 100,
	},
	{
		productId: 'P015',
		name: 'Parle-G Biscuits 200g',
		category: 'Snacks',
		description: 'Classic glucose biscuits',
		stockLevel: 316, // Predicted: 1055 -> High (30.0% coverage)
		reorderLevel: 200,
	},

	// LOW RISK: Good stock coverage
	{
		productId: 'P016',
		name: 'Colgate Toothpaste 100g',
		category: 'Personal Care',
		description: 'Dental care toothpaste',
		stockLevel: 942, // Predicted: 1178 -> Low (80.0% coverage)
		reorderLevel: 200,
	},
	{
		productId: 'P017',
		name: 'Head & Shoulders 400ml',
		category: 'Personal Care',
		description: 'Anti-dandruff shampoo',
		stockLevel: 2, // Predicted: 974 -> Critical (0.2% coverage)
		reorderLevel: 150,
	},
	{
		productId: 'P018',
		name: 'Vim Dishwash 500ml',
		category: 'Household',
		description: 'Dishwashing liquid',
		stockLevel: 686, // Predicted: 1143 -> Medium (60.0% coverage)
		reorderLevel: 200,
	},
	{
		productId: 'P019',
		name: 'Ariel Detergent 1kg',
		category: 'Household',
		description: 'Laundry detergent powder',
		stockLevel: 411, // Predicted: 514 -> Low (80.0% coverage)
		reorderLevel: 100,
	},
	{
		productId: 'P020',
		name: 'Fortune Sunflower Oil 1L',
		category: 'Food',
		description: 'Refined sunflower oil',
		stockLevel: 7, // Predicted: 1020 -> Critical (0.7% coverage)
		reorderLevel: 150,
	},
	{
		productId: 'P021',
		name: 'Dabur Honey 500g',
		category: 'Food',
		description: 'Pure natural honey',
		stockLevel: 424, // Predicted: 530 -> Low (80.0% coverage)
		reorderLevel: 100,
	},
	{
		productId: 'P022',
		name: 'Patanjali Atta 5kg',
		category: 'Food',
		description: 'Whole wheat flour',
		stockLevel: 355, // Predicted: 444 -> Low (80.0% coverage)
		reorderLevel: 80,
	},
	{
		productId: 'P023',
		name: 'Haldiram Bhujia 200g',
		category: 'Snacks',
		description: 'Spicy snack mix',
		stockLevel: 625, // Predicted: 1043 -> Medium (60.0% coverage)
		reorderLevel: 180,
	},
	{
		productId: 'P024',
		name: 'Nescafe Coffee 50g',
		category: 'Beverages',
		description: 'Instant coffee powder',
		stockLevel: 595, // Predicted: 993 -> Medium (60.0% coverage)
		reorderLevel: 150,
	},
	{
		productId: 'P025',
		name: 'Clinic Plus Shampoo 175ml',
		category: 'Personal Care',
		description: 'Hair shampoo with conditioner',
		stockLevel: 4, // Predicted: 1137 -> Critical (0.4% coverage)
		reorderLevel: 200,
	},
	{
		productId: 'P026',
		name: 'Dettol Soap 125g',
		category: 'Personal Care',
		description: 'Antibacterial soap bar',
		stockLevel: 790, // Predicted: 1317 -> Medium (60.0% coverage)
		reorderLevel: 250,
	},
	{
		productId: 'P027',
		name: 'MDH Turmeric 100g',
		category: 'Spices',
		description: 'Pure turmeric powder',
		stockLevel: 786, // Predicted: 1310 -> Medium (60.0% coverage)
		reorderLevel: 200,
	},
	{
		productId: 'P028',
		name: 'Everest Garam Masala 100g',
		category: 'Spices',
		description: 'Spice blend for cooking',
		stockLevel: 1053, // Predicted: 1316 -> Low (80.0% coverage)
		reorderLevel: 200,
	},
	{
		productId: 'P029',
		name: 'Godrej Good Knight 45ml',
		category: 'Household',
		description: 'Mosquito repellent liquid',
		stockLevel: 697, // Predicted: 1162 -> Medium (60.0% coverage)
		reorderLevel: 180,
	},
	{
		productId: 'P030',
		name: 'Real Fruit Juice 1L',
		category: 'Beverages',
		description: 'Mixed fruit juice',
		stockLevel: 263, // Predicted: 329 -> Low (80.0% coverage)
		reorderLevel: 60,
	},
	{
		productId: 'P031',
		name: 'Philips LED Bulb 9W',
		category: 'Electronics',
		description: 'Energy efficient LED bulb',
		stockLevel: 129, // Predicted: 161 -> Low (80.1% coverage)
		reorderLevel: 30,
	},
	{
		productId: 'P032',
		name: 'Havells Extension Board 6A',
		category: 'Electronics',
		description: '6 socket extension board',
		stockLevel: 160, // Predicted: 535 -> High (29.9% coverage)
		reorderLevel: 80,
	},
	{
		productId: 'P033',
		name: 'Anchor Power Plug 16A',
		category: 'Electronics',
		description: '16A electrical plug',
		stockLevel: 146, // Predicted: 183 -> Low (79.8% coverage)
		reorderLevel: 35,
	},
	{
		productId: 'P034',
		name: 'Crompton Table Fan 400mm',
		category: 'Electronics',
		description: 'Table fan for cooling',
		stockLevel: 193, // Predicted: 322 -> Medium (59.9% coverage)
		reorderLevel: 60,
	},
	{
		productId: 'P035',
		name: 'Mi Power Bank 10000mAh',
		category: 'Electronics',
		description: 'Portable power bank',
		stockLevel: 171, // Predicted: 214 -> Low (79.9% coverage)
		reorderLevel: 40,
	},
	{
		productId: 'P036',
		name: 'boAt Earphones 100',
		category: 'Electronics',
		description: 'Wired earphones',
		stockLevel: 236, // Predicted: 295 -> Low (80.0% coverage)
		reorderLevel: 50,
	},
	{
		productId: 'P037',
		name: 'Syska LED Strip Light 5m',
		category: 'Electronics',
		description: 'LED strip lighting',
		stockLevel: 435, // Predicted: 726 -> Medium (59.9% coverage)
		reorderLevel: 120,
	},
	{
		productId: 'P038',
		name: 'Godrej Mosquito Racket',
		category: 'Electronics',
		description: 'Electric mosquito racket',
		stockLevel: 199, // Predicted: 249 -> Low (79.9% coverage)
		reorderLevel: 45,
	},
	{
		productId: 'P039',
		name: 'Realme USB Cable Type-C',
		category: 'Electronics',
		description: 'Type-C charging cable',
		stockLevel: 105, // Predicted: 131 -> Low (80.2% coverage)
		reorderLevel: 25,
	},
	{
		productId: 'P040',
		name: 'Orient Emergency Light',
		category: 'Electronics',
		description: 'Rechargeable emergency light',
		stockLevel: 380, // Predicted: 634 -> Medium (59.9% coverage)
		reorderLevel: 100,
	},
];

async function seedProducts() {
	try {
		console.log('Starting product and inventory seeding...');

		// Clear existing data
		console.log('Clearing existing data...');
		await prisma.prediction.deleteMany();
		await prisma.inventoryRecord.deleteMany();
		await prisma.product.deleteMany();

		console.log(`Creating ${products.length} products...`);

		// Create products and their initial inventory records
		for (const productData of products) {
			await prisma.product.create({
				data: {
					productId: productData.productId,
					name: productData.name,
					description: productData.description,
					category: productData.category,
					inventoryRecords: {
						create: {
							stockLevel: productData.stockLevel,
						},
					},
				},
			});
		}

		console.log('\nProduct seeding completed successfully!');
		console.log(`Summary:`);
		console.log(`   Products created: ${products.length}`);
		console.log(`   Inventory records created: ${products.length}`);

		// Show sample of strategic stock levels
		console.log('\nStrategic Stock Distribution:');
		console.log('   Critical Risk (<20% coverage): P001, P002, P003, P005, P008, P017, P020, P025');
		console.log('   High Risk (20-50% coverage): P004, P007, P010, P015, P032');
		console.log(
			'   Medium Risk (50-80% coverage): P006, P009, P011, P012, P013, P018, P023, P024, P026, P027, P029, P034, P037, P040'
		);
		console.log(
			'   Low Risk (80%+ coverage): P014, P016, P019, P021, P022, P028, P030, P031, P033, P035, P036, P038, P039'
		);
	} catch (error) {
		console.error('Error seeding products:', error);
		throw error;
	}
}

// Run the seeding
if (require.main === module) {
	seedProducts()
		.then(() => {
			console.log('\nDatabase seeding process completed successfully!');
			process.exit(0);
		})
		.catch((error) => {
			console.error('Database seeding failed:', error);
			process.exit(1);
		})
		.finally(() => {
			prisma.$disconnect();
		});
}

export { seedProducts };

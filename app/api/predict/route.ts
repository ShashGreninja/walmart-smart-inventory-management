import { NextRequest, NextResponse } from 'next/server';
import { predictInventory } from '@/components/predict-inventory';

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { productId, currentStock } = body;

		// Validate required fields
		if (!productId || currentStock === undefined || currentStock === null) {
			return NextResponse.json({ error: 'Missing required fields: productId and currentStock' }, { status: 400 });
		}

		// Validate data types
		if (typeof productId !== 'string' || typeof currentStock !== 'number') {
			return NextResponse.json(
				{ error: 'Invalid data types: productId must be string, currentStock must be number' },
				{ status: 400 }
			);
		}

		// Call the predictInventory function
		const result = await predictInventory(productId, currentStock);

		// Return the prediction result
		return NextResponse.json({
			success: true,
			data: result,
			productId,
			currentStock,
		});
	} catch (error) {
		console.error('API Error:', error);

		// Handle specific error types
		if (error instanceof Error) {
			if (error.message.includes('environment variable')) {
				return NextResponse.json(
					{ error: 'Server configuration error: Missing environment variables' },
					{ status: 500 }
				);
			}

			return NextResponse.json({ error: `Prediction failed: ${error.message}` }, { status: 500 });
		}

		// Generic error response
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function GET() {
	return NextResponse.json({
		message: 'Inventory Prediction API',
		endpoints: {
			POST: '/api/predict',
			description: 'Send productId and currentStock to get inventory predictions',
		},
		usage: {
			method: 'POST',
			body: {
				productId: 'string',
				currentStock: 'number',
			},
		},
	});
}

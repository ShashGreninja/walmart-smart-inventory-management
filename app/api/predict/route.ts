import { NextRequest, NextResponse } from 'next/server';
import { predictInventory } from '@/components/predict-inventory';
import { predictionQueries } from '@/lib/queries';
import { RiskLevel } from '@prisma/client';

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

		// Parse prediction data and save to database
		try {
			const { stockPredicted, riskLevel, comment } = parsePredictionData(result);

			const savedPrediction = await predictionQueries.upsertPrediction({
				productId,
				currentStock,
				stockPredicted,
				riskLevel,
				comment,
				success: true,
			});

			console.log(`✅ Saved/Updated prediction for ${productId} in database`);

			// Return the prediction result with database info
			return NextResponse.json({
				success: true,
				data: result,
				productId,
				currentStock,
				database: {
					saved: true,
					predictionId: savedPrediction.id,
					stockPredicted,
					riskLevel,
					comment,
				},
			});
		} catch (parseError) {
			console.error(`Failed to parse/save prediction for ${productId}:`, parseError);

			// Save with default values if parsing fails
			const savedPrediction = await predictionQueries.upsertPrediction({
				productId,
				currentStock,
				stockPredicted: 0,
				riskLevel: 'MEDIUM',
				comment: 'Failed to parse prediction data',
				success: false,
			});

			// Still return the original prediction result even if parsing failed
			return NextResponse.json({
				success: true,
				data: result,
				productId,
				currentStock,
				database: {
					saved: true,
					predictionId: savedPrediction.id,
					warning: 'Failed to parse prediction data, saved with default values',
				},
			});
		}
	} catch (error) {
		console.error('API Error:', error);

		// Try to save failed prediction to database
		try {
			const { productId, currentStock } = await request.json();
			if (productId && currentStock !== undefined) {
				await predictionQueries.upsertPrediction({
					productId,
					currentStock,
					stockPredicted: 0,
					riskLevel: 'MEDIUM',
					comment: `Prediction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
					success: false,
				});
			}
		} catch (dbError) {
			console.error('Failed to save error prediction to database:', dbError);
		}

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

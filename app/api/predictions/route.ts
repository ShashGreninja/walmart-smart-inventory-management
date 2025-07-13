import { NextRequest, NextResponse } from 'next/server';
import { predictionQueries } from '@/lib/queries';

export async function GET(request: NextRequest) {
	try {
		// Get all predictions with product information
		const predictions = await predictionQueries.getAllPredictions(100);

		return NextResponse.json({
			success: true,
			predictions,
			count: predictions.length,
		});
	} catch (error) {
		console.error('Error fetching predictions:', error);
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to fetch predictions',
				predictions: [],
			},
			{ status: 500 }
		);
	}
}

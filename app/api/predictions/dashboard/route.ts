import { NextRequest, NextResponse } from 'next/server';
import { predictionQueries } from '@/lib/queries';

export async function GET(request: NextRequest) {
	try {
		// Get all predictions
		const predictions = await predictionQueries.getAllPredictions(100);

		// Calculate counts by risk level
		const counts = {
			critical: predictions.filter((p) => p.riskLevel === 'CRITICAL').length,
			high: predictions.filter((p) => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH').length,
			medium: predictions.filter((p) => p.riskLevel === 'MEDIUM').length,
			low: predictions.filter((p) => p.riskLevel === 'LOW').length,
			all: predictions.length,
		};

		return NextResponse.json({
			success: true,
			predictions,
			counts,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('Error fetching dashboard data:', error);
		return NextResponse.json(
			{
				success: false,
				error: 'Failed to fetch dashboard data',
				predictions: [],
				counts: { critical: 0, high: 0, medium: 0, low: 0, all: 0 },
			},
			{ status: 500 }
		);
	}
}

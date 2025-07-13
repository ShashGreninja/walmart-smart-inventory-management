import { Client } from '@gradio/client';

export async function predictInventory(productId: string, currentStock: number) {
	try {
		const GRADIO_LINK = process.env.NEXT_PUBLIC_GRADIO_LINK;
		if (!GRADIO_LINK) {
			throw new Error('NEXT_PUBLIC_GRADIO_LINK environment variable is not set');
		}

		const TRAINING_LINK = process.env.NEXT_PUBLIC_TRAINING_LINK;
		if (!TRAINING_LINK) {
			throw new Error('NEXT_PUBLIC_TRAINING_LINK environment variable is not set');
		}

		const response_0 = await fetch(TRAINING_LINK);
		const exampleFile = await response_0.blob();

		const client = await Client.connect(GRADIO_LINK);
		const result = await client.predict('/predict', {
			file: exampleFile,
			product_id: productId,
			current_stock: currentStock,
		});

		console.log(result.data);
		return result.data;
	} catch (error) {
		console.error('Error predicting inventory:', error);
		throw error;
	}
}

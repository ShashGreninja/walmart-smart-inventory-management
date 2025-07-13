import { NextResponse } from 'next/server';

export async function GET() {
  const url = "https://raw.githubusercontent.com/Arpit-Raj1/walmart-smart-inventory-management/main/public/40_product_walmart_india_sales_data__3.csv";

  try {
    const response = await fetch(url);
    const csvText = await response.text();

    const lines = csvText.split('\n');
    const headers = lines[0].split(',');
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const entry: { [key: string]: string } = {};
      headers.forEach((header, i) => {
        entry[header.trim()] = values[i]?.trim();
      });
      return entry;
    });

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

let cachedData: any[] | null = null;

async function fetchProductsFromCSV(): Promise<any[]> {
  if (cachedData) return cachedData;

  const url = "https://raw.githubusercontent.com/Arpit-Raj1/walmart-smart-inventory-management/main/public/40_product_walmart_india_sales_data__3.csv";
  const response = await fetch(url);
  const csvText = await response.text();

  const lines = csvText.split("\n").filter(line => line.trim());
  const headers = lines[0].split(",");

  const parsed = lines.slice(1).map(line => {
    const values = line.split(",");
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header.trim()] = values[i]?.trim();
    });
    return obj;
  });

  cachedData = parsed;
  return parsed;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("product_id");

  if (!productId) {
    return NextResponse.json({ error: "Missing 'product_id' query parameter" }, { status: 400 });
  }

  const today = new Date();
  const lastYear = new Date(today);
  lastYear.setFullYear(today.getFullYear() - 2);
  const targetDate = lastYear.toISOString().split("T")[0]; // YYYY-MM-DD

  const data = await fetchProductsFromCSV();

  const filtered = data.filter(
    item =>
      item.product_id === productId &&
      item.date === targetDate
  );

  return NextResponse.json(filtered);
}

import { creem } from "@/backend/lib/creem";

export async function GET() {
  try {
    console.log("Fetching products from Creem...");
    const products = await creem.listProducts();
    console.log("Products:", products);
    
    return Response.json({
      success: true,
      products: products
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// MongoDB connection URI from your .env.local
const uri = process.env.MONGODB_URI;

let cachedClient = null;

// Helper to connect to MongoDB with caching
async function connectToDatabase() {
  if (!cachedClient) {
    const client = new MongoClient(uri);
    cachedClient = await client.connect();
  }
  return cachedClient;
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const hotelName = searchParams.get("hotelName");
  const hotelCity = searchParams.get("hotelCity");
  const minPrice = parseInt(searchParams.get("minPrice") || "0", 10);
  const maxPrice = parseInt(searchParams.get("maxPrice") || `${Infinity}`, 10);

  // Log the query parameters to verify
  console.log("Query Parameters:", hotelName, hotelCity, minPrice, maxPrice);

  try {
    const client = await connectToDatabase();
    const db = client.db("hotels"); // Replace with your actual database name
    const collection = db.collection("hotels"); // Replace with your collection name

    // Construct the query dynamically, but only add parameters if they are provided
    const query = {};

    // Add filter for hotelName if provided
    if (hotelName) query.Hotel_Name = { $regex: hotelName, $options: "i" };

    // Add filter for hotelCity if provided
    if (hotelCity) query.City = { $regex: `^${hotelCity}$`, $options: "i" };

    // Initialize Hotel_Price filter
    let hotelPrice;

    // Add filter for Hotel_Price if minPrice or maxPrice are provided and are valid numbers
    if (!isNaN(minPrice) && minPrice >= 0 || !isNaN(maxPrice) && maxPrice >= 0) {
      hotelPrice = {};

      if (!isNaN(minPrice) && minPrice >= 0) {
        hotelPrice.$gte = minPrice;
      }

      if (!isNaN(maxPrice) && maxPrice >= 0) {
        hotelPrice.$lte = maxPrice;
      }
    }

    // Only assign hotelPrice to the query if it's defined
    if (hotelPrice) {
      query.Hotel_Price = hotelPrice;
    }

    // Log the final query to ensure it is constructed properly
    console.log("Final Query:", query);

    // Fetch matching documents or all documents if no filters are applied
    const results = await collection.find(query).toArray();
    console.log("Fetched Results:", results);

    // Send response
    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

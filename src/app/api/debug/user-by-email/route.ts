import { NextRequest, NextResponse } from "next/server";
import { getByEmail } from "@/backend/models/user";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
    }

    console.log('Querying user by email:', email);
    
    const user = await getByEmail(email);
    
    if (user) {
      return NextResponse.json({ 
        success: true, 
        user: user,
        message: "User found successfully" 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error querying user:', error);
    return NextResponse.json({ 
      error: "Internal server error",
      details: error.message 
    }, { status: 500 });
  }
}
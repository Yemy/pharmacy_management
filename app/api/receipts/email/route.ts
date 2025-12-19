import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NotificationService } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (!['ADMIN', 'PHARMACIST', 'STAFF'].includes(userRole)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { customerEmail, receiptData } = await request.json();

    if (!customerEmail || !receiptData) {
      return NextResponse.json(
        { error: "Customer email and receipt data are required" },
        { status: 400 }
      );
    }

    // Send receipt email
    const result = await NotificationService.sendReceiptEmail(customerEmail, receiptData);

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: "Receipt emailed successfully" 
      });
    } else {
      return NextResponse.json(
        { error: result.error || "Failed to send email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Email receipt error:", error);
    return NextResponse.json(
      { error: "Failed to send receipt email" },
      { status: 500 }
    );
  }
}
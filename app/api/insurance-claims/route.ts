import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    if (!['ADMIN', 'PHARMACIST'].includes(userRole)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const {
      saleId,
      providerId,
      patientId,
      prescriptionNumber,
      claimAmount,
      copay,
      deductible
    } = await request.json();

    // Validate required fields
    if (!saleId || !providerId || !patientId || !claimAmount) {
      return NextResponse.json(
        { error: "Sale, provider, patient ID, and claim amount are required" },
        { status: 400 }
      );
    }

    // Generate claim number
    const claimCount = await prisma.insuranceClaim.count();
    const claimNumber = `CLM-${Date.now()}-${(claimCount + 1).toString().padStart(4, '0')}`;

    // Create insurance claim
    const claim = await prisma.insuranceClaim.create({
      data: {
        claimNumber,
        saleId,
        providerId,
        patientId,
        prescriptionNumber,
        claimAmount,
        copay: copay || 0,
        deductible: deductible || 0
      },
      include: {
        provider: true,
        sale: {
          include: {
            customer: true,
            items: { include: { medicine: true } }
          }
        }
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: parseInt(session.user.id as string),
        action: "CREATE_INSURANCE_CLAIM",
        tableName: "insuranceClaim",
        recordId: claim.id,
        changes: { claimNumber, saleId, providerId, claimAmount }
      }
    });

    return NextResponse.json(claim);
  } catch (error) {
    console.error("Create insurance claim error:", error);
    return NextResponse.json(
      { error: "Failed to create insurance claim" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userRole = (session.user as any).role;
    if (!['ADMIN', 'PHARMACIST'].includes(userRole)) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status');

    const where: any = {};
    
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [claims, total] = await Promise.all([
      prisma.insuranceClaim.findMany({
        where,
        include: {
          provider: true,
          sale: {
            include: {
              customer: true,
              items: { include: { medicine: true } }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.insuranceClaim.count({ where })
    ]);

    return NextResponse.json({
      claims,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Get insurance claims error:", error);
    return NextResponse.json(
      { error: "Failed to fetch insurance claims" },
      { status: 500 }
    );
  }
}
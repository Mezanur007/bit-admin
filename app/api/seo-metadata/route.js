import { NextResponse } from "next/server";
import { db } from "@/configuration/firebase-admin";

// GET all metadata
export async function GET() {
  try {
    const snapshot = await db
      .collection("seo-metadata")
      .get();

    const pages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({
      success: true,
      data: pages,
    });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}

// CREATE metadata
export async function POST(request) {
  try {
    const body = await request.json();
    const { id, en, ar } = body;
  console.log("Received body:", body);  
    if (
      !id ||
      !en?.title ||
      !en?.description ||
      !ar?.title ||
      !ar?.description
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Title and description are required for both languages",
        },
        { status: 400 }
      );
    }

    const docRef = db.collection("seo-metadata").doc(id);
    const existing = await docRef.get();

    if (existing.exists) {
      return NextResponse.json(
        { success: false, error: "Page ID already exists" },
        { status: 400 }
      );
    }

    await docRef.set({
      en: {
        title: en.title,
        description: en.description,
        keywords: en.keywords || "",  
      },
      ar: {
        title: ar.title,
        description: ar.description,
        keywords: ar.keywords || "",  
      },
      lastModified: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "SEO metadata created successfully",
    });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create metadata",
      },
      { status: 500 }
    );
  }
}

// UPDATE metadata
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, en, ar } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Page ID is required" },
        { status: 400 }
      );
    }

    await db
      .collection("seo-metadata")
      .doc(id)
      .update({
        ...(en && { en }),
        ...(ar && { ar }),
        lastModified: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      message: "SEO metadata updated successfully",
    });
  } catch (error) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update metadata",
      },
      { status: 500 }
    );
  }
}

// DELETE metadata
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Page ID is required" },
        { status: 400 }
      );
    }

    await db.collection("seo-metadata").doc(id).delete();

    return NextResponse.json({
      success: true,
      message: "SEO metadata deleted successfully",
    });
  } catch (error) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete metadata",
      },
      { status: 500 }
    );
  }
}
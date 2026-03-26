import { NextResponse } from "next/server";
import { db } from "@/configuration/firebase-admin";
import admin from "firebase-admin";

export async function PATCH(req) {
  try {
    const { conversationId, updates } = await req.json();

    if (!conversationId || !updates) {
      return NextResponse.json(
        { error: "Missing conversationId or updates" },
        { status: 400 }
      );
    }

    await db.collection("conversations").doc(conversationId).update(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH conversation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { conversationId } = await req.json();

    if (!conversationId) {
      return NextResponse.json(
        { error: "Missing conversationId" },
        { status: 400 }
      );
    }

    await db.collection("conversations").doc(conversationId).update({
      deletedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE conversation error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

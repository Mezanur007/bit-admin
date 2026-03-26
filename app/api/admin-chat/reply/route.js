import { NextResponse } from "next/server";
import { db } from "@/configuration/firebase-admin";
import admin from "firebase-admin";

export async function POST(req) {
  try {
    const { conversationId, text, fileUrl, fileName, mimeType, adminName } =
      await req.json();

    if (!conversationId || (!text && !fileUrl)) {
      return NextResponse.json(
        { error: "Missing conversationId or message content" },
        { status: 400 }
      );
    }

    const messageType = fileUrl
      ? mimeType?.startsWith("image/")
        ? "image"
        : "document"
      : "text";

    const message = {
      senderType: "admin",
      senderName: adminName || "Admin",
      messageType,
      messageText: text || null,
      fileUrl: fileUrl || null,
      fileName: fileName || null,
      mimeType: mimeType || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .add(message);

    const preview = text
      ? `[Admin] ${text.slice(0, 80)}`
      : `[Admin] 📎 ${fileName || "file"}`;

    await db.collection("conversations").doc(conversationId).update({
      lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
      lastMessagePreview: preview,
      status: "active",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reply error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

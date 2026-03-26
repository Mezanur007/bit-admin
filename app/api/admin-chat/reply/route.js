import { NextResponse } from "next/server";
import { db } from "@/configuration/firebase-admin";
import admin from "firebase-admin";

export async function POST(req) {
  try {
    const { conversationId, text, fileUrl, fileName, mimeType } =
      await req.json();

    if (!conversationId || (!text && !fileUrl)) {
      return NextResponse.json(
        { error: "Missing conversationId or message content" },
        { status: 400 }
      );
    }

    const message = {
      role: "admin",
      text: text || "",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (fileUrl) {
      message.fileUrl = fileUrl;
      message.fileName = fileName || "file";
      message.mimeType = mimeType || "application/octet-stream";
    }

    await db
      .collection("conversations")
      .doc(conversationId)
      .collection("messages")
      .add(message);

    const preview = text
      ? text.slice(0, 80)
      : `📎 ${fileName || "file"}`;

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

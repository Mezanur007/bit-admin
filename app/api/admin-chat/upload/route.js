import { NextResponse } from "next/server";
import admin from "firebase-admin";
import "@/configuration/firebase-admin"; // ensure admin is initialized

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const conversationId = formData.get("conversationId");

    if (!file || !conversationId) {
      return NextResponse.json(
        { error: "Missing file or conversationId" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_SIZE) {
      return NextResponse.json(
        { error: "File exceeds 10 MB limit" },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(arrayBuffer);
    const ext = file.name.split(".").pop();
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `chat-uploads/${conversationId}/${uniqueName}`;

    // Use the storage bucket from env (strip gs:// prefix if present)
    const bucketName = (
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || ""
    ).replace("gs://", "");

    const bucket = admin.storage().bucket(bucketName);
    const fileRef = bucket.file(filePath);

    await fileRef.save(buffer, {
      metadata: { contentType: file.type || "application/octet-stream" },
    });

    await fileRef.makePublic();

    const url = `https://storage.googleapis.com/${bucketName}/${filePath}`;

    return NextResponse.json({
      url,
      fileName: file.name,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

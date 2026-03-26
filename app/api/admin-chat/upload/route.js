import { NextResponse } from "next/server";
import { s3 } from "@/configuration/aws";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const BUCKET = "bit-admin-chat";

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

    const ext = file.name.split(".").pop();
    const uniqueName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${ext}`;
    const key = `chat-uploads/${conversationId}/${uniqueName}`;

    await s3.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: Buffer.from(arrayBuffer),
        ContentType: file.type || "application/octet-stream",
        ACL: "public-read",
      })
    );

    const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

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

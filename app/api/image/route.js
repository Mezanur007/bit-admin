import { NextResponse } from "next/server";
import { s3 } from "@/configuration/aws";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const path = formData.get("path");
    const bucket = formData.get("bucket");

    if (!file || !path || !bucket)
      throw new Error("Missing file, path, or bucket");

    const arrayBuffer = await file.arrayBuffer();

    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: path,
        Body: arrayBuffer,
        ContentType: file.type || "image/gif",
        CacheControl: "no-cache, no-store, must-revalidate",
      })
    );

    const url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${path}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { bucket, path } = await req.json();

    if (!bucket || !path) throw new Error("Missing bucket name or image path");

    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: path,
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

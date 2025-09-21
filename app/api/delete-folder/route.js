import { NextResponse } from "next/server";
import { s3 } from "@/configuration/aws";
import { ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";

async function deleteFolder(bucket, folderPrefix) {
  try {
    const listRes = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: folderPrefix,
      })
    );

    if (!listRes.Contents || listRes.Contents.length === 0)
      return { success: true };

    const deleteParams = {
      Bucket: bucket,
      Delete: {
        Objects: listRes.Contents.map((obj) => ({ Key: obj.Key })),
      },
    };

    await s3.send(new DeleteObjectsCommand(deleteParams));
    return { success: true };
  } catch (err) {
    console.error("Delete folder error:", err);
    return { success: false, error: err.message };
  }
}

export async function DELETE(req) {
  try {
    const { bucket, folder } = await req.json();

    if (!bucket || !folder) {
      return NextResponse.json(
        { error: "Missing bucket or folder" },
        { status: 400 }
      );
    }

    const result = await deleteFolder(bucket, folder);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API delete folder error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    console.log("[Upload API] POST request received");
    console.log("[Upload API] BLOB_READ_WRITE_TOKEN exists:", !!process.env.BLOB_READ_WRITE_TOKEN);
    console.log("[Upload API] BLOB_READ_WRITE_TOKEN length:", process.env.BLOB_READ_WRITE_TOKEN?.length);
    console.log("[Upload API] BLOB_READ_WRITE_TOKEN first 20 chars:", process.env.BLOB_READ_WRITE_TOKEN?.substring(0, 20));
    
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("[Upload API] No file in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log("[Upload API] File received:", file.name, "Size:", file.size, "Type:", file.type);

    // Upload to Vercel Blob
    console.log("[Upload API] Uploading to Vercel Blob...");
    
    // Get token from environment
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      throw new Error("BLOB_READ_WRITE_TOKEN is not set");
    }
    
    const blob = await put(file.name, file, {
      access: "public",
      token: token, // Explicitly pass the token
    });

    console.log("[Upload API] Upload successful, URL:", blob.url);
    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error("[Upload API] Error uploading file:", error);
    console.error("[Upload API] Error name:", (error as any)?.name);
    console.error("[Upload API] Error message:", (error as any)?.message);
    console.error("[Upload API] Error stack:", (error as any)?.stack);
    return NextResponse.json(
      { error: "Failed to upload file", details: String(error), message: (error as any)?.message },
      { status: 500 }
    );
  }
}

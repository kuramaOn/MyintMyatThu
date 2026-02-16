import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

// Allowed file types for uploads
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml'
];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function uploadWithRetry(file: File, token: string, retries = MAX_RETRIES): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[Upload API] Upload attempt ${attempt}/${retries}`);
      
      const blob = await put(file.name, file, {
        access: "public",
        token: token,
      });
      
      console.log("[Upload API] Upload successful, URL:", blob.url);
      return blob.url;
    } catch (error) {
      console.error(`[Upload API] Attempt ${attempt} failed:`, error);
      
      if (attempt === retries) {
        throw error; // Last attempt failed
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = RETRY_DELAY * Math.pow(2, attempt - 1);
      console.log(`[Upload API] Retrying in ${waitTime}ms...`);
      await delay(waitTime);
    }
  }
  
  throw new Error("Upload failed after all retries");
}

export async function POST(request: NextRequest) {
  try {
    console.log("[Upload API] POST request received");
    
    // Check if token exists
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (!token) {
      console.error("[Upload API] BLOB_READ_WRITE_TOKEN is not configured");
      return NextResponse.json(
        { error: "Server configuration error: Storage token not set" },
        { status: 500 }
      );
    }
    
    console.log("[Upload API] BLOB_READ_WRITE_TOKEN configured");
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    // Validate file exists
    if (!file) {
      console.error("[Upload API] No file in request");
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log("[Upload API] File received:", {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.error("[Upload API] Invalid file type:", file.type);
      return NextResponse.json(
        { 
          error: "Invalid file type",
          message: `Allowed types: ${ALLOWED_TYPES.join(', ')}`,
          receivedType: file.type
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.error("[Upload API] File too large:", file.size);
      return NextResponse.json(
        { 
          error: "File too large",
          message: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`,
          receivedSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`
        },
        { status: 400 }
      );
    }

    // Validate file is not empty
    if (file.size === 0) {
      console.error("[Upload API] Empty file");
      return NextResponse.json(
        { error: "File is empty" },
        { status: 400 }
      );
    }

    // Upload to Vercel Blob with retry logic
    console.log("[Upload API] Starting upload to Vercel Blob...");
    const url = await uploadWithRetry(file, token);
    
    return NextResponse.json({ 
      url,
      success: true,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    });

  } catch (error) {
    console.error("[Upload API] Error uploading file:", error);
    console.error("[Upload API] Error details:", {
      name: (error as any)?.name,
      message: (error as any)?.message,
      stack: (error as any)?.stack
    });

    // Determine error type and provide helpful message
    let errorMessage = "Failed to upload file";
    let statusCode = 500;

    if ((error as any)?.message?.includes("token")) {
      errorMessage = "Storage authentication error";
      statusCode = 500;
    } else if ((error as any)?.message?.includes("network")) {
      errorMessage = "Network error during upload";
      statusCode = 503;
    } else if ((error as any)?.message?.includes("timeout")) {
      errorMessage = "Upload timeout - file may be too large";
      statusCode = 408;
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        message: (error as any)?.message || "Unknown error occurred",
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: statusCode }
    );
  }
}

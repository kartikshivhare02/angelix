import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { assertAdmin } from "@/lib/admin-auth";
import fs from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    if (!await assertAdmin(supabase)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "products";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. First attempt: Upload to Supabase Storage
    try {
      const adminClient = await createAdminClient();
      
      // Ensure bucket exists in Supabase
      const { data: buckets } = await adminClient.storage.listBuckets();
      const bucketExists = buckets?.some((b) => b.id === bucket || b.name === bucket);

      if (!bucketExists) {
        await adminClient.storage.createBucket(bucket, { public: true });
      }

      const { data: uploadData, error: uploadError } = await adminClient.storage
        .from(bucket)
        .upload(fileName, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: publicUrlData } = adminClient.storage
          .from(bucket)
          .getPublicUrl(fileName);

        if (publicUrlData?.publicUrl) {
          return NextResponse.json({
            url: publicUrlData.publicUrl,
            fileName,
            storage: "supabase",
          });
        }
      }
      console.warn("Supabase storage upload returned error, falling back to local storage:", uploadError?.message);
    } catch (supabaseErr: any) {
      console.warn("Supabase storage threw error, using local storage fallback:", supabaseErr?.message);
    }

    // 2. Resilient Fallback: Save to public/uploads directory
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const localFilePath = path.join(uploadsDir, fileName);
    await fs.writeFile(localFilePath, buffer);

    const publicUrl = `/uploads/${fileName}`;

    return NextResponse.json({
      url: publicUrl,
      fileName,
      storage: "local",
    });
  } catch (err: any) {
    console.error("Upload handler fatal error:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}

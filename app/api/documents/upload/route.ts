import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";
import { getCompanyId } from "@/lib/auth/getCompanyId";
import { supabaseAdmin } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";
const DOCUMENTS_BUCKET = "files";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized - Please log in" }, { status: 401 });
        }
        const uploaderEmail = session.user.email;

        const companyId = await getCompanyId();
        if (!companyId) {
            return NextResponse.json({ error: "Your account is not linked to a company. Please contact support or complete onboarding first." }, { status: 400 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const name = (formData.get("name") as string) || file?.name;
        const documentType = (formData.get("documentType") as string) || "";
        const documentTitle = (formData.get("documentTitle") as string) || name || "Untitled Document";

        if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const path = `${companyId}/${Date.now()}_${safeName}`;
        const { data: upload, error: uploadError } = await supabaseAdmin
            .storage
            .from(DOCUMENTS_BUCKET)
            .upload(path, file, { contentType: file.type || undefined, upsert: false });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabaseAdmin.storage.from(DOCUMENTS_BUCKET).getPublicUrl(upload.path);
        const fileUrl = urlData.publicUrl || upload.path;

        const { data: record, error: insertError } = await supabaseAdmin
            .from("documents_and_artifacts")
            .insert({
                company_id: companyId,
                document_type: documentType || documentTitle,
                status: "Received",
                file_name: file.name,
                file_url: fileUrl,
                metadata: {
                    title: documentTitle,
                    uploadedByEmail: uploaderEmail,
                    storagePath: upload.path,
                    contentType: file.type,
                    size: file.size,
                },
            })
            .select("id")
            .single();

        if (insertError) throw insertError;

        return NextResponse.json({
            success: true,
            message: "Document uploaded successfully",
            recordId: record.id,
            fileUrl,
            fileId: upload.path,
        });
    } catch (error: any) {
        console.error("[Document Upload API] Error:", error);
        return NextResponse.json({ error: error?.message || "An error occurred while uploading the document" }, { status: 500 });
    }
}

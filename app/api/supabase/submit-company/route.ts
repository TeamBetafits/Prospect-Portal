import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        
        const companyName = formData.get('companyName') as string;
        const usersStr = formData.get('users') as string;
        const assignedFormsStr = formData.get('assignedForms') as string;
        
        if (!companyName) {
            return NextResponse.json({ error: 'Company Name is required' }, { status: 400 });
        }

        const users = usersStr ? JSON.parse(usersStr) : [];
        const assignedForms = assignedFormsStr ? JSON.parse(assignedFormsStr) : [];

        const companyIdRaw = formData.get('companyId') as string;

        let companyId = companyIdRaw;

        // 1. Insert Company if not existing
        if (!companyId) {
            const { data: company, error: companyError } = await supabaseAdmin
                .from('companies')
                .insert([{ company_name: companyName }])
                .select()
                .single();

            if (companyError || !company) {
                console.error('Error creating company:', companyError);
                return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
            }
            companyId = company.id;
        }



        // 2. Insert Users
        if (users.length > 0) {
            const usersToInsert = users.map((u: any) => ({
                company_id: companyId,
                first_name: u.firstName,
                last_name: u.lastName,
                email: u.email,
                job_title: u.title,
            }));

            const { error: usersError } = await supabaseAdmin
                .from('users')
                .insert(usersToInsert);

            if (usersError) {
                console.error('Error inserting users:', usersError);
            }
        }

        // 3. Insert Assigned Forms
        if (assignedForms.length > 0) {
            const formsToInsert = assignedForms.map((f: any) => ({
                company_id: companyId,
                available_form_id: f.id,
            }));

            const { error: formsError } = await supabaseAdmin
                .from('intake_assigned_forms')
                .insert(formsToInsert);

            if (formsError) {
                console.error('Error inserting assigned forms:', formsError);
            }
        }

        // 4. Handle File Uploads (Supabase Storage)
        const entries = Array.from(formData.entries());
        for (const [key, value] of entries) {
            if (key.startsWith('document_') && value instanceof File) {
                const index = key.split('_')[1];
                const docType = formData.get(`doc_type_${index}`) as string || 'General';
                
                const fileExt = value.name.split('.').pop();
                const fileName = `${companyId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

                // Use a 'documents' bucket by default - ensure this bucket exists in your Supabase dashboard!
                const { data: uploadData, error: uploadError } = await supabaseAdmin
                    .storage
                    .from('documents')
                    .upload(fileName, value);

                if (uploadError) {
                    console.error('Error uploading file:', uploadError);
                } else if (uploadData) {
                    const { data: urlData } = supabaseAdmin.storage.from('documents').getPublicUrl(uploadData.path);
                    
                    // 5. Upsert document record manually (no unique constraint on multiple columns)
                    const { data: existingDocs, error: checkError } = await supabaseAdmin
                        .from('documents_and_artifacts')
                        .select('id')
                        .eq('company_id', companyId)
                        .eq('document_type', docType)
                        .limit(1);

                    if (checkError) {
                        console.error('Error checking document existence:', checkError);
                    }

                    if (existingDocs && existingDocs.length > 0) {
                        // Update existing row
                        const { error: updateError } = await supabaseAdmin
                            .from('documents_and_artifacts')
                            .update({
                                file_name: value.name,
                                file_url: urlData.publicUrl || uploadData.path,
                            })
                            .eq('id', existingDocs[0].id);
                            
                        if (updateError) console.error('Error updating document record:', updateError);
                    } else {
                        // Insert new row
                        const { error: insertError } = await supabaseAdmin
                            .from('documents_and_artifacts')
                            .insert([{
                                company_id: companyId,
                                document_type: docType,
                                file_name: value.name,
                                file_url: urlData.publicUrl || uploadData.path,
                            }]);

                        if (insertError) console.error('Error inserting document record:', insertError);
                    }
                }
            }
        }

        return NextResponse.json({ success: true, companyId });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

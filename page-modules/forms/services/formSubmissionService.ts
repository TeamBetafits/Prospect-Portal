import { FormValues } from "@/types/form";

const QUICK_START_FILE_FIELDS = ["benefitGuide", "sbcPlanSummaries", "census", "otherDocuments"];

function getDocumentType(fieldId: string) {
  if (fieldId === "benefitGuide") return "Benefit Guide";
  if (fieldId === "sbcPlanSummaries") return "SBC Plan Summaries";
  if (fieldId === "census") return "Census";
  return "Other";
}

async function uploadFile(fieldId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", file.name);
  formData.append("documentTitle", file.name.replace(/\.[^/.]+$/, "") || file.name);
  formData.append("documentType", getDocumentType(fieldId));

  const uploadResponse = await fetch("/api/documents/upload", {
    method: "POST",
    body: formData,
  });

  if (!uploadResponse.ok) {
    console.warn(`Failed to upload file ${file.name}:`, await uploadResponse.text());
    return file.name;
  }

  const uploadData = await uploadResponse.json();
  return uploadData.fileUrl || uploadData.fileId || file.name;
}

export async function uploadQuickStartFiles(values: FormValues) {
  const processedValues = { ...values };

  for (const fieldId of QUICK_START_FILE_FIELDS) {
    const fileValue = processedValues[fieldId];
    if (!fileValue) continue;

    try {
      if (fileValue instanceof File) {
        processedValues[fieldId] = await uploadFile(fieldId, fileValue);
      } else if (Array.isArray(fileValue) && fileValue.length > 0 && fileValue[0] instanceof File) {
        const uploadedFiles = await Promise.all((fileValue as File[]).map((file) => uploadFile(fieldId, file)));
        processedValues[fieldId] = uploadedFiles.join(", ");
      }
    } catch (uploadError) {
      console.error(`Error uploading file for ${fieldId}:`, uploadError);
      if (fileValue instanceof File) {
        processedValues[fieldId] = fileValue.name;
      } else if (Array.isArray(fileValue)) {
        processedValues[fieldId] = (fileValue as File[]).map((file) => file.name).join(", ");
      }
    }
  }

  return processedValues;
}

export async function submitPortalForm(formId: string, formName: string, values: FormValues, mappedPayloads?: Record<string, unknown>) {
  const response = await fetch("/api/forms/submit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ formId, formName, values, mappedPayloads }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || data.error || "Failed to submit form. Please try again.");
  }

  return data;
}

export async function uploadDocumentForm(values: FormValues) {
  const file = values.file;
  const isFile = file && typeof file === "object" && file instanceof File;

  if (!isFile) {
    throw new Error("Please select a file to upload.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", file.name);
  formData.append("documentType", String(values.documentType || "Other"));
  formData.append(
    "documentTitle",
    String(values.documentDescription || values.uploadNotes || file.name.replace(/\.[^/.]+$/, "") || file.name)
  );

  const response = await fetch("/api/documents/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || "Failed to upload document. Please try again.");
  }

  return data;
}

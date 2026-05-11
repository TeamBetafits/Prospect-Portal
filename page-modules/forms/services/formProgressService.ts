import { FormValues } from "@/types/form";

function serializeFormValue(value: unknown) {
  if (value instanceof File) {
    return { type: "file", name: value.name, size: value.size };
  }

  if (Array.isArray(value) && value.length > 0 && value[0] instanceof File) {
    return {
      type: "files",
      files: (value as File[]).map((file) => ({ name: file.name, size: file.size })),
    };
  }

  return value;
}

export function readSavedFormProgress(storageKey: string): FormValues | null {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return null;

  const parsed = JSON.parse(saved) as FormValues;
  return Object.keys(parsed).length > 0 ? parsed : null;
}

export function saveFormProgress(storageKey: string, values: FormValues) {
  const serializableValues: FormValues = {};

  for (const [key, value] of Object.entries(values)) {
    serializableValues[key] = serializeFormValue(value);
  }

  localStorage.setItem(storageKey, JSON.stringify(serializableValues));
}

export function clearFormProgress(storageKey: string) {
  localStorage.removeItem(storageKey);
}

"use client";

import { DocumentArtifact, DocumentStatus } from "@/types";
import { useDocumentsSection } from "@/page-modules/dashboard/hooks/useDocumentsSection";

interface Props {
  documents: DocumentArtifact[];
}

function getStatusStyle(status: DocumentStatus) {
  switch (status) {
    case DocumentStatus.APPROVED:
      return "bg-success-bg text-success-500 border-success-500/20";
    case DocumentStatus.UNDER_REVIEW:
      return "bg-info-bg text-info-500 border-info-500/20";
    case DocumentStatus.REJECTED:
      return "bg-error-bg text-error-500 border-error-500/20";
    case DocumentStatus.NOT_REVIEWED:
    default:
      return "bg-neutral-100 text-neutral-600 border-neutral-200";
  }
}

function getStatusLabel(status: DocumentStatus) {
  if (status === DocumentStatus.APPROVED) return "Reviewed";
  if (status === DocumentStatus.UNDER_REVIEW) return "In Review";
  return status;
}

function getDocumentType(doc: DocumentArtifact) {
  if (doc.fileName?.includes(".")) {
    return doc.fileName.split(".").pop()?.toUpperCase() || "Document";
  }
  return "Document";
}

function DocumentCard({ doc, onOpen }: { doc: DocumentArtifact; onOpen: (doc: DocumentArtifact) => void }) {
  return (
    <div className="group bg-white border border-neutral-200 rounded-md p-5 shadow-card flex flex-col gap-3 hover:border-neutral-300 transition-all w-full">
      <div className="flex justify-between items-start gap-4 w-full">
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-neutral-900 tracking-tight leading-tight break-words">{doc.name}</h3>
          <p className="text-[12px] text-neutral-500 font-medium mt-1 truncate">{doc.fileName} · {getDocumentType(doc)}</p>
        </div>
        <div className="flex-shrink-0">
          <span className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border whitespace-nowrap ${getStatusStyle(doc.status)}`}>
            {getStatusLabel(doc.status)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpen(doc)}
        disabled={!doc.url || doc.url === "#"}
        className="btn-ghost w-full h-8 text-[11px] flex items-center justify-center gap-2 font-bold mt-2 disabled:text-neutral-400 disabled:hover:bg-transparent disabled:cursor-not-allowed"
      >
        View Document
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </button>
    </div>
  );
}

export default function DocumentsPanel({ documents }: Props) {
  const documentsSection = useDocumentsSection(documents);

  return (
    <section className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
      {documents.length > 0 ? (
        documents.map((doc) => <DocumentCard key={doc.id} doc={doc} onOpen={documentsSection.openDocument} />)
      ) : (
        <div className="py-10 text-center bg-white border border-dashed border-neutral-200 rounded-md shadow-card">
          <p className="text-neutral-400 font-medium">No documents uploaded yet.</p>
        </div>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import { DocumentArtifact } from "@/types";

export function useDocumentsSection(documents: DocumentArtifact[]) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openDocument = (document: DocumentArtifact) => {
    if (document.url?.trim() && document.url !== "#") {
      window.open(document.url, "_blank", "noopener,noreferrer");
    }
  };

  return {
    displayedDocs: documents,
    hasMoreDocuments: false,
    isModalOpen,
    closeModal: () => setIsModalOpen(false),
    openDocument,
    openModal: () => setIsModalOpen(true),
  };
}

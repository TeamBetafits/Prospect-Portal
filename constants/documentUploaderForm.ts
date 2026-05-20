import { FormDataDefinition } from '@/types/form';
import { DOCUMENT_TYPE_OPTIONS } from './documentTypes';

/**
 * Document Uploader Form
 * Form ID: recsLJiBVdED8EEbr
 */
export const DOCUMENT_UPLOADER_FORM_DATA: FormDataDefinition = {
    id: 'recsLJiBVdED8EEbr',
    title: 'Document Uploader',
    pages: [
        {
            id: 'document-upload',
            name: 'Upload Documents',
            sections: [
                {
                    id: 'upload-info',
                    title: 'Document Information',
                    description: 'Please provide information about the documents you are uploading',
                    questions: [
                        {
                            id: 'file',
                            label: 'Select Document',
                            type: 'file',
                            required: true,
                            placeholder: 'Choose a file to upload',
                            accept: '.pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png',
                            validation: [{ type: 'required', message: 'Please select a file to upload' }]
                        },
                        {
                            id: 'documentType',
                            label: 'Document Type',
                            type: 'select',
                            required: true,
                            placeholder: 'Select document type',
                            options: DOCUMENT_TYPE_OPTIONS,
                            validation: [{ type: 'required', message: 'Document type is required' }]
                        },
                        {
                            id: 'documentDescription',
                            label: 'Document Description',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Describe the document you are uploading'
                        },
                        {
                            id: 'uploadNotes',
                            label: 'Additional Notes',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Any additional notes about the document'
                        }
                    ]
                }
            ]
        },
        {
            id: 'review',
            name: 'Review',
            sections: [
                {
                    id: 'review-info',
                    title: 'Review Your Information',
                    questions: [
                        {
                            id: 'confirmAccuracy',
                            label: 'I confirm that all information provided is accurate',
                            type: 'radio',
                            required: true,
                            options: [
                                { value: 'yes', label: 'Yes, all information is accurate' }
                            ],
                            validation: [{ type: 'required', message: 'Please confirm accuracy' }]
                        }
                    ]
                }
            ]
        }
    ]
};

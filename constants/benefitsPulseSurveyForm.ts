import { FormDataDefinition } from '@/types/form';

export const BENEFITS_PULSE_SURVEY_FORM_DATA: FormDataDefinition = {
    id: 'eQ7FVU76PDus',
    title: 'Employee Feedback Survey',
    pages: [
        {
            id: 'employee-feedback',
            name: 'Employee Feedback',
            sections: [
                {
                    id: 'employee-context',
                    title: 'Employee Information',
                    description: 'Tell us how you are currently enrolled so Betafits can better understand employee sentiment.',
                    questions: [
                        {
                            id: 'kGqMobiUDPcHQXPEsEWGhs',
                            label: 'Company',
                            type: 'text',
                            required: false,
                            placeholder: 'Company name'
                        },
                        {
                            id: 'bNkoRCS16B1NF8Vu3Kz9JR',
                            label: 'Benefit Year',
                            type: 'radio',
                            required: false,
                            options: [
                                { value: '2026', label: '2026' },
                                { value: '2025', label: '2025' }
                            ]
                        },
                        {
                            id: '9xm1AdHoV7ZErSGuemYwT3',
                            label: 'How are you currently enrolled for health benefits?',
                            type: 'radio',
                            required: true,
                            options: [
                                { value: 'employee_only', label: 'Employee Only' },
                                { value: 'employee_spouse', label: 'Employee + Spouse' },
                                { value: 'employee_children', label: 'Employee + Child(ren)' },
                                { value: 'family', label: 'Family' },
                                { value: 'waived', label: 'Waived' },
                                { value: 'not_eligible', label: 'Not Eligible' }
                            ],
                            validation: [{ type: 'required', message: 'Please select your enrollment status.' }]
                        },
                        {
                            id: '9rvPU3rfdvaY6355Si6DTP',
                            label: 'On which medical plan are you enrolled?',
                            type: 'text',
                            required: false,
                            placeholder: 'Enter your current plan name'
                        }
                    ]
                },
                {
                    id: 'ratings',
                    title: 'Benefit Ratings',
                    description: 'Rate each area from 1 to 5.',
                    questions: [
                        {
                            id: '1tTsT4b7YxSrc2e8bTQtMD',
                            label: 'Overall Benefits Package',
                            type: 'number',
                            required: true,
                            placeholder: '1 to 5',
                            validation: [
                                { type: 'required', message: 'Please rate the overall benefits package.' },
                                { type: 'min', value: 1, message: 'Rating must be at least 1.' },
                                { type: 'max', value: 5, message: 'Rating must be at most 5.' }
                            ]
                        },
                        {
                            id: 'eVZknTJzZyJ8XMoKqUeVFW',
                            label: 'Medical Plan Options',
                            type: 'number',
                            required: true,
                            placeholder: '1 to 5',
                            validation: [
                                { type: 'required', message: 'Please rate the medical plan options.' },
                                { type: 'min', value: 1, message: 'Rating must be at least 1.' },
                                { type: 'max', value: 5, message: 'Rating must be at most 5.' }
                            ]
                        },
                        {
                            id: '4UCLbaHFiRB9ARDkPVvqDd',
                            label: 'Medical Network',
                            type: 'number',
                            required: true,
                            placeholder: '1 to 5',
                            validation: [
                                { type: 'required', message: 'Please rate the medical network.' },
                                { type: 'min', value: 1, message: 'Rating must be at least 1.' },
                                { type: 'max', value: 5, message: 'Rating must be at most 5.' }
                            ]
                        },
                        {
                            id: 'gEoRfJNxN37JVkvyow4NWU',
                            label: 'Employee Costs',
                            type: 'number',
                            required: true,
                            placeholder: '1 to 5',
                            validation: [
                                { type: 'required', message: 'Please rate employee costs.' },
                                { type: 'min', value: 1, message: 'Rating must be at least 1.' },
                                { type: 'max', value: 5, message: 'Rating must be at most 5.' }
                            ]
                        },
                        {
                            id: 'qgw9BnxZsRS2b3oc5iH5ej',
                            label: 'Other Benefits (Non-Medical)',
                            type: 'number',
                            required: true,
                            placeholder: '1 to 5',
                            validation: [
                                { type: 'required', message: 'Please rate non-medical benefits.' },
                                { type: 'min', value: 1, message: 'Rating must be at least 1.' },
                                { type: 'max', value: 5, message: 'Rating must be at most 5.' }
                            ]
                        },
                        {
                            id: '6EbFGLKbaNEhDbn4FyCD2J',
                            label: 'Comments',
                            type: 'textarea',
                            required: false,
                            placeholder: 'Share any additional comments about your benefits experience'
                        },
                        {
                            id: '8w6e',
                            label: 'Type your question here',
                            type: 'text',
                            required: false,
                            placeholder: 'Optional question for the Betafits team'
                        }
                    ]
                }
            ]
        }
    ]
};

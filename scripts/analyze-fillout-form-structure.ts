/**
 * Fillout Form Structure Analyzer
 *
 *
 * This script analyzes Fillout form structure by accessing the forms
 * and extracting field definitions, validation rules, and conditional logic.
 */

interface FilloutFormStructure {
   templateId: string;
   formName: string;
   pages: FilloutPage[];
   totalQuestions: number;
   estimatedTime: string;
}

interface FilloutPage {
   id: string;
   name: string;
   order: number;
   sections: FilloutSection[];
}

interface FilloutSection {
   id: string;
   title: string;
   description?: string;
   fields: FilloutField[];
}

interface FilloutField {
   id: string;
   label: string;
   type:
      | 'text'
      | 'number'
      | 'email'
      | 'select'
      | 'radio'
      | 'checkbox'
      | 'date'
      | 'textarea'
      | 'file'
      | 'phone'
      | 'url';
   required: boolean;
   placeholder?: string;
   options?: { value: string; label: string }[];
   validation?: {
      type: 'required' | 'min' | 'max' | 'pattern' | 'email' | 'url';
      value?: any;
      message: string;
   }[];
   conditionalLogic?: {
      showIf?: {
         field: string;
         operator: 'equals' | 'notEquals' | 'contains';
         value: any;
      };
      hideIf?: {
         field: string;
         operator: 'equals' | 'notEquals' | 'contains';
         value: any;
      };
   };
   airtableMapping?: string;
}

// Fillout form URLs from analysis
const FILLOUT_FORMS = [
   {
      templateId: 'eBxXtLZdK4us',
      name: 'Quick Start (Current Benefits) Multi-Page',
      url: 'https://betafits.fillout.com/t/eBxXtLZdK4us',
   },
   {
      templateId: 'rZhiEaUEskus',
      name: 'Update Quickstart (w/ current benefits)',
      url: 'https://betafits.fillout.com/t/rZhiEaUEskus',
   },
   {
      templateId: 'gn6WNJPJKTus',
      name: 'Update PEO/HR',
      url: 'https://betafits.fillout.com/t/gn6WNJPJKTus',
   },
   {
      templateId: 'urHF8xDu7eus',
      name: 'Update Broker Role',
      url: 'https://betafits.fillout.com/t/urHF8xDu7eus',
   },
];

console.log('📋 Fillout Forms to Analyze:');
FILLOUT_FORMS.forEach((form, idx) => {
   console.log(`   ${idx + 1}. ${form.name} (${form.templateId})`);
   console.log(`      URL: ${form.url}`);
});
console.log(
   '\n💡 Use browser automation to extract form structure from each URL.',
);
console.log(
   '💡 Then generate React form components matching the exact structure.',
);

export { FilloutFormStructure, FILLOUT_FORMS };

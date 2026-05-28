import json, os

os.chdir(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

with open("fillout-forms-analysis.json", "r") as f:
    data = json.load(f)

US_STATES = [
    "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
    "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
    "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
    "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
    "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
    "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
    "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
    "Virginia","Washington","West Virginia","Wisconsin","Wyoming"
]

REVIEW_PAGE = {
    "id": "review",
    "name": "Review",
    "sections": [{
        "id": "review-info",
        "title": "Review Your Information",
        "questions": [{
            "id": "confirmAccuracy",
            "label": "I confirm that all information provided is accurate",
            "type": "radio",
            "required": True,
            "options": ["Yes, all information is accurate"]
        }]
    }]
}

pages_data = {

  "rec4V98J6aPaM3u9H": {
    "componentFile": "components/forms/MedicalCoverageSurveyForm.tsx",
    "constantsFile": "constants/medicalCoverageSurveyForm.ts",
    "pages": [
      {"id": "medical-coverage", "name": "Medical Coverage Information", "sections": [
        {"id": "coverage-details", "title": "Current Medical Coverage", "questions": [
          {"id": "hasMedicalCoverage", "label": "Do you currently have medical coverage?", "type": "radio", "required": True, "options": ["Yes", "No"]},
          {"id": "coverageType", "label": "Type of Coverage", "type": "select", "required": False, "options": ["Individual","Family","Employer-Provided","Other"]},
          {"id": "insuranceCarrier", "label": "Insurance Carrier", "type": "text", "required": False},
          {"id": "planName", "label": "Plan Name", "type": "text", "required": False},
          {"id": "coverageNotes", "label": "Additional Coverage Information", "type": "textarea", "required": False}
        ]}
      ]},
      REVIEW_PAGE
    ]
  },

  "rec7NfuiBQ8wrEmu7": {
    "componentFile": "components/forms/WorkersCompensationForm.tsx",
    "constantsFile": "constants/workersCompensationForm.ts",
    "pages": [
      {"id": "workers-comp", "name": "Workers Compensation Information", "sections": [
        {"id": "comp-details", "title": "Workers Compensation Details", "questions": [
          {"id": "hasWorkersComp", "label": "Do you currently have workers compensation coverage?", "type": "radio", "required": True, "options": ["Yes", "No"]},
          {"id": "compCarrier", "label": "Workers Compensation Carrier", "type": "text", "required": False},
          {"id": "policyNumber", "label": "Policy Number", "type": "text", "required": False},
          {"id": "coverageStates", "label": "States Covered", "type": "textarea", "required": False},
          {"id": "compNotes", "label": "Additional Information", "type": "textarea", "required": False}
        ]}
      ]},
      REVIEW_PAGE
    ]
  },

  "recFVcfdoXkUjIcod": {
    "componentFile": "components/forms/AddNewGroupForm.tsx",
    "constantsFile": "constants/addNewGroupForm.ts",
    "pages": [
      {"id": "group-info", "name": "Group Information", "sections": [
        {"id": "basic-info", "title": "Basic Group Information", "questions": [
          {"id": "groupName", "label": "Group Name", "type": "text", "required": True},
          {"id": "groupType", "label": "Group Type", "type": "select", "required": False, "options": ["Corporate","Non-Profit","Government","Other"]},
          {"id": "employeeCount", "label": "Number of Employees", "type": "number", "required": False},
          {"id": "groupDescription", "label": "Group Description", "type": "textarea", "required": False}
        ]}
      ]},
      REVIEW_PAGE
    ]
  },

  "recFxyNqTLDdrxXN2": {
    "componentFile": "components/forms/BenefitsAdministrationForm.tsx",
    "constantsFile": "constants/benefitsAdministrationForm.ts",
    "pages": [
      {"id": "admin-info", "name": "Administration Information", "sections": [
        {"id": "admin-details", "title": "Benefits Administration Details", "questions": [
          {"id": "currentAdmin", "label": "Current Benefits Administrator", "type": "text", "required": False},
          {"id": "adminServices", "label": "Administration Services Used", "type": "textarea", "required": False},
          {"id": "satisfactionLevel", "label": "Satisfaction Level with Current Administration", "type": "select", "required": False, "options": ["Very Satisfied","Satisfied","Neutral","Dissatisfied","Very Dissatisfied"]},
          {"id": "adminNotes", "label": "Additional Administration Information", "type": "textarea", "required": False}
        ]}
      ]},
      REVIEW_PAGE
    ]
  },

  "recGrsR8Sdx96pckJ": {
    "componentFile": "components/forms/BenefitsComplianceForm.tsx",
    "constantsFile": "constants/benefitsComplianceForm.ts",
    "pages": [
      {"id": "compliance-info", "name": "Compliance Information", "sections": [
        {"id": "compliance-details", "title": "Benefits Compliance Details", "questions": [
          {"id": "complianceConcerns", "label": "Compliance Concerns", "type": "textarea", "required": False},
          {"id": "currentComplianceStatus", "label": "Current Compliance Status", "type": "select", "required": False, "options": ["Fully Compliant","Mostly Compliant","Some Compliance Issues","Non-Compliant","Unknown"]},
          {"id": "complianceAudits", "label": "Recent Compliance Audits", "type": "textarea", "required": False},
          {"id": "complianceNotes", "label": "Additional Compliance Information", "type": "textarea", "required": False}
        ]}
      ]},
      REVIEW_PAGE
    ]
  },

  "recKzuznmqq29uASl": {
    "componentFile": "components/forms/PEOEORAssessmentForm.tsx",
    "constantsFile": "constants/peoEORAssessmentForm.ts",
    "pages": [
      {"id": "peo-assessment", "name": "PEO/EOR Assessment", "sections": [
        {"id": "assessment-details", "title": "Assessment Information", "questions": [
          {"id": "currentPEO", "label": "Current PEO/EOR Provider", "type": "text", "required": False},
          {"id": "peoServices", "label": "PEO/EOR Services Used", "type": "textarea", "required": False},
          {"id": "satisfactionLevel", "label": "Satisfaction Level", "type": "select", "required": False, "options": ["Very Satisfied","Satisfied","Neutral","Dissatisfied","Very Dissatisfied"]},
          {"id": "assessmentNotes", "label": "Assessment Notes", "type": "textarea", "required": False}
        ]}
      ]},
      REVIEW_PAGE
    ]
  },

  "recOE9pVakkobVzU7": {
    "componentFile": "components/forms/AppointBetafitsForm.tsx",
    "constantsFile": None,
    "pages": [
      {"id": "intro", "name": "Intro", "note": "Welcome page with loading/error states. No user fields.", "sections": [
        {"id": "intro-content", "title": "Welcome", "questions": []}
      ]},
      {"id": "company-info", "name": "Company Information", "sections": [
        {"id": "company-details", "title": "Company Information", "questions": [
          {"id": "companyName", "label": "Company Name", "type": "text", "required": False},
          {"id": "dba", "label": "DBA (if applicable)", "type": "text", "required": False},
          {"id": "address", "label": "Address", "type": "text", "required": False},
          {"id": "city", "label": "City", "type": "text", "required": False},
          {"id": "stateProvince", "label": "State / Province", "type": "select", "required": False, "options": US_STATES},
          {"id": "zipPostalCode", "label": "ZIP / Postal Code", "type": "text", "required": False},
          {"id": "companyEin", "label": "Company EIN", "type": "text", "required": False},
          {"id": "companyLogo", "label": "Company Logo", "type": "file", "required": False}
        ]},
        {"id": "primary-contact", "title": "Primary Contact", "questions": [
          {"id": "primaryContactName", "label": "Primary Contact Name", "type": "text", "required": False},
          {"id": "primaryContactEmail", "label": "Primary Contact Email", "type": "email", "required": False},
          {"id": "primaryContactPhone", "label": "Primary Contact Phone", "type": "phone", "required": False},
          {"id": "primaryContactTitle", "label": "Primary Contact Title", "type": "text", "required": False}
        ]},
        {"id": "confirm-signer", "title": "Confirm Company Signer", "questions": [
          {"id": "primaryContactIsAuthorizedSigner", "label": "Is the primary contact the authorized signer for the BOR letter?", "type": "radio", "required": True, "options": ["Yes","No"]},
          {"id": "alternateSignerName", "label": "Alternate Signer Name", "type": "text", "required": False, "conditional": "primaryContactIsAuthorizedSigner=No"},
          {"id": "alternateSignerTitle", "label": "Alternate Signer Title", "type": "text", "required": False, "conditional": "primaryContactIsAuthorizedSigner=No"},
          {"id": "alternateSignerEmail", "label": "Alternate Signer Email", "type": "email", "required": False, "conditional": "primaryContactIsAuthorizedSigner=No"},
          {"id": "alternateSignerPhone", "label": "Alternate Signer Phone", "type": "phone", "required": False, "conditional": "primaryContactIsAuthorizedSigner=No"}
        ]}
      ]},
      {"id": "insurance-policies", "name": "Existing Insurance Policies", "note": "Repeating block — user can add multiple policies", "sections": [
        {"id": "policy-details", "title": "Policy Details", "questions": [
          {"id": "carrierName", "label": "Carrier Name", "type": "text", "required": False},
          {"id": "lineOfCoverage", "label": "Line of Coverage", "type": "select", "required": False, "options": ["Medical","Dental","Vision","Life","Disability","Voluntary Benefits","Other"]},
          {"id": "policyNumber", "label": "Policy Number", "type": "text", "required": False},
          {"id": "effectiveDate", "label": "Policy Effective Date", "type": "date", "required": False},
          {"id": "renewalDate", "label": "Renewal Date", "type": "date", "required": False},
          {"id": "policyNotes", "label": "Notes / Comments", "type": "textarea", "required": False},
          {"id": "addAnotherPolicy", "label": "Add another policy?", "type": "radio", "required": False, "options": ["Yes","No"]}
        ]}
      ]},
      {"id": "bor-details", "name": "BOR Appointment Details", "sections": [
        {"id": "bor-info", "title": "BOR Appointment Details", "questions": [
          {"id": "borEffectiveDate", "label": "Effective Date when Betafits will be appointed as BOR", "type": "date", "required": False},
          {"id": "serviceAgreementPreference", "label": "Would you like to consider a service agreement where Betafits is paid by direct fees instead of commissions?", "type": "radio", "required": False, "options": ["Yes, I'd like to explore that option","No, we'll stay with standard commission"]}
        ]}
      ]},
      {"id": "review", "name": "Review", "note": "Read-only review of all previous answers", "sections": [
        {"id": "review-content", "title": "Review Your Information", "questions": []}
      ]}
    ]
  },

  "recOt6cX0t1DksDFT": {
    "componentFile": "components/forms/HRTechForm.tsx",
    "constantsFile": "constants/hrTechForm.ts",
    "pages": [
      {"id": "hr-tech-info", "name": "HR Technology Information", "sections": [
        {"id": "tech-details", "title": "HR Technology Details", "questions": [
          {"id": "currentHRSystem", "label": "Current HR System", "type": "text", "required": False},
          {"id": "hrTechServices", "label": "HR Technology Services Used", "type": "textarea", "required": False},
          {"id": "satisfactionLevel", "label": "Satisfaction Level", "type": "select", "required": False, "options": ["Very Satisfied","Satisfied","Neutral","Dissatisfied","Very Dissatisfied"]},
          {"id": "hrTechNotes", "label": "Additional HR Technology Information", "type": "textarea", "required": False}
        ]}
      ]},
      REVIEW_PAGE
    ]
  },

  "recUnTZFK5UyfWqzm": {
    "componentFile": "components/forms/ComprehensiveIntakeForm.tsx",
    "constantsFile": "constants/comprehensiveIntakeForm.ts",
    "pages": [
      {"id": "company-info", "name": "Company Information", "sections": [
        {"id": "basic-info", "title": "Basic Company Information", "questions": [
          {"id": "companyName", "label": "Company Name", "type": "text", "required": True},
          {"id": "industry", "label": "Industry", "type": "select", "required": False, "options": ["Technology","Healthcare","Finance","Retail","Manufacturing","Other"]},
          {"id": "employeeCount", "label": "Number of Employees", "type": "number", "required": False}
        ]}
      ]},
      {"id": "contact-info", "name": "Contact Information", "sections": [
        {"id": "contact-details", "title": "Contact Details", "questions": [
          {"id": "firstName", "label": "First Name", "type": "text", "required": True},
          {"id": "lastName", "label": "Last Name", "type": "text", "required": True},
          {"id": "email", "label": "Email", "type": "email", "required": True},
          {"id": "phone", "label": "Phone", "type": "text", "required": True}
        ]}
      ]},
      {"id": "benefits-info", "name": "Benefits Information", "sections": [
        {"id": "benefits-details", "title": "Current Benefits", "questions": [
          {"id": "currentBenefits", "label": "Current Benefits Overview", "type": "textarea", "required": False},
          {"id": "benefitsGoals", "label": "Benefits Goals", "type": "textarea", "required": False}
        ]}
      ]},
      REVIEW_PAGE
    ]
  },

  "recdjXjySYuYUGkdP": {
    "componentFile": "components/forms/PremiumsContributionStrategyForm.tsx",
    "constantsFile": "constants/premiumsContributionStrategyForm.ts",
    "pages": [
      {"id": "premiums-info", "name": "Premiums & Contribution Information", "sections": [
        {"id": "premiums-details", "title": "Premium and Contribution Details", "questions": [
          {"id": "currentPremium", "label": "Current Monthly Premium (Per Employee)", "type": "number", "required": False},
          {"id": "employerContribution", "label": "Employer Contribution Percentage", "type": "number", "required": False},
          {"id": "contributionStrategy", "label": "Contribution Strategy", "type": "select", "required": False, "options": ["Fixed Dollar Amount","Percentage of Premium","Tiered Structure","Other"]},
          {"id": "strategyNotes", "label": "Strategy Notes", "type": "textarea", "required": False}
        ]}
      ]},
      REVIEW_PAGE
    ]
  },

  "rechTHxZIxS3bBcqF": {
    "componentFile": "components/forms/BasicIntakeForm.tsx",
    "constantsFile": "constants/basicIntakeForm.ts",
    "pages": [
      {"id": "basic-info", "name": "Basic Information", "sections": [
        {"id": "company-contact", "title": "Company and Contact Information", "questions": [
          {"id": "companyName", "label": "Company Name", "type": "text", "required": True},
          {"id": "firstName", "label": "First Name", "type": "text", "required": True},
          {"id": "lastName", "label": "Last Name", "type": "text", "required": True},
          {"id": "email", "label": "Email", "type": "email", "required": True},
          {"id": "phone", "label": "Phone", "type": "text", "required": True},
          {"id": "employeeCount", "label": "Number of Employees", "type": "number", "required": False}
        ]}
      ]},
      REVIEW_PAGE
    ]
  },

  "reclUQ6KhVzCssuVl": {
    "componentFile": "components/forms/QuickStartNewBenefitsForm.tsx",
    "constantsFile": "constants/quickStartNewBenefitsForm.ts",
    "pages": [
      {"id": "company-info", "name": "Company Information", "sections": [
        {"id": "contact-info", "title": "Contact Information", "questions": [
          {"id": "firstName", "label": "First Name", "type": "text", "required": True},
          {"id": "lastName", "label": "Last Name", "type": "text", "required": True},
          {"id": "email", "label": "Email", "type": "email", "required": True},
          {"id": "phone", "label": "Phone", "type": "text", "required": True}
        ]},
        {"id": "company-details", "title": "Company Details", "questions": [
          {"id": "companyName", "label": "Company Name", "type": "text", "required": True},
          {"id": "employeeCount", "label": "Number of Employees", "type": "number", "required": False}
        ]}
      ]},
      {"id": "new-benefits", "name": "New Benefits", "sections": [
        {"id": "benefits-info", "title": "New Benefits Information", "questions": [
          {"id": "benefitsNeeded", "label": "Benefits Needed", "type": "textarea", "required": False},
          {"id": "targetStartDate", "label": "Target Start Date", "type": "date", "required": False},
          {"id": "benefitsNotes", "label": "Additional Information", "type": "textarea", "required": False}
        ]}
      ]},
      REVIEW_PAGE
    ]
  },

  "recmB9IdRhtgckvaY": {
    "componentFile": "components/forms/BenefitsPulseSurveyForm.tsx",
    "constantsFile": "constants/benefitsPulseSurveyForm.ts",
    "pages": [
      {"id": "employee-feedback", "name": "Employee Feedback", "sections": [
        {"id": "employee-context", "title": "Employee Information", "questions": [
          {"id": "kGqMobiUDPcHQXPEsEWGhs", "label": "Company", "type": "text", "required": False},
          {"id": "bNkoRCS16B1NF8Vu3Kz9JR", "label": "Benefit Year", "type": "radio", "required": False, "options": ["2026","2025"]},
          {"id": "9xm1AdHoV7ZErSGuemYwT3", "label": "How are you currently enrolled for health benefits?", "type": "radio", "required": True, "options": ["Employee Only","Employee + Spouse","Employee + Child(ren)","Family","Waived","Not Eligible"]},
          {"id": "9rvPU3rfdvaY6355Si6DTP", "label": "On which medical plan are you enrolled?", "type": "text", "required": False}
        ]},
        {"id": "ratings", "title": "Benefit Ratings (1-5 scale)", "questions": [
          {"id": "1tTsT4b7YxSrc2e8bTQtMD", "label": "Overall Benefits Package", "type": "number", "required": True, "min": 1, "max": 5},
          {"id": "eVZknTJzZyJ8XMoKqUeVFW", "label": "Medical Plan Options", "type": "number", "required": True, "min": 1, "max": 5},
          {"id": "4UCLbaHFiRB9ARDkPVvqDd", "label": "Medical Network", "type": "number", "required": True, "min": 1, "max": 5},
          {"id": "gEoRfJNxN37JVkvyow4NWU", "label": "Employee Costs", "type": "number", "required": True, "min": 1, "max": 5},
          {"id": "qgw9BnxZsRS2b3oc5iH5ej", "label": "Other Benefits (Non-Medical)", "type": "number", "required": True, "min": 1, "max": 5},
          {"id": "6EbFGLKbaNEhDbn4FyCD2J", "label": "Comments", "type": "textarea", "required": False},
          {"id": "8w6e", "label": "Question for the Betafits team", "type": "text", "required": False}
        ]}
      ]}
    ]
  },

  "recsLJiBVdED8EEbr": {
    "componentFile": "components/forms/DocumentUploaderForm.tsx",
    "constantsFile": "constants/documentUploaderForm.ts",
    "pages": [
      {"id": "document-upload", "name": "Upload Documents", "sections": [
        {"id": "upload-info", "title": "Document Information", "questions": [
          {"id": "file", "label": "Select Document", "type": "file", "required": True},
          {"id": "documentType", "label": "Document Type", "type": "select", "required": True, "optionsRef": "constants/documentTypes.ts DOCUMENT_TYPE_OPTIONS"},
          {"id": "documentDescription", "label": "Document Description", "type": "textarea", "required": False},
          {"id": "uploadNotes", "label": "Additional Notes", "type": "textarea", "required": False}
        ]}
      ]},
      REVIEW_PAGE
    ]
  },

  "recufWIRuSFArZ9GG": {
    "componentFile": "components/forms/QuickStartForm.tsx",
    "constantsFile": None,
    "note": "Primary intake form — inline field definitions",
    "pages": [
      {"id": "intro", "name": "Intro", "note": "Documents checklist and Start button. No data fields.", "sections": [
        {"id": "intro-content", "title": "Welcome — Quick Start", "questions": []}
      ]},
      {"id": "company-info", "name": "Company Info", "sections": [
        {"id": "contact-information", "title": "Contact Information", "questions": [
          {"id": "firstName", "label": "First Name", "type": "text", "required": True},
          {"id": "lastName", "label": "Last Name", "type": "text", "required": True},
          {"id": "title", "label": "Title", "type": "text", "required": True},
          {"id": "phone", "label": "Phone", "type": "text", "required": True},
          {"id": "email", "label": "Email", "type": "email", "required": True}
        ]},
        {"id": "company-information", "title": "Company Information", "questions": [
          {"id": "companyName", "label": "Company Name", "type": "text", "required": True},
          {"id": "address", "label": "Address", "type": "text", "required": False},
          {"id": "city", "label": "City", "type": "text", "required": False},
          {"id": "stateProvince", "label": "State / Province", "type": "select", "required": False, "options": US_STATES},
          {"id": "zipCode", "label": "ZIP Code", "type": "text", "required": False},
          {"id": "ein", "label": "Employer Identification Number (EIN)", "type": "text", "required": False},
          {"id": "yearCompanyFounded", "label": "Year Company Founded", "type": "text", "required": False},
          {"id": "preferredSicCode", "label": "Preferred SIC Code", "type": "text", "required": False},
          {"id": "preferredNaicsCode", "label": "Preferred NAICS Code", "type": "text", "required": False},
          {"id": "benefitEligibleEmployees", "label": "How many benefit-eligible US employees does the company have?", "type": "radio", "required": True, "options": ["1 - 9","10 - 24","25 - 49","50 - 99","100 - 249","250 - 499","500 - 999","1000 - 4999","5000+"]},
          {"id": "estimatedBenefitEligibleEes", "label": "Estimated Benefit Eligible EEs", "type": "text", "required": False},
          {"id": "estimatedMedicalEnrolledEes", "label": "Estimated Medical Enrolled EEs", "type": "text", "required": False},
          {"id": "expectedHeadcountGrowth", "label": "Expected Headcount Growth (next 12 months)", "type": "text", "required": False}
        ]},
        {"id": "nda-section", "title": "Non-Disclosure Agreement (NDA) (Optional)", "questions": [
          {"id": "ndaRequested", "label": "Would you like Betafits to sign an NDA?", "type": "radio", "required": True, "options": ["yes","no"]},
          {"id": "ndaCompanyLegalName", "label": "Full legal name of the company", "type": "text", "required": False, "conditional": "ndaRequested=yes"},
          {"id": "entityType", "label": "Entity type", "type": "select", "required": False, "conditional": "ndaRequested=yes", "options": ["Corporation","Sole Proprietorship","Partnership","Limited Liability Company (LLC)","S-Corporation","Nonprofit","Other"]},
          {"id": "stateOfFormation", "label": "State of formation", "type": "select", "required": False, "conditional": "ndaRequested=yes", "options": US_STATES},
          {"id": "ndaSigner", "label": "Will you be the signer for the NDA?", "type": "radio", "required": False, "conditional": "ndaRequested=yes", "options": ["yes","no"]}
        ]}
      ]},
      {"id": "benefits-overview", "name": "Benefits", "sections": [
        {"id": "benefits-offered", "title": "Benefits Offered", "questions": [
          {"id": "benefitsOffered", "label": "Which benefits does the company offer (or plan to offer)?", "type": "checkbox", "required": True, "options": ["Medical","Dental","Vision","401(k)","Life","Disability","Other"]},
          {"id": "benefitsOtherText", "label": "Other benefits (specify)", "type": "text", "required": False, "conditional": "benefitsOffered includes Other"},
          {"id": "medicalBenefitOfferType", "label": "How do you currently offer medical benefits?", "type": "radio", "required": False, "conditional": "benefitsOffered includes Medical", "options": ["Fully Insured","Level Funded","Self-Funded","ICHRA/QSEHRA","Taxable Stipend","Fully Insured (PEO)","Other"]},
          {"id": "medicalBenefitOfferTypeOther", "label": "Describe your current medical benefit offering", "type": "text", "required": False, "conditional": "medicalBenefitOfferType=Other"}
        ]},
        {"id": "contribution-strategy", "title": "Contribution Strategy", "questions": [
          {"id": "medicalContributionStrategy", "label": "Medical contribution strategy", "type": "radio", "required": False, "options": ["Flat Dollar Employer Contribution","Percentage Employer Contribution","Flat Dollar Employee Contribution","Custom Amount for Each Plan/Tier","Other"]},
          {"id": "contributionToEmployee", "label": "Contribution to employee", "type": "text", "required": False, "conditional": "medicalContributionStrategy is Flat or Percentage"},
          {"id": "contributionToDependents", "label": "Contribution to dependents", "type": "text", "required": False, "conditional": "medicalContributionStrategy is Flat or Percentage"},
          {"id": "percentageAppliesOnlyBasePlan", "label": "Does this percentage apply only to the base plan?", "type": "radio", "required": False, "conditional": "medicalContributionStrategy=Percentage Employer Contribution", "options": ["yes","no"]},
          {"id": "contributionStrategyDescription", "label": "Describe your contribution strategy", "type": "textarea", "required": False, "conditional": "medicalContributionStrategy is Custom or Other"}
        ]},
        {"id": "peo-payroll", "title": "PEO & Payroll", "questions": [
          {"id": "usesPeo", "label": "Does the company currently use a PEO?", "type": "radio", "required": True, "options": ["Yes","No, we have never considered a PEO","No, we have considered but decided against"]},
          {"id": "peoUsed", "label": "Which PEO do you currently use?", "type": "select", "required": False, "conditional": "usesPeo=Yes", "options": ["Justworks","ADP TotalSource","TriNet","Insperity","Sequoia One","Paychex","Other"]},
          {"id": "peosEvaluated", "label": "Which PEOs have you evaluated?", "type": "checkbox", "required": False, "conditional": "usesPeo=Yes", "options": ["Justworks","ADP TotalSource","TriNet","Insperity","Sequoia One","Paychex","Other"]},
          {"id": "payrollProvider", "label": "Payroll provider", "type": "select", "required": True, "options": ["Rippling","ADP","Gusto","Paychex","Paycor","Paylocity","Other"]},
          {"id": "payrollFrequency", "label": "Payroll frequency", "type": "radio", "required": True, "options": ["Weekly","Biweekly","Semi-monthly","Monthly"]},
          {"id": "benefitDeductionFrequency", "label": "Benefit deduction frequency", "type": "radio", "required": False, "options": ["Weekly","Biweekly","Semi-Monthly","Monthly"]}
        ]},
        {"id": "package-conditions", "title": "Package Conditions", "questions": [
          {"id": "companyPackageConditions", "label": "Do any of the following apply to your company or benefits package?", "type": "checkbox", "required": False, "options": ["Additional Entities","Additional Locations","Multiple Eligibility Classes","Multiple Contribution Classes","None of the Above"]},
          {"id": "companyPackageConditionsDetails", "label": "Please provide details", "type": "textarea", "required": False, "conditional": "companyPackageConditions has non-None selections"}
        ]}
      ]},
      {"id": "benefit-preferences", "name": "Benefit Preference", "sections": [
        {"id": "plan-preferences", "title": "Plan Preferences", "questions": [
          {"id": "idealMedicalPlanCount", "label": "How many medical plans would you ideally like to offer?", "type": "radio", "required": False, "options": ["1","2","3","4","5+"]},
          {"id": "desiredPlanTypes", "label": "Which plan types are you interested in?", "type": "checkbox", "required": False, "options": ["HDHP with HSA (Bronze)","HDHP with HSA (Silver)","HDHP with HSA (Gold)","PPO (Bronze)","PPO (Silver)","PPO (Gold)","HMO","Not Sure","Other"]}
        ]},
        {"id": "importance-ratings", "title": "Feature Importance (matrix)", "questions": [
          {"id": "importanceRatings", "label": "Rate the importance of each feature", "type": "matrix", "required": False,
           "rows": ["Total Cost","Value for Money","Carrier Name/Market Share","Size of Network","Healthcare Navigation","Mental Health Resources","Telemedicine Access","Modern Technology and Support"],
           "columns": ["Not Important","Somewhat Important","Important","Very Important"]}
        ]},
        {"id": "pain-points-engagement", "title": "Pain Points & Employee Engagement", "questions": [
          {"id": "painPoints", "label": "Which of the following are pain points for your company?", "type": "checkbox", "required": False, "options": ["Lack of integration between HR and benefits systems of record","Too many carrier and vendor portals to manage","Open enrollment workload","Overall benefits strategy","Need better benchmarking against competitors","Healthcare benefits costs","Benefits compliance (ACA, COBRA, ERISA, HIPAA)","Poor perception of benefits by employees","Need better admin training","Benefits don't feel aligned with company culture","Communication of benefits to employees","401(k) is siloed from other benefits","Want better experience for employees","Lack of expert guidance from broker/consultant","Other"]},
          {"id": "questionnaireOpenness", "label": "Openness to employee benefits questionnaire", "type": "radio", "required": False, "options": ["We have done this before and would do it again","Open to it if it will save us money","Open to it if it is only for a few employees","Against it. Too invasive or too much of a hassle.","Not Sure"]},
          {"id": "employeeFeedbackPreference", "label": "Employee feedback engagement preference", "type": "radio", "required": False, "options": ["If it is an easy process let's do that now","Interested for the future or when the timing is right","I prefer not to directly engage employees about this","I would need to think about it"]}
        ]}
      ]},
      {"id": "upload-documents", "name": "Upload Documents", "sections": [
        {"id": "document-upload", "title": "Upload Documents", "questions": [
          {"id": "uploadedDocuments", "label": "Upload documents", "type": "file", "required": False, "note": "Repeating — each entry has file upload, documentType (from constants/documentTypes.ts), and optional description"},
          {"id": "benefitsNotes", "label": "Additional notes or context for Betafits", "type": "textarea", "required": False}
        ]}
      ]},
      {"id": "review", "name": "Review", "note": "Read-only review of all previous answers grouped by section", "sections": [
        {"id": "review-content", "title": "Review Your Answers", "questions": []}
      ]}
    ]
  },

  "recxH9Jrk10bbqU58": {
    "componentFile": "components/forms/BrokerRoleForm.tsx",
    "constantsFile": "constants/brokerRoleForm.ts",
    "pages": [
      {"id": "broker-info", "name": "Broker Information", "sections": [
        {"id": "contact-info", "title": "Contact Information", "questions": [
          {"id": "firstName", "label": "First Name", "type": "text", "required": True},
          {"id": "lastName", "label": "Last Name", "type": "text", "required": True},
          {"id": "email", "label": "Email", "type": "email", "required": True},
          {"id": "phone", "label": "Phone", "type": "text", "required": True}
        ]},
        {"id": "broker-details", "title": "Broker Details", "questions": [
          {"id": "brokerName", "label": "Broker/Company Name", "type": "text", "required": True},
          {"id": "brokerLicense", "label": "Broker License Number", "type": "text", "required": False},
          {"id": "brokerNotes", "label": "Additional Information", "type": "textarea", "required": False}
        ]}
      ]},
      REVIEW_PAGE
    ]
  },

  "recySUNj6jv47SOKr": {
    "componentFile": "components/forms/NDAForm.tsx",
    "constantsFile": "constants/ndaForm.ts",
    "note": "Component uses inline field definitions. constants/ndaForm.ts contains a simplified stub version.",
    "pages": [
      {"id": "nda-and-benefit-start", "name": "NDA & Benefit Start", "sections": [
        {"id": "nda-request", "title": "Non-Disclosure Agreement (NDA) (Optional)", "questions": [
          {"id": "ndaRequested", "label": "Non-Disclosure Agreement (NDA) — Would you like Betafits to sign an NDA before you upload any company and employee information?", "type": "radio", "required": True, "options": ["Yes","No"]},
          {"id": "companyLegalName", "label": "What is the company's full legal name?", "type": "text", "required": False, "conditional": "ndaRequested=Yes"},
          {"id": "entityStateFormation", "label": "What is the entity's state of formation?", "type": "text", "required": False, "conditional": "ndaRequested=Yes"},
          {"id": "entityType", "label": "What is the entity type?", "type": "text", "required": False, "conditional": "ndaRequested=Yes"},
          {"id": "userIsNdaSigner", "label": "Will you be the signer for the NDA?", "type": "radio", "required": True, "conditional": "ndaRequested=Yes", "options": ["Yes","No"]},
          {"id": "ndaSignerName", "label": "Name of the NDA Signer", "type": "text", "required": True, "conditional": "userIsNdaSigner=No"},
          {"id": "ndaSignerTitle", "label": "Title of the NDA Signer", "type": "text", "required": True, "conditional": "userIsNdaSigner=No"},
          {"id": "ndaSignerEmail", "label": "Email of the NDA Signer", "type": "email", "required": True, "conditional": "userIsNdaSigner=No"},
          {"id": "legalNameOfEntity", "label": "What is the Legal Name of the Entity?", "type": "text", "required": False, "conditional": "ndaRequested=Yes"},
          {"id": "entityTypeDetailed", "label": "Entity Type (Corporation, LLC, etc.)", "type": "text", "required": False, "conditional": "ndaRequested=Yes"},
          {"id": "entityStateFormationDetailed", "label": "What is the Entity State of Formation?", "type": "text", "required": False, "conditional": "ndaRequested=Yes"},
          {"id": "employerIdentificationNumber", "label": "Employer Identification Number", "type": "text", "required": False, "conditional": "ndaRequested=Yes"}
        ]},
        {"id": "benefit-start", "title": "Benefit Start Month", "questions": [
          {"id": "benefitStartMonth", "label": "Expected Benefit Start Month or Renewal of Medical Coverage", "type": "select", "required": True, "options": ["January 1","February 1","March 1","April 1","May 1","June 1","July 1","August 1","September 1","October 1","November 1","December 1"]}
        ]}
      ]}
    ]
  }
}

updated_count = 0
for form in data["forms"]:
    fid = form["formId"]
    if fid in pages_data:
        entry = pages_data[fid]
        form["pages"] = entry["pages"]
        form["componentFile"] = entry["componentFile"]
        if entry.get("constantsFile"):
            form["constantsFile"] = entry["constantsFile"]
        if entry.get("note"):
            form["note"] = entry["note"]
        updated_count += 1

data["generatedAt"] = "2026-05-25T00:00:00.000Z"
data["extractedFromComponents"] = True
data["componentExtractionNote"] = (
    "Pages extracted from React components in components/forms/ and their "
    "corresponding constants/. Some constants contain stub/simplified field "
    "definitions vs. the original Fillout forms."
)

print(f"Updated {updated_count} of {len(data['forms'])} forms")
with open("fillout-forms-analysis.json", "w") as f:
    json.dump(data, f, indent=2)
print("Done.")

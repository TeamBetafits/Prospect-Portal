import AppointBetafitsForm from "@/components/forms/AppointBetafitsForm";
import BasicIntakeForm from "@/components/forms/BasicIntakeForm";
import BenefitsAdministrationForm from "@/components/forms/BenefitsAdministrationForm";
import BenefitsComplianceForm from "@/components/forms/BenefitsComplianceForm";
import BenefitsPulseSurveyForm from "@/components/forms/BenefitsPulseSurveyForm";
import BrokerRoleForm from "@/components/forms/BrokerRoleForm";
import ComprehensiveIntakeForm from "@/components/forms/ComprehensiveIntakeForm";
import DocumentUploaderForm from "@/components/forms/DocumentUploaderForm";
import HRTechForm from "@/components/forms/HRTechForm";
import MedicalCoverageSurveyForm from "@/components/forms/MedicalCoverageSurveyForm";
import NDAForm from "@/components/forms/NDAForm";
import PEOEORAssessmentForm from "@/components/forms/PEOEORAssessmentForm";
import PremiumsContributionStrategyForm from "@/components/forms/PremiumsContributionStrategyForm";
import QuickStartAltForm from "@/components/forms/QuickStartAltForm";
import QuickStartNewBenefitsForm from "@/components/forms/QuickStartNewBenefitsForm";
import UpdateBrokerRoleForm from "@/components/forms/UpdateBrokerRoleForm";
import UpdatePEOHRForm from "@/components/forms/UpdatePEOHRForm";
import UpdateQuickstartForm from "@/components/forms/UpdateQuickstartForm";
import WorkersCompensationForm from "@/components/forms/WorkersCompensationForm";
import { MEDICAL_COVERAGE_SURVEY_FORM_DATA } from "@/constants/medicalCoverageSurveyForm";
import { getAppointBetafitsInitialValues } from "@/page-modules/forms/services/appointBetafitsPrefill";
import { getBenefitsPulseInitialValues } from "@/page-modules/forms/services/benefitsPulsePrefill";
import { PortalFormPageConfig } from "@/page-modules/forms/types/formWorkflow";

export const PORTAL_FORM_CONFIGS = {
  eq7fvu76pdus: {
    breadcrumbLabel: "Benefits Feedback Form",
    formComponent: BenefitsPulseSurveyForm,
    formId: "recmB9IdRhtgckvaY",
    formName: "Benefits Pulse Survey",
    progressStorageKey: "form_eQ7FVU76PDus_progress",
    subtitle: "Please complete this form to proceed.",
    title: "Benefits Feedback Form",
    loadInitialValues: getBenefitsPulseInitialValues,
  },
  gn6wnjpjktus: {
    breadcrumbLabel: "Update PEO/HR",
    formComponent: UpdatePEOHRForm,
    formId: "gn6WNJPJKTus",
    formName: "Update PEO/HR",
    progressStorageKey: "form_gn6WNJPJKTus_progress",
    subtitle: "Update your PEO/HR information and current benefits setup.",
    title: "Update PEO/HR",
  },
  rec4v98j6apam3u9h: {
    breadcrumbLabel: MEDICAL_COVERAGE_SURVEY_FORM_DATA.title,
    formComponent: MedicalCoverageSurveyForm,
    formId: MEDICAL_COVERAGE_SURVEY_FORM_DATA.id,
    formName: MEDICAL_COVERAGE_SURVEY_FORM_DATA.title,
    progressStorageKey: `form_${MEDICAL_COVERAGE_SURVEY_FORM_DATA.id}_progress`,
    subtitle: "Please complete this form to proceed.",
    title: MEDICAL_COVERAGE_SURVEY_FORM_DATA.title,
  },
  rec7nfuibq8wremu7: {
    breadcrumbLabel: "Workers Compensation",
    formComponent: WorkersCompensationForm,
    formId: "rec7NfuiBQ8wrEmu7",
    formName: "Workers Compensation",
    progressStorageKey: "form_rec7NfuiBQ8wrEmu7_progress",
    subtitle: "Please complete this form to proceed.",
    title: "Workers Compensation",
  },
  recdjxjysyuyugkdp: {
    breadcrumbLabel: "Premiums / Contribution Strategy",
    formComponent: PremiumsContributionStrategyForm,
    formId: "recdjXjySYuYUGkdP",
    formName: "Premiums / Contribution Strategy",
    progressStorageKey: "form_recdjXjySYuYUGkdP_progress",
    subtitle: "Please complete this form to proceed.",
    title: "Premiums / Contribution Strategy",
  },
  recfxynqtlddrxxn2: {
    breadcrumbLabel: "Benefits Administration",
    formComponent: BenefitsAdministrationForm,
    formId: "recFxyNqTLDdrxXN2",
    formName: "Benefits Administration",
    progressStorageKey: "form_recFxyNqTLDdrxXN2_progress",
    subtitle: "Please complete this form to proceed.",
    title: "Benefits Administration",
  },
  recgrsr8sdx96pckj: {
    breadcrumbLabel: "Benefits Compliance",
    formComponent: BenefitsComplianceForm,
    formId: "recGrsR8Sdx96pckJ",
    formName: "Benefits Compliance",
    progressStorageKey: "form_recGrsR8Sdx96pckJ_progress",
    subtitle: "Please complete this form to proceed.",
    title: "Benefits Compliance",
  },
  rechthxzixs3bbcqf: {
    breadcrumbLabel: "Basic Intake Form",
    formComponent: BasicIntakeForm,
    formId: "rechTHxZIxS3bBcqF",
    formName: "Basic Intake Form",
    progressStorageKey: "form_rechTHxZIxS3bBcqF_progress",
    subtitle: "Please complete this form to proceed.",
    title: "Basic Intake Form",
  },
  reckzuznmqq29uasl: {
    breadcrumbLabel: "PEO/EOR Assessment",
    formComponent: PEOEORAssessmentForm,
    formId: "recKzuznmqq29uASl",
    formName: "PEO/EOR Assessment",
    progressStorageKey: "form_recKzuznmqq29uASl_progress",
    subtitle: "Please complete this form to proceed.",
    title: "PEO/EOR Assessment",
  },
  recluq6khvzcssuvl: {
    breadcrumbLabel: "Quick Start (New Benefits)",
    formComponent: QuickStartNewBenefitsForm,
    formId: "reclUQ6KhVzCssuVl",
    formName: "Quick Start (New Benefits)",
    progressStorageKey: "form_reclUQ6KhVzCssuVl_progress",
    subtitle: "Please complete this form to proceed.",
    title: "Quick Start (New Benefits)",
  },
  recmb9idrhtgckvay: {
    breadcrumbLabel: "Benefits Pulse Survey",
    formComponent: BenefitsPulseSurveyForm,
    formId: "recmB9IdRhtgckvaY",
    formName: "Benefits Pulse Survey",
    progressStorageKey: "form_recmB9IdRhtgckvaY_progress",
    subtitle: "Please complete this form to proceed.",
    title: "Benefits Pulse Survey",
  },
  recoe9pvakkobvzu7: {
    breadcrumbLabel: "Appoint Betafits",
    formComponent: AppointBetafitsForm,
    formId: "recOE9pVakkobVzU7",
    formName: "Appoint Betafits",
    progressStorageKey: "form_recOE9pVakkobVzU7_progress",
    subtitle: "Please complete this form to proceed.",
    title: "Appoint Betafits",
    loadInitialValues: getAppointBetafitsInitialValues,
  },
  recot6cx0t1dksdft: {
    breadcrumbLabel: "HR Tech",
    formComponent: HRTechForm,
    formId: "recOt6cX0t1DksDFT",
    formName: "HR Tech",
    progressStorageKey: "form_recOt6cX0t1DksDFT_progress",
    subtitle: "Please complete this form to proceed.",
    title: "HR Tech",
  },
  recsljibvded8eebr: {
    breadcrumbLabel: "Document Uploader",
    formComponent: DocumentUploaderForm,
    formId: "recsLJiBVdED8EEbr",
    formName: "Document Uploader",
    progressStorageKey: "form_recsLJiBVdED8EEbr_progress",
    subtitle: "Please complete this form to proceed.",
    submitMode: "documentUpload",
    title: "Document Uploader",
  },
  recufwirusfarz9gg: {
    breadcrumbLabel: "Quick Start",
    formComponent: QuickStartAltForm,
    formId: "recufWIRuSFArZ9GG",
    formName: "Quick Start",
    progressStorageKey: "form_recufWIRuSFArZ9GG_progress",
    subtitle: "Please complete this form to proceed.",
    title: "Quick Start",
  },
  recuntzfk5uyfwqzm: {
    breadcrumbLabel: "Comprehensive Intake",
    formComponent: ComprehensiveIntakeForm,
    formId: "recUnTZFK5UyfWqzm",
    formName: "Comprehensive Intake",
    progressStorageKey: "form_recUnTZFK5UyfWqzm_progress",
    subtitle: "Please complete this form to proceed.",
    title: "Comprehensive Intake",
  },
  recxh9jrk10bbqu58: {
    breadcrumbLabel: "Broker Role",
    formComponent: BrokerRoleForm,
    formId: "recxH9Jrk10bbqU58",
    formName: "Broker Role",
    progressStorageKey: "form_recxH9Jrk10bbqU58_progress",
    subtitle: "Please complete this form to proceed.",
    title: "Broker Role",
  },
  recysunj6jv47sokr: {
    breadcrumbLabel: "NDA",
    formComponent: NDAForm,
    formId: "recySUNj6jv47SOKr",
    formName: "NDA",
    progressStorageKey: "form_recySUNj6jv47SOKr_progress",
    subtitle: "Please complete this form to proceed.",
    title: "NDA",
  },
  rzhieaueskus: {
    breadcrumbLabel: "Update Quickstart",
    formComponent: UpdateQuickstartForm,
    formId: "rZhiEaUEskus",
    formName: "Update Quickstart (w/ current benefits)",
    progressStorageKey: "form_rZhiEaUEskus_progress",
    subtitle: "Update your organization profile and current benefits information.",
    title: "Update Quickstart (w/ current benefits)",
  },
  urhf8xdu7eus: {
    breadcrumbLabel: "Update Broker Role",
    formComponent: UpdateBrokerRoleForm,
    formId: "urHF8xDu7eus",
    formName: "Update Broker Role",
    progressStorageKey: "form_urHF8xDu7eus_progress",
    subtitle: "Update your broker information and client details.",
    title: "Update Broker Role",
  },
} satisfies Record<string, PortalFormPageConfig>;

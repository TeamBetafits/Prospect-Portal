import assert from "node:assert/strict";
import test from "node:test";
import { mapBorFormToSupabasePayloads } from "../lib/mappings/appointBetafitsMapping";
import { mapNdaFormToSupabasePayloads } from "../lib/mappings/ndaMapping";
import { mapQuickStartFormToSupabasePayloads } from "../lib/mappings/quickStartMapping";

test("quick start mapping emits canonical identity fields", () => {
  const payloads = mapQuickStartFormToSupabasePayloads({
    firstName: "Ada",
    lastName: "Lovelace",
    title: "Founder",
    phone: "+1 212.555.0199",
    email: " ADA@EXAMPLE.COM ",
    companyName: "Analytical Engines",
    zipCode: "100011234",
    ein: "123456789",
    preferredSicCode: " 8322 ",
    preferredNaicsCode: " 62 4190 ",
    benefitEligibleEmployees: "10 - 24",
    ndaRequested: "no",
  }, { nowISO: "2026-01-01T00:00:00.000Z", companyId: "company-1" });

  assert.equal(payloads.contacts.phone, "(212) 555-0199");
  assert.equal(payloads.contacts.email, "ada@example.com");
  assert.equal(payloads.entities.ein, "12-3456789");
  assert.equal(payloads.locations.zip_code, "10001-1234");
  assert.equal(payloads.companies.sic_code, "8322");
  assert.equal(payloads.companies.naics_code, "624190");
});

test("NDA mapping emits canonical EIN and signer email", () => {
  const payloads = mapNdaFormToSupabasePayloads({
    ndaRequested: "Yes",
    userIsNdaSigner: "No",
    ndaSignerName: "Ada Lovelace",
    ndaSignerTitle: "Founder",
    ndaSignerEmail: " ADA@EXAMPLE.COM ",
    employerIdentificationNumber: "123456789",
    benefitStartMonth: "January 1",
    legalNameOfEntity: "Analytical Engines LLC",
  }, { companyId: "company-1" });

  assert.equal(payloads.e_signature_signers.signer_email, "ada@example.com");
  assert.equal(payloads.entities.ein, "12-3456789");
});

test("Appoint Betafits mapping emits canonical EIN, phone, email, and ZIP", () => {
  const payloads = mapBorFormToSupabasePayloads({
    companyName: "Analytical Engines",
    dba: "",
    companyEin: "123456789",
    companyLogo: null,
    address: "1 Main St",
    city: "New York",
    stateProvince: "NY",
    zipPostalCode: "100011234",
    primaryContactName: "Ada Lovelace",
    primaryContactEmail: " ADA@EXAMPLE.COM ",
    primaryContactPhone: "+1 212.555.0199",
    primaryContactPhoneCountry: "US",
    primaryContactTitle: "Founder",
    primaryContactIsAuthorizedSigner: "No",
    alternateSignerName: "Grace Hopper",
    alternateSignerTitle: "COO",
    alternateSignerEmail: " GRACE@EXAMPLE.COM ",
    alternateSignerPhone: "6465550123",
    alternateSignerPhoneCountry: "US",
    borEffectiveDate: "",
    serviceAgreementPreference: "Yes",
  }, [], { companyId: "company-1" });

  assert.equal(payloads.entities.ein, "12-3456789");
  assert.equal(payloads.entities.primary_contact_email, "ada@example.com");
  assert.equal(payloads.entities.primary_contact_phone, "(212) 555-0199");
  assert.equal(payloads.entities.alternate_bor_signer_email, "grace@example.com");
  assert.equal(payloads.entities.alternate_bor_signer_phone, "(646) 555-0123");
  assert.equal(payloads.locations[0].zip_code, "10001-1234");
});

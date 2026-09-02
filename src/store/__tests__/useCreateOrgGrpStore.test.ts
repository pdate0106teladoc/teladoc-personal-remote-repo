import { describe, it, expect, beforeEach } from "vitest";
import useCreateOrgGrpStore, {
  emptyCreateOrgGrpBasicInfo,
  emptyCreateOrgGrpDetails,
  emptyCreateOrgGrpOpportunity,
} from "../useCreateOrgGrpStore";
import { CreateOrgGrpEntity, Opportunity } from "@/components/CreateOrgGrp/types";

const getState = () => useCreateOrgGrpStore.getState();

const opportunity: Opportunity = {
  title: "Expansion - BSBC North Carolina",
  status: "Closed Won",
  opportunityGUID: "GUID-1",
  gcrmContractNumber: "2025003-0012654",
  gcrmContractingAccount: "BSBC North Carolina",
  effectiveStartDate: "2026-01-01",
  effectiveEndDate: "2026-12-31",
  type: "New business",
};

const entity: CreateOrgGrpEntity = {
  entityName: "BCBS City of Charlotte",
  parentOrganization: "Blue Cross Blue Shield of NC",
  opportunity: "Expansion 2026",
  isBilling: false,
  lcrmTelemedAccount: {
    id: "tlmd-1",
    isNewAccount: true,
    accountName: "BCBS City of Charlotte",
    lcrmRelationship: "direct",
  },
  lcrmCcmAccount: {
    id: "ccm-1",
    isNewAccount: true,
    accountName: "BCBS City of Charlotte",
    lcrmRelationship: "direct",
  },
};

describe("useCreateOrgGrpStore", () => {
  beforeEach(() => {
    getState().reset();
  });

  it("starts empty", () => {
    const state = getState();
    expect(state.details).toEqual(emptyCreateOrgGrpDetails);
    expect(state.opportunity).toEqual(emptyCreateOrgGrpOpportunity);
    expect(state.basicInfo).toEqual(emptyCreateOrgGrpBasicInfo);
    expect(state.orgs).toEqual([]);
    expect(state.groups).toEqual([]);
  });

  it("merges initial form details", () => {
    getState().setDetails({
      priority: "NORMAL",
      launchOption: "later",
      workfrontId: "https://example.com/workfront",
    });

    expect(getState().details.priority).toBe("NORMAL");
    expect(getState().details.launchOption).toBe("later");
    expect(getState().details.workfrontId).toBe(
      "https://example.com/workfront",
    );
    expect(getState().details.createTypes).toEqual([]);
  });

  it("merges opportunity step data", () => {
    getState().setOpportunity({
      accountQuery: "BSBC",
      selectedOpportunities: [opportunity],
    });

    expect(getState().opportunity.accountQuery).toBe("BSBC");
    expect(getState().opportunity.selectedOpportunities).toEqual([
      opportunity,
    ]);
    expect(getState().opportunity.results).toEqual([]);
  });

  it("stores the bulk upload file", () => {
    const file = new File(["a"], "bulk.csv", { type: "text/csv" });
    getState().setBasicInfo({ bulkFile: file });
    expect(getState().basicInfo.bulkFile).toBe(file);
  });

  it("stores org and group entities", () => {
    getState().setOrgs([entity]);
    getState().setGroups([]);
    expect(getState().orgs).toEqual([entity]);
    expect(getState().groups).toEqual([]);
  });

  it("resets the whole create flow", () => {
    getState().setDetails({ priority: "HIGH" });
    getState().setOpportunity({ accountQuery: "foo" });
    getState().setOrgs([entity]);
    getState().reset();

    expect(getState().details).toEqual(emptyCreateOrgGrpDetails);
    expect(getState().opportunity).toEqual(emptyCreateOrgGrpOpportunity);
    expect(getState().orgs).toEqual([]);
  });
});

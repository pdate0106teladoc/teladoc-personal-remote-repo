export type Opportunity = {
    title: string;
    status: string;
    opportunityGUID: string;
    gcrmContractNumber: string;
    gcrmContractingAccount: string;
    effectiveStartDate: string;
    effectiveEndDate: string;
    type: string;
};

export type Opportunities = Opportunity[];

// Stands in for the task id the API will hand back once the flow is submitted.
export const createTaskId = (): string =>
    `O-${Math.floor(10000 + Math.random() * 90000)}`;

export type LaunchOption = "today" | "later" | "";
export type BasicInfoMethod = "upload" | "manual" | "";

export type CreateOrgGrpDetails = {
    taskId: string;
    priority: string;
    launchOption: LaunchOption;
    launchDate: Date | null;
    workfrontId: string;
    playbookLink: string;
    createTypes: string[];
    basicInfoMethod: BasicInfoMethod;
    files: string[];
};

export type CreateOrgGrpOpportunityStep = {
    accountQuery: string;
    opportunityQuery: string;
    results: Opportunities;
    selectedOpportunities: Opportunities;
};

export type CreateOrgGrpBasicInfo = {
    bulkFile: File | null;
    orgRecords: ManualEntityRecord[];
    groupRecords: ManualEntityRecord[];
};

export type HierarchyEntityType = "org" | "group";

export type HierarchyPlacement = {
    entityId: string;
    entityType: HierarchyEntityType;
    parentId: string;
    parentName: string;
};

export type CreateOrgGrpHierarchy = {
    parentQuery: string;
    selectedParentId: string;
    placements: HierarchyPlacement[];
};

export type ManualEntityRecord = {
    id: string;
    opportunityGuids: string[];
    name: string;
    isBillingOrg: boolean | null;
    startDate: Date | null;
};

// Only orgs carry the billing flag; the group form has no such field.
export const isManualRecordComplete = (
    record: ManualEntityRecord,
    requireBilling: boolean,
): boolean =>
    record.opportunityGuids.length > 0 &&
    record.name.trim().length > 0 &&
    (!requireBilling || record.isBillingOrg !== null) &&
    record.startDate !== null;

export const isManualBasicInfoComplete = (
    createTypes: string[],
    orgRecords: ManualEntityRecord[],
    groupRecords: ManualEntityRecord[],
): boolean => {
    const needOrgs = createTypes.includes("organizations");
    const needGroups = createTypes.includes("groups");
    if (
        needOrgs &&
        (orgRecords.length === 0 ||
            !orgRecords.every((record) => isManualRecordComplete(record, true)))
    ) {
        return false;
    }
    if (
        needGroups &&
        (groupRecords.length === 0 ||
            !groupRecords.every((record) => isManualRecordComplete(record, false)))
    ) {
        return false;
    }
    return needOrgs || needGroups;
};

export type LcrmRelationshipType =
    | "direct"
    | "parent_derived"
    | "DIRECT"
    | "PARENT_DERIVED";

export type LcrmSystem = "telemed" | "ccm";

export type LcrmAccount = {
    system: LcrmSystem;
    accountGuid: string;
    accountName: string;
    accountCreationDate: string;
    organizationName: string;
    clientManager: string;
    latestOpportunity: string;
    latestOpportunityUrl: string;
    revenueEffectiveDate: string;
    isVerified: boolean;
};

export type AccountType = {
    id: string;
    isNewAccount: boolean;
    accountName: string;
    lcrmRelationship: LcrmRelationshipType;
    searchQuery: string;
    selectedAccount: LcrmAccount | null;
};

export type CreateOrgGrpEntity = {
    entityId: string;
    entityName: string;
    parentOrganization: string;
    hasCcmProducts: boolean;
    lcrmTelemedAccount: AccountType;
    lcrmCcmAccount: AccountType;
    opportunity: string;
    isBilling: boolean;
};

export const isParentDerivedRelationship = (
    relationship: LcrmRelationshipType,
): boolean => relationship.toLowerCase() === "parent_derived";

export const isAccountLinked = (organization: CreateOrgGrpEntity): boolean =>
    organization.lcrmTelemedAccount.selectedAccount !== null;

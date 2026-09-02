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

export type LaunchOption = "today" | "later" | "";
export type BasicInfoMethod = "upload" | "manual" | "";

export type CreateOrgGrpDetails = {
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

export type AccountType = {
    id: string;
    isNewAccount: boolean;
    accountName: string;
    lcrmRelationship: LcrmRelationshipType;
};

export type CreateOrgGrpEntity = {
    entityName: string;
    parentOrganization: string;
    lcrmTelemedAccount: AccountType;
    lcrmCcmAccount: AccountType;
    opportunity: string;
    isBilling: boolean;
};

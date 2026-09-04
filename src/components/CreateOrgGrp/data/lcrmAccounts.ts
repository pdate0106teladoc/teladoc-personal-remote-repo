import { LcrmAccount, LcrmSystem } from "../types";

// Mock lookup data until the LCRM account search endpoint is wired up. Dates are
// kept display-ready because nothing here round-trips through the API yet.
export const LCRM_ACCOUNTS: LcrmAccount[] = [
    {
        system: "telemed",
        accountGuid: "3188F54A-D91D-6BF9-4867-CC9080ACDD65",
        accountName: "Blue Cross Blue Shield of NC",
        accountCreationDate: "Mar 1, 2009",
        organizationName: "Blue Cross Blue Shield of North Carolina",
        clientManager: "Lisa Smith",
        latestOpportunity: "Expansion - BSBC North Carolina - New Business 2026",
        latestOpportunityUrl: "https://lcrm.example.com/opportunity/BSBC-NC-2026",
        revenueEffectiveDate: "Jan 1, 2026",
        isVerified: true,
    },
    {
        system: "telemed",
        accountGuid: "5D22A910-77C4-4E0B-8F51-2A9066BB4471",
        accountName: "Blue Cross Blue Shield of NC - City of Charlotte",
        accountCreationDate: "Feb 9, 2015",
        organizationName: "Blue Cross Blue Shield of North Carolina",
        clientManager: "Marcus Lee",
        latestOpportunity: "Renewal - City of Charlotte - 2026",
        latestOpportunityUrl: "https://lcrm.example.com/opportunity/CLT-2026",
        revenueEffectiveDate: "Apr 1, 2026",
        isVerified: true,
    },
    {
        system: "telemed",
        accountGuid: "44F0B3D6-9E27-4C55-8A11-77B0CC1D5E93",
        accountName: "Blue Cross Blue Shield of North Dakota",
        accountCreationDate: "Sep 22, 2012",
        organizationName: "Blue Cross Blue Shield of North Dakota",
        clientManager: "Priya Nair",
        latestOpportunity: "Expansion - BSBC North Dakota - New Business 2026",
        latestOpportunityUrl: "https://lcrm.example.com/opportunity/BSBC-ND-2026",
        revenueEffectiveDate: "Jan 1, 2026",
        isVerified: true,
    },
    {
        system: "telemed",
        accountGuid: "C0D8471E-62F5-4B18-9AA3-55E1B9C7D204",
        accountName: "Blue Cross Blue Shield of Massachusetts",
        accountCreationDate: "Jul 5, 2010",
        organizationName: "Blue Cross Blue Shield of Massachusetts",
        clientManager: "Dana Whitfield",
        latestOpportunity: "Renewal - BCBS Massachusetts - 2026",
        latestOpportunityUrl: "https://lcrm.example.com/opportunity/BCBS-MA-2026",
        revenueEffectiveDate: "Feb 1, 2026",
        isVerified: true,
    },
    {
        system: "telemed",
        accountGuid: "7B5E90C3-14D8-4F62-A0B7-6C3390EE7A55",
        accountName: "Teladoc Health",
        accountCreationDate: "Jan 12, 2008",
        organizationName: "Teladoc Health",
        clientManager: "Alex Romero",
        latestOpportunity: "Teladoc Health - Commercial 2026",
        latestOpportunityUrl: "https://lcrm.example.com/opportunity/TDH-2026",
        revenueEffectiveDate: "Jan 1, 2026",
        isVerified: true,
    },
    {
        system: "telemed",
        accountGuid: "3188F54A-D91D-88F9-4957-CC3650ACDD63",
        accountName: "Aetna",
        accountCreationDate: "Jan 1, 2020",
        organizationName: "Aetna Health",
        clientManager: "Lisa Smith",
        latestOpportunity: "Aetna ASO Master Hunting License 2026 - 2027",
        latestOpportunityUrl: "https://lcrm.example.com/opportunity/AETNA-ASO-2026",
        revenueEffectiveDate: "Jan 1, 2026",
        isVerified: true,
    },
    {
        system: "telemed",
        accountGuid: "D7651931-543D-503C-DA9F-52527336A58C",
        accountName: "Aetna Fully Insured",
        accountCreationDate: "Jan 1, 2020",
        organizationName: "Aetna Health",
        clientManager: "John Williams",
        latestOpportunity: "Aetna Fully Insured Renewal 2026 - 2028 VFO",
        latestOpportunityUrl: "https://lcrm.example.com/opportunity/AETNA-FI-2026",
        revenueEffectiveDate: "Jan 1, 2026",
        isVerified: true,
    },
    {
        system: "telemed",
        accountGuid: "68C1AD05-7E39-4B84-91F2-0D4477A6C931",
        accountName: "UnitedHealthcare",
        accountCreationDate: "Nov 3, 2013",
        organizationName: "UnitedHealthcare",
        clientManager: "Sofia Bianchi",
        latestOpportunity: "UHC Employer & Individual - 2026",
        latestOpportunityUrl: "https://lcrm.example.com/opportunity/UHC-2026",
        revenueEffectiveDate: "Mar 1, 2026",
        isVerified: true,
    },
];

// Hierarchy stores the parent as "541 - Blue Cross Blue Shield of NC"; LCRM
// accounts are keyed on the name alone.
export const stripParentCode = (parentName: string): string =>
    parentName.replace(/^\d+\s*-\s*/, "").trim();

export const findLcrmAccountByName = (
    system: LcrmSystem,
    name: string,
): LcrmAccount | null => {
    const term = stripParentCode(name).toLowerCase();
    if (!term) return null;
    return (
        LCRM_ACCOUNTS.find(
            (account) =>
                account.system === system &&
                account.accountName.toLowerCase() === term,
        ) ?? null
    );
};

export const searchLcrmAccounts = (
    system: LcrmSystem,
    query: string,
    limit = 5,
): LcrmAccount[] => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return LCRM_ACCOUNTS.filter(
        (account) =>
            account.system === system &&
            (account.accountName.toLowerCase().includes(term) ||
                account.accountGuid.toLowerCase().includes(term)),
    ).slice(0, limit);
};

export type ParentOrgNode = {
    id: string;
    code: string;
    name: string;
    children?: ParentOrgNode[];
};

// `primary` is rendered bold in the suggestion list, `rest` stays regular.
export type ParentOrganization = ParentOrgNode & {
    primary: string;
    rest: string;
};

// Mock lookup data until the parent org search endpoint is wired up.
export const PARENT_ORGANIZATIONS: ParentOrganization[] = [
    {
        id: "parent-bcbs-nc",
        code: "541",
        name: "Blue Cross Blue Shield of NC",
        primary: "Blue Cross Blue Shield",
        rest: " of NC",
        children: [
            {
                id: "org-846",
                code: "846",
                name: "BCBS City of Raleigh",
                children: [
                    { id: "org-846-1", code: "1846", name: "BCBS Raleigh - North" },
                    { id: "org-846-2", code: "1847", name: "BCBS Raleigh - South" },
                ],
            },
            {
                id: "org-847",
                code: "847",
                name: "BCBS City of Charlotte",
                children: [
                    { id: "org-847-1", code: "1852", name: "BCBS Charlotte - Uptown" },
                ],
            },
            {
                id: "org-848",
                code: "848",
                name: "BCBS Town of Garner",
            },
        ],
    },
    {
        id: "parent-bcbs-charlotte",
        code: "612",
        name: "Blue Cross Blue Shield of NC - City of Charlotte",
        primary: "Blue Cross Blue Shield",
        rest: " of NC - City of Charlotte",
        children: [
            { id: "org-612-1", code: "913", name: "BCBS Charlotte - Schools" },
            { id: "org-612-2", code: "914", name: "BCBS Charlotte - Transit" },
        ],
    },
    {
        id: "parent-bcbs-nc-billing",
        code: "701",
        name: "Blue Cross Blue Shield of North Carolina (Billing purpose only)",
        primary: "Blue Cross Blue Shield",
        rest: " of North Carolina (Billing purpose only)",
    },
    {
        id: "parent-bcbs-nd",
        code: "544",
        name: "Blue Cross Blue Shield of North Dakota",
        primary: "Blue Cross Blue Shield",
        rest: " of North Dakota",
        children: [
            { id: "org-544-1", code: "861", name: "BCBS City of Fargo" },
            { id: "org-544-2", code: "862", name: "BCBS City of Bismarck" },
        ],
    },
    {
        id: "parent-bcbs-ma",
        code: "218",
        name: "Blue Cross Blue Shield of Massachusetts",
        primary: "Blue Cross Blue Shield",
        rest: " of Massachusetts",
        children: [
            { id: "org-218-1", code: "455", name: "BCBS City of Boston" },
            { id: "org-218-2", code: "456", name: "BCBS Town of Newton" },
        ],
    },
    {
        id: "parent-bcbs-tx",
        code: "330",
        name: "Blue Cross Blue Shield of Texas",
        primary: "Blue Cross Blue Shield",
        rest: " of Texas",
        children: [
            { id: "org-330-1", code: "778", name: "BCBS City of Dallas" },
            { id: "org-330-2", code: "779", name: "BCBS City of Austin" },
        ],
    },
    {
        id: "parent-interactive-health",
        code: "902",
        name: "Interactive Health Insurance",
        primary: "Interactive Health Insurance",
        rest: "",
        children: [
            { id: "org-902-1", code: "931", name: "Interactive Health - Midwest" },
        ],
    },
    {
        id: "parent-teladoc-health",
        code: "100",
        name: "Teladoc Health",
        primary: "Teladoc Health",
        rest: "",
        children: [
            { id: "org-100-1", code: "121", name: "Teladoc Health - Commercial" },
            { id: "org-100-2", code: "122", name: "Teladoc Health - Government" },
        ],
    },
    {
        id: "parent-unitedhealthcare",
        code: "633",
        name: "UnitedHealthcare",
        primary: "UnitedHealthcare",
        rest: "",
        children: [{ id: "org-633-1", code: "651", name: "UHC Employer & Individual" }],
    },
    {
        id: "parent-aetna",
        code: "788",
        name: "Aetna Health",
        primary: "Aetna Health",
        rest: "",
    },
    {
        id: "parent-cigna",
        code: "890",
        name: "Cigna Healthcare",
        primary: "Cigna Healthcare",
        rest: "",
    },
    {
        id: "parent-humana",
        code: "911",
        name: "Humana",
        primary: "Humana",
        rest: "",
    },
];

export const searchParentOrganizations = (
    query: string,
    limit = 8,
): ParentOrganization[] => {
    const term = query.trim().toLowerCase();
    if (!term) return [];
    return PARENT_ORGANIZATIONS.filter(
        (parent) =>
            parent.name.toLowerCase().includes(term) ||
            parent.code.includes(term),
    ).slice(0, limit);
};

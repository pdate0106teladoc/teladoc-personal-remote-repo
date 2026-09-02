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

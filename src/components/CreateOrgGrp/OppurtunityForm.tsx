import { Button, CheckMarkCircle, CustomCheckbox, FailSafePage, RoundedLabel, SearchBar, SearchIcon, SuccessIcon } from "@ucc/common-ui";
import "./OppurtunityForm.scss";
import { Opportunities, Opportunity } from "./types";
import useCreateOrgGrpStore from "@/store/useCreateOrgGrpStore";
import { formatUTCtoDateOnly } from "@/utils";

const opportunities: Opportunities = [
    {
        "title": "Expansion Amendment - BSBC North Carolina - New Business 2026",
        "status": "Closed Won",
        "opportunityGUID": "AAAA97E2-F1F0-00B1-1041-D3CD112234EW",
        "gcrmContractNumber": "2025003-0012654",
        "gcrmContractingAccount": "BSBC North Carolina",
        "effectiveStartDate": "2026-01-01",
        "effectiveEndDate": "2026-12-31",
        "type": "New business"
    },
    {
        "title": "Expansion - BSBC North Carolina - New Business 2026",
        "status": "Closed Won",
        "opportunityGUID": "AAAA97E2-F1F0-00B1-1041-D3CD112234EWu",
        "gcrmContractNumber": "2025003-00126789",
        "gcrmContractingAccount": "BSBC North Carolina",
        "effectiveStartDate": "2026-01-01",
        "effectiveEndDate": "2026-12-31",
        "type": "New business"
    },
    {
        "title": "Expansion - BSBC North Carolinas - New Business 2026",
        "status": "Closed Won",
        "opportunityGUID": "AAAA97E2-F1F0-00B1-1041-D3CD112234EWy",
        "gcrmContractNumber": "2025003-00126789",
        "gcrmContractingAccount": "BSBC North Carolina",
        "effectiveStartDate": "2026-01-01",
        "effectiveEndDate": "2026-12-31",
        "type": "New business"
    },
    {
        "title": "Expansion - BSBC North Carolinaq - New Business 2026",
        "status": "Closed Won",
        "opportunityGUID": "AAAA97E2-F1F0-00B1-1041-D3CD112234EWr",
        "gcrmContractNumber": "2025003-00126789",
        "gcrmContractingAccount": "BSBC North Carolina",
        "effectiveStartDate": "2026-01-01",
        "effectiveEndDate": "2026-12-31",
        "type": "New business"
    },
    {
        "title": "Expansion - BSBC North Carolinaw - New Business 2026",
        "status": "Closed Won",
        "opportunityGUID": "AAAA97E2-F1F0-00B1-1041-D3CD112234EWqw",
        "gcrmContractNumber": "2025003-00126789",
        "gcrmContractingAccount": "BSBC North Carolina",
        "effectiveStartDate": "2026-01-01",
        "effectiveEndDate": "2026-12-31",
        "type": "New business"
    },
    {
        "title": "Expansion - BSBC North Carolinar - New Business 2026",
        "status": "Closed Won",
        "opportunityGUID": "AAAA97E2-F1F0-00B1-1041-D3CD112234EWq",
        "gcrmContractNumber": "2025003-00126789",
        "gcrmContractingAccount": "BSBC North Carolina",
        "effectiveStartDate": "2026-01-01",
        "effectiveEndDate": "2026-12-31",
        "type": "New business"
    }
];

const ExternalLinkIcon: React.FC = () => (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M9 2h5v5M14 2 7 9M12 9.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3.5"
            stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
);

// GUID, not the contract number: several opportunities can share one contract.
const getOpportunityKey = (opp: Opportunity): string => opp.opportunityGUID;

const OpportunityCard: React.FC<{
    opportunity: Opportunity;
    checked: boolean;
    onToggle: (checked: boolean) => void;
    checkboxId: string;
}> = ({ opportunity, checked, onToggle, checkboxId }) => {
    const details: { label: string; value: string }[] = [
        { label: "Opportunity GUID", value: opportunity.opportunityGUID },
        { label: "GCRM contract number", value: opportunity.gcrmContractNumber },
        { label: "GCRM contracting account", value: opportunity.gcrmContractingAccount },
        { label: "Effective start date", value: formatUTCtoDateOnly(opportunity.effectiveStartDate) },
        { label: "Effective end date", value: formatUTCtoDateOnly(opportunity.effectiveEndDate) },
        { label: "Type", value: opportunity.type },
    ];

    return (
        <div className={`opp-card ${checked ? "selected" : ""}`}>
            <div className="opp-card-select">
                <CustomCheckbox
                    id={checkboxId}
                    checked={checked}
                    onChange={onToggle}
                />
            </div>
            <div className="opp-card-body">
                <div className="opp-card-header">
                    <span className="opp-card-title">
                        {opportunity.title}
                        <span className="opp-card-link"><ExternalLinkIcon /></span>
                    </span>
                    <RoundedLabel variant="success" text={opportunity.status} />
                </div>
                <div className="opp-card-details">
                    {details.map((d) => (
                        <div className="opp-card-detail-row" key={d.label}>
                            <span className="opp-card-detail-label">{d.label}</span>
                            <span className="opp-card-detail-value">{d.value}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const OppurtunityForm: React.FC = () => {
    const accountQuery = useCreateOrgGrpStore((state) => state.opportunity.accountQuery);
    const opportunityQuery = useCreateOrgGrpStore((state) => state.opportunity.opportunityQuery);
    const results = useCreateOrgGrpStore((state) => state.opportunity.results);
    const selectedOpportunities = useCreateOrgGrpStore(
        (state) => state.opportunity.selectedOpportunities,
    );
    const setOpportunity = useCreateOrgGrpStore((state) => state.setOpportunity);

    const selectedKeys = selectedOpportunities.map(getOpportunityKey);
    const hasSelection = selectedOpportunities.length > 0;
    const accountSearch = accountQuery.trim();
    const opportunitySearch = opportunityQuery.trim();
    const searchingByAccount = accountSearch.length > 0;
    const searchingByOpportunity = opportunitySearch.length > 0;
    const canShowResults = searchingByAccount || searchingByOpportunity;

    const handleAccountQueryChange = (value: string) => {
        setOpportunity({
            accountQuery: value,
            ...(value.trim() ? { opportunityQuery: "" } : {}),
        });
    };

    const handleOpportunityQueryChange = (value: string) => {
        setOpportunity({
            opportunityQuery: value,
            ...(value.trim() ? { accountQuery: "" } : {}),
        });
    };

    const handleShowResults = () => {
        const query = (searchingByAccount ? accountSearch : opportunitySearch).toLowerCase();
        const matches = opportunities.filter((opp) => {
            if (searchingByAccount) {
                return opp.gcrmContractingAccount.toLowerCase().includes(query);
            }
            return (
                opp.title.toLowerCase().includes(query) ||
                opp.opportunityGUID.toLowerCase().includes(query)
            );
        });
        setOpportunity({
            results: matches,
            selectedOpportunities: [],
        });
    };

    const toggleSelection = (key: string, checked: boolean) => {
        if (checked) {
            if (selectedOpportunities.some((opp) => getOpportunityKey(opp) === key)) return;
            const source = results.length > 0 ? results : opportunities;
            const match = source.find((opp) => getOpportunityKey(opp) === key);
            if (!match) return;
            setOpportunity({ selectedOpportunities: [...selectedOpportunities, match] });
            return;
        }
        setOpportunity({
            selectedOpportunities: selectedOpportunities.filter(
                (opp) => getOpportunityKey(opp) !== key,
            ),
        });
    };

    return (
        <div className="opp-form">
            <div className="opp-form-search-comp d-flex flex-row align-items-center justify-content-between">
                <SearchBar
                    overlayRequired={false}
                    closeIcon
                    placeholder="Enter account name or ID"
                    onChange={(e) => handleAccountQueryChange(e.target.value)}
                    value={accountQuery}
                    type="md"
                    disabled={searchingByOpportunity}
                />
                <SearchBar
                    overlayRequired={false}
                    closeIcon
                    placeholder="Enter opportunity name and GUID"
                    onChange={(e) => handleOpportunityQueryChange(e.target.value)}
                    value={opportunityQuery}
                    type="md"
                    disabled={searchingByAccount}
                />
                <Button
                    variant="primary"
                    onClick={handleShowResults}
                    disabled={!canShowResults}
                >
                    Show results
                </Button>
            </div>

            <div className="opp-form-results">
                {results.length === 0 ? (
                    <FailSafePage
                        cardType="custom"
                        title="Use the filter to find opportunity"
                        message="New opportunity, existing opportunity, or hunting license"
                        icon={<SearchIcon />}
                    />
                ) : (
                    results.map((opp, index) => {
                        const key = getOpportunityKey(opp);
                        return (
                            <OpportunityCard
                                key={key}
                                opportunity={opp}
                                checked={selectedKeys.includes(key)}
                                onToggle={(checked) => toggleSelection(key, checked)}
                                checkboxId={`opp-card-${index}`}
                            />
                        );
                    })
                )}
            </div>
            <div className="opp-form-footer-wrap">
                <div className="opp-form-footer">
                    <div className="opp-footer-header">
                        <div className="d-flex align-items-center gap-1">
                            {hasSelection ? (
                                <SuccessIcon />
                            ) : (
                                <CheckMarkCircle className="opp-footer-icon-empty" />
                            )}
                            <span className="opp-footer-title">Selected opportunities ({selectedOpportunities.length})</span>
                        </div>
                        {hasSelection && (
                            <span
                                className="clear-btn"
                                onClick={() => {
                                    setOpportunity({ selectedOpportunities: [] });
                                }}
                            >
                                Clear all
                            </span>
                        )}
                    </div>
                    {!hasSelection ? (
                        <p className="opp-footer-empty">
                            Run a search above to find opportunities, then check the ones to add.
                        </p>
                    ) : (
                        <div className="opp-footer-list">
                            {selectedOpportunities.map((opp) => {
                                const key = getOpportunityKey(opp);
                                return (
                                    <span className="opp-footer-chip" key={key}>
                                        {opp.title}
                                        <Button
                                            variant="secondary"
                                            className="opp-footer-chip-remove"
                                            aria-label={`Remove ${opp.title}`}
                                            onClick={() => toggleSelection(key, false)}
                                        >
                                            &times;
                                        </Button>
                                    </span>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

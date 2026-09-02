import { Button, CustomCheckbox, FailSafePage, RoundedLabel, SearchBar, SearchIcon, SuccessIcon } from "@ucc/common-ui";
import { useState } from "react";
import "./OppurtunityForm.scss";
import { Opportunities, Opportunity } from "./types";

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
        "opportunityGUID": "AAAA97E2-F1F0-00B1-1041-D3CD112234EW",
        "gcrmContractNumber": "2025003-00126789",
        "gcrmContractingAccount": "BSBC North Carolina",
        "effectiveStartDate": "2026-01-01",
        "effectiveEndDate": "2026-12-31",
        "type": "New business"
    },
    {
        "title": "Expansion - BSBC North Carolina - New Business 2026",
        "status": "Closed Won",
        "opportunityGUID": "AAAA97E2-F1F0-00B1-1041-D3CD112234EW",
        "gcrmContractNumber": "2025003-00126789",
        "gcrmContractingAccount": "BSBC North Carolina",
        "effectiveStartDate": "2026-01-01",
        "effectiveEndDate": "2026-12-31",
        "type": "New business"
    },
    {
        "title": "Expansion - BSBC North Carolina - New Business 2026",
        "status": "Closed Won",
        "opportunityGUID": "AAAA97E2-F1F0-00B1-1041-D3CD112234EW",
        "gcrmContractNumber": "2025003-00126789",
        "gcrmContractingAccount": "BSBC North Carolina",
        "effectiveStartDate": "2026-01-01",
        "effectiveEndDate": "2026-12-31",
        "type": "New business"
    },
    {
        "title": "Expansion - BSBC North Carolina - New Business 2026",
        "status": "Closed Won",
        "opportunityGUID": "AAAA97E2-F1F0-00B1-1041-D3CD112234EW",
        "gcrmContractNumber": "2025003-00126789",
        "gcrmContractingAccount": "BSBC North Carolina",
        "effectiveStartDate": "2026-01-01",
        "effectiveEndDate": "2026-12-31",
        "type": "New business"
    },
    {
        "title": "Expansion - BSBC North Carolina - New Business 2026",
        "status": "Closed Won",
        "opportunityGUID": "AAAA97E2-F1F0-00B1-1041-D3CD112234EW",
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

const formatDate = (isoDate: string): string => {
    const date = new Date(isoDate);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const getOpportunityKey = (opp: Opportunity): string => opp.gcrmContractNumber;

const OpportunityCard: React.FC<{
    opportunity: Opportunity;
    checked: boolean;
    onToggle: (checked: boolean) => void;
}> = ({ opportunity, checked, onToggle }) => {
    const details: { label: string; value: string }[] = [
        { label: "Opportunity GUID", value: opportunity.opportunityGUID },
        { label: "GCRM contract number", value: opportunity.gcrmContractNumber },
        { label: "GCRM contracting account", value: opportunity.gcrmContractingAccount },
        { label: "Effective start date", value: formatDate(opportunity.effectiveStartDate) },
        { label: "Effective end date", value: formatDate(opportunity.effectiveEndDate) },
        { label: "Type", value: opportunity.type },
    ];

    return (
        <div className={`opp-card ${checked ? "selected" : ""}`}>
            <div className="opp-card-select">
                <CustomCheckbox
                    id={`opp-${getOpportunityKey(opportunity)}`}
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
    const [accountQuery, setAccountQuery] = useState("");
    const [opportunityQuery, setOpportunityQuery] = useState("");
    const [results, setResults] = useState<Opportunities>([]);
    const [selectedKeys, setSelectedKeys] = useState<string[]>([]);

    const selectedOpportunities = results.filter((opp) => selectedKeys.includes(getOpportunityKey(opp)));

    const handleShowResults = () => {
        setResults(opportunities);
        setSelectedKeys([]);
    };

    const toggleSelection = (key: string, checked: boolean) => {
        setSelectedKeys((prev) => (checked ? [...prev, key] : prev.filter((k) => k !== key)));
    };

    return (
        <div className="opp-form">
            <div className="opp-form-search-comp d-flex flex-row align-items-center justify-content-between">
                <SearchBar
                    overlayRequired={false}
                    placeholder="Enter account name or ID"
                    onChange={(e) => setAccountQuery(e.target.value)}
                    value={accountQuery}
                    type="md"
                />
                <SearchBar
                    overlayRequired={false}
                    placeholder="Enter opportunity name and GUID"
                    onChange={(e) => setOpportunityQuery(e.target.value)}
                    value={opportunityQuery}
                    type="md"
                />
                <Button variant="primary" onClick={handleShowResults}>Show results</Button>
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
                    results.map((opp) => {
                        const key = getOpportunityKey(opp);
                        return (
                            <OpportunityCard
                                key={key}
                                opportunity={opp}
                                checked={selectedKeys.includes(key)}
                                onToggle={(checked) => toggleSelection(key, checked)}
                            />
                        );
                    })
                )}
            </div>
            <div className="opp-form-footer-wrap">
                <div className="opp-form-footer">
                    <div className="opp-footer-header">
                        <div className="d-flex align-items-center gap-1">
                            <SuccessIcon />
                            <span className="opp-footer-title">Selected opportunities ({selectedOpportunities.length})</span>
                        </div>
                        <span className="clear-btn" onClick={() => setSelectedKeys([])}>Clear all</span>
                    </div>
                    {selectedOpportunities.length === 0 ? (
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
                                        <button
                                            type="button"
                                            className="opp-footer-chip-remove"
                                            aria-label={`Remove ${opp.title}`}
                                            onClick={() => toggleSelection(key, false)}
                                        >
                                            &times;
                                        </button>
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

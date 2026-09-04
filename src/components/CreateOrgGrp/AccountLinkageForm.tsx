import { useEffect, useMemo, useRef, useState } from "react";
import { OverlayTrigger } from "react-bootstrap";
import { LuSquareArrowOutUpRight } from "react-icons/lu";
import {
    Button,
    CustomRadioGroup,
    InfoIcon,
    renderTooltip,
    RoundedLabel,
    SearchBar,
} from "@ucc/common-ui";
import { SuccessIcon } from "@/assets";
import { TOOLTIP_MESSAGES } from "@/constants";
import useCreateOrgGrpStore from "@/store/useCreateOrgGrpStore";
import {
    findLcrmAccountByName,
    searchLcrmAccounts,
    stripParentCode,
} from "./data/lcrmAccounts";
import {
    AccountType,
    CreateOrgGrpEntity,
    HierarchyPlacement,
    LcrmAccount,
    LcrmRelationshipType,
    LcrmSystem,
    ManualEntityRecord,
    Opportunities,
    isParentDerivedRelationship,
} from "./types";
import "./AccountLinkageForm.scss";

type AccountKey = "lcrmTelemedAccount";

// Hierarchy keeps the parent as "541 - Blue Cross Blue Shield of NC"; the rest of
// the flow shows the name alone.
const parentNamesByEntity = (
    placements: HierarchyPlacement[],
): Map<string, string> =>
    new Map(
        placements.map((placement) => [
            placement.entityId,
            stripParentCode(placement.parentName),
        ]),
    );

const opportunityTitleFor = (
    record: ManualEntityRecord,
    opportunities: Opportunities,
): string =>
    opportunities
        .filter((opportunity) =>
            record.opportunityGuids.includes(opportunity.opportunityGUID),
        )
        .map((opportunity) => opportunity.title)
        .join(", ");

const accountFromParent = (
    system: LcrmSystem,
    parentName: string,
): LcrmAccount | null => findLcrmAccountByName(system, parentName);

const linkToAccount = (
    account: AccountType,
    linked: LcrmAccount | null,
): AccountType => ({
    ...account,
    accountName: linked?.accountName ?? "",
    searchQuery: linked?.accountName ?? "",
    selectedAccount: linked,
});

const emptyAccount = (
    recordId: string,
    system: LcrmSystem,
    isBilling: boolean,
): AccountType => ({
    id: `${recordId}-${system}`,
    isNewAccount: false,
    accountName: "",
    lcrmRelationship: isBilling ? "direct" : "parent_derived",
    searchQuery: "",
    selectedAccount: null,
});

// Billing orgs must link directly, so only parent-derived orgs can inherit the
// parent's account up front.
const createOrgEntity = (
    record: ManualEntityRecord,
    parentName: string,
    opportunity: string,
    isBilling: boolean,
): CreateOrgGrpEntity => ({
    entityId: record.id,
    entityName: record.name,
    parentOrganization: parentName,
    hasCcmProducts: true,
    opportunity,
    isBilling,
    lcrmTelemedAccount: isBilling
        ? emptyAccount(record.id, "telemed", true)
        : linkToAccount(
              emptyAccount(record.id, "telemed", false),
              accountFromParent("telemed", parentName),
          ),
    lcrmCcmAccount: emptyAccount(record.id, "ccm", isBilling),
});

// Re-links whatever the earlier steps changed. Only a new parent or a switch to
// billing rewrites an account, so a search the user typed is never overwritten.
const syncOrgEntity = (
    entity: CreateOrgGrpEntity,
    record: ManualEntityRecord,
    parentName: string,
    opportunity: string,
    isBilling: boolean,
): CreateOrgGrpEntity => {
    const parentChanged = entity.parentOrganization !== parentName;
    const becameBilling = isBilling && !entity.isBilling;
    if (
        !parentChanged &&
        !becameBilling &&
        entity.entityName === record.name &&
        entity.opportunity === opportunity &&
        entity.isBilling === isBilling
    ) {
        return entity;
    }

    const relink = (account: AccountType, system: LcrmSystem): AccountType => {
        if (becameBilling) {
            return linkToAccount({ ...account, lcrmRelationship: "direct" }, null);
        }
        if (parentChanged && isParentDerivedRelationship(account.lcrmRelationship)) {
            return linkToAccount(account, accountFromParent(system, parentName));
        }
        return account;
    };

    return {
        ...entity,
        entityName: record.name,
        parentOrganization: parentName,
        opportunity,
        isBilling,
        lcrmTelemedAccount: relink(entity.lcrmTelemedAccount, "telemed"),
    };
};

const initials = (name: string): string =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");

type AccountSectionProps = {
    label: string;
    system: LcrmSystem;
    account: AccountType;
    isBilling: boolean;
    showApplyToAll: boolean;
    onSelect: (selected: LcrmAccount | null) => void;
    onQueryChange: (query: string) => void;
    onRelationshipChange: (relationship: LcrmRelationshipType) => void;
    onApplyToAll: () => void;
};

const AccountSection: React.FC<AccountSectionProps> = ({
    label,
    system,
    account,
    isBilling,
    showApplyToAll,
    onSelect,
    onQueryChange,
    onRelationshipChange,
    onApplyToAll,
}) => {
    const [suggestionsOpen, setSuggestionsOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const selected = account.selectedAccount;
    const parentDerived = isParentDerivedRelationship(account.lcrmRelationship);

    useEffect(() => {
        if (!suggestionsOpen) return;
        const handleOutsideClick = (event: MouseEvent) => {
            if (!searchRef.current?.contains(event.target as Node)) {
                setSuggestionsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [suggestionsOpen]);

    const suggestions = useMemo(
        () => searchLcrmAccounts(system, account.searchQuery),
        [system, account.searchQuery],
    );

    const pickAccount = (picked: LcrmAccount) => {
        onSelect(picked);
        setSuggestionsOpen(false);
    };

    return (
        <section className="linkage-section">
            <h4 className="linkage-section-title">{label}</h4>

            <div className="linkage-field">
                <span className="linkage-label">
                    Search for an existing {label} account to link to this
                    organization
                    <span className="required"> *</span>
                </span>
                <div
                    className="linkage-search-field"
                    ref={searchRef}
                    onMouseDown={() => {
                        if (account.searchQuery.trim() !== "") setSuggestionsOpen(true);
                    }}
                >
                    <SearchBar
                        overlayRequired={false}
                        closeIcon
                        type="md"
                        customClass="linkage-search"
                        placeholder={`Search ${label} accounts`}
                        value={account.searchQuery}
                        onChange={(event) => {
                            const nextQuery = event.target.value;
                            onQueryChange(nextQuery);
                            setSuggestionsOpen(nextQuery.trim() !== "");
                        }}
                        onEnter={() => {
                            if (suggestions.length > 0) pickAccount(suggestions[0]);
                        }}
                    />

                    {suggestionsOpen && account.searchQuery.trim() !== "" && (
                        <div className="linkage-suggestions">
                            {suggestions.length === 0 ? (
                                <p className="linkage-suggestion-empty">
                                    No matching {label} accounts
                                </p>
                            ) : (
                                <>
                                    <div className="linkage-suggestions-summary">
                                        <SuccessIcon className="linkage-suggestions-summary-icon" />
                                        <span>
                                            <span className="linkage-suggestions-count">
                                                {suggestions.length}{" "}
                                                {suggestions.length === 1
                                                    ? "account"
                                                    : "accounts"}
                                            </span>
                                            <span className="linkage-suggestions-hint">
                                                Select the account below
                                            </span>
                                        </span>
                                    </div>

                                    <div className="linkage-suggestions-head">
                                        <span>Account name/GUID</span>
                                        <span>Latest opportunity</span>
                                    </div>

                                    <ul
                                        className="linkage-suggestion-list"
                                        role="listbox"
                                    >
                                        {suggestions.map((suggestion) => (
                                            <li key={suggestion.accountGuid}>
                                                <Button
                                                    variant="secondary"
                                                    role="option"
                                                    aria-selected={
                                                        suggestion.accountGuid ===
                                                        selected?.accountGuid
                                                    }
                                                    className="linkage-suggestion"
                                                    onClick={() =>
                                                        pickAccount(suggestion)
                                                    }
                                                >
                                                    <span className="linkage-suggestion-main">
                                                        <span className="linkage-suggestion-name-row">
                                                            {suggestion.isVerified ? (
                                                                <span className="linkage-suggestion-verified">
                                                                    <SuccessIcon className="linkage-verified-icon" />{" "}
                                                                    Verified
                                                                </span>
                                                            ) : (
                                                                <span className="linkage-suggestion-unverified">
                                                                    Not verified
                                                                </span>
                                                            )}
                                                            <strong>
                                                                {
                                                                    suggestion.accountName
                                                                }
                                                            </strong>
                                                        </span>
                                                        <span className="linkage-suggestion-guid">
                                                            {suggestion.accountGuid}
                                                        </span>
                                                        <span className="linkage-suggestion-created">
                                                            Created on:{" "}
                                                            {
                                                                suggestion.accountCreationDate
                                                            }
                                                        </span>
                                                    </span>

                                                    <span className="linkage-suggestion-meta">
                                                        <span className="linkage-suggestion-opportunity">
                                                            {
                                                                suggestion.latestOpportunity
                                                            }
                                                        </span>
                                                        <span className="linkage-suggestion-revenue">
                                                            Revenue effective date:{" "}
                                                            <span className="linkage-suggestion-revenue-date">
                                                                {
                                                                    suggestion.revenueEffectiveDate
                                                                }
                                                            </span>
                                                        </span>
                                                    </span>
                                                </Button>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {selected && (
                <div className="linkage-selected-account">
                    <p className="linkage-selected-label">Selected account:</p>
                    <table className="linkage-account-table">
                        <tbody>
                            <tr>
                                <td className="linkage-account-key">Account name</td>
                                <td className="linkage-account-value">
                                    {selected.accountName}
                                    {selected.isVerified ? (
                                        <span className="linkage-verified-badge">
                                            <SuccessIcon className="linkage-verified-icon" />{" "}
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="linkage-not-verified-badge">
                                            Not verified
                                        </span>
                                    )}
                                </td>
                            </tr>
                            <tr>
                                <td className="linkage-account-key">Account GUID</td>
                                <td className="linkage-account-value linkage-guid">
                                    {selected.accountGuid}
                                </td>
                            </tr>
                            <tr>
                                <td className="linkage-account-key">
                                    Account creation date
                                </td>
                                <td className="linkage-account-value">
                                    {selected.accountCreationDate}
                                </td>
                            </tr>
                            <tr>
                                <td className="linkage-account-key">
                                    Organization name
                                </td>
                                <td className="linkage-account-value">
                                    {selected.organizationName}
                                </td>
                            </tr>
                            <tr>
                                <td className="linkage-account-key">Client Manager</td>
                                <td className="linkage-account-value">
                                    <span className="linkage-manager">
                                        <span className="linkage-manager-avatar">
                                            {initials(selected.clientManager)}
                                        </span>
                                        {selected.clientManager}
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <td className="linkage-account-key">
                                    Latest opportunity
                                </td>
                                <td className="linkage-account-value">
                                    <a
                                        href={selected.latestOpportunityUrl}
                                        className="linkage-opportunity-link"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        {selected.latestOpportunity}
                                        <LuSquareArrowOutUpRight className="linkage-opportunity-link-icon" />
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td className="linkage-account-key">
                                    Revenue effective date
                                </td>
                                <td className="linkage-account-value linkage-revenue-date">
                                    {selected.revenueEffectiveDate}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            <div className="linkage-field">
                <span className="linkage-label">
                    Confirm org and account relationship
                    <span className="required"> *</span>
                </span>

                <label
                    className={`linkage-radio-card${!parentDerived ? " selected" : ""}`}
                >
                    <span className="linkage-radio-header">
                        <input
                            type="radio"
                            name={`relationship-${account.id}`}
                            className="linkage-radio-input"
                            checked={!parentDerived}
                            onChange={() => onRelationshipChange("direct")}
                        />
                        <span className="linkage-radio-title">Direct (1:1)</span>
                        {isBilling && <RoundedLabel text="Required" variant="info" />}
                    </span>
                    <p className="linkage-radio-description">
                        The org/sub org created here will map directly to an {label}{" "}
                        account. New groups, contacts, etc will be built under the{" "}
                        {label} account selected.
                    </p>
                </label>

                <label
                    className={`linkage-radio-card${parentDerived ? " selected" : ""}${
                        isBilling ? " disabled" : ""
                    }`}
                >
                    <span className="linkage-radio-header">
                        <input
                            type="radio"
                            name={`relationship-${account.id}`}
                            className="linkage-radio-input"
                            checked={parentDerived}
                            disabled={isBilling}
                            onChange={() => onRelationshipChange("parent_derived")}
                        />
                        <span className="linkage-radio-title">
                            Parent organization&apos;s account
                        </span>
                    </span>
                    <p className="linkage-radio-description">
                        The org/sub-org created here will map to a parent account in{" "}
                        {label} account. New groups, contacts, etc will be built and
                        maintained under the {label} account selected.
                    </p>
                </label>
            </div>

            {showApplyToAll && (
                <Button
                    variant="secondary"
                    className="linkage-apply-all"
                    onClick={onApplyToAll}
                >
                    Apply to all orgs
                </Button>
            )}
        </section>
    );
};

export const AccountLinkageForm: React.FC = () => {
    const orgRecords = useCreateOrgGrpStore((state) => state.basicInfo.orgRecords);
    const opportunities = useCreateOrgGrpStore(
        (state) => state.opportunity.selectedOpportunities,
    );
    const placements = useCreateOrgGrpStore((state) => state.hierarchy.placements);
    const organizations = useCreateOrgGrpStore((state) => state.orgs);
    const setOrgs = useCreateOrgGrpStore((state) => state.setOrgs);

    const accountLinkageIndex = useCreateOrgGrpStore(
        (state) => state.accountLinkageIndex,
    );

    const parentByEntity = useMemo(
        () => parentNamesByEntity(placements),
        [placements],
    );

    // Carries the orgs from the earlier steps into this step, pre-linked to the
    // parent org's account so the first screen lands ready to review.
    useEffect(() => {
        const existingById = new Map(
            organizations.map((organization) => [organization.entityId, organization]),
        );

        const next = orgRecords.map((record) => {
            const parentName = parentByEntity.get(record.id) ?? "";
            const isBilling = record.isBillingOrg === true;
            const opportunity = opportunityTitleFor(record, opportunities);
            const existing = existingById.get(record.id);
            return existing
                ? syncOrgEntity(existing, record, parentName, opportunity, isBilling)
                : createOrgEntity(record, parentName, opportunity, isBilling);
        });

        const changed =
            next.length !== organizations.length ||
            next.some((organization, index) => organization !== organizations[index]);
        if (changed) setOrgs(next);
    }, [orgRecords, opportunities, parentByEntity, organizations, setOrgs]);

    // Orgs are linked in order, so the rail position is the one being worked on.
    const activeIndex = Math.min(
        accountLinkageIndex,
        Math.max(organizations.length - 1, 0),
    );
    const activeOrganization = organizations[activeIndex];

    const updateActive = (patch: Partial<CreateOrgGrpEntity>) => {
        if (!activeOrganization) return;
        setOrgs(
            organizations.map((organization) =>
                organization.entityId === activeOrganization.entityId
                    ? { ...organization, ...patch }
                    : organization,
            ),
        );
    };

    const updateAccount = (key: AccountKey, patch: Partial<AccountType>) => {
        if (!activeOrganization) return;
        updateActive({ [key]: { ...activeOrganization[key], ...patch } });
    };

    const changeRelationship = (
        key: AccountKey,
        system: LcrmSystem,
        relationship: LcrmRelationshipType,
    ) => {
        if (!activeOrganization) return;
        // Direct linkage points at the org's own account, so the inherited
        // selection is dropped and the user searches again.
        const parentAccount = isParentDerivedRelationship(relationship)
            ? accountFromParent(system, activeOrganization.parentOrganization)
            : null;
        updateAccount(key, {
            lcrmRelationship: relationship,
            selectedAccount: parentAccount,
            searchQuery: parentAccount?.accountName ?? "",
            accountName: parentAccount?.accountName ?? "",
        });
    };

    const applyToAllNonBillingOrgs = (key: AccountKey) => {
        if (!activeOrganization || activeOrganization.isBilling) return;
        const source = activeOrganization[key];
        setOrgs(
            organizations.map((organization) => {
                if (
                    organization.entityId === activeOrganization.entityId ||
                    organization.isBilling
                ) {
                    return organization;
                }
                return {
                    ...organization,
                    hasCcmProducts: activeOrganization.hasCcmProducts,
                    [key]: {
                        ...source,
                        id: organization[key].id,
                    },
                };
            }),
        );
    };

    if (!activeOrganization) {
        return (
            <p className="account-linkage-empty">
                Add organizations in the basic information step to link LCRM accounts.
            </p>
        );
    }

    return (
        <div className="account-linkage-form">
            <nav aria-label="Organizations">
                <ol className="account-linkage-nav">
                    {organizations.map((organization, index) => {
                        const status =
                            index < activeIndex
                                ? "done"
                                : index === activeIndex
                                  ? "active"
                                  : "pending";
                        return (
                            <li
                                key={organization.entityId}
                                className={`account-linkage-nav-item ${status}`}
                                aria-current={
                                    status === "active" ? "step" : undefined
                                }
                            >
                                {status === "done" ? (
                                    <SuccessIcon className="account-linkage-nav-done" />
                                ) : (
                                    <span
                                        className="account-linkage-nav-dot"
                                        aria-hidden
                                    />
                                )}
                                <span className="account-linkage-nav-copy">
                                    <span className="account-linkage-nav-name">
                                        {organization.entityName}
                                    </span>
                                    <span className="account-linkage-nav-tag">
                                        {organization.isBilling
                                            ? "Billing org"
                                            : "Not billing org"}
                                    </span>
                                </span>
                            </li>
                        );
                    })}
                </ol>
            </nav>

            <div className="account-linkage-content">
                <div className="linkage-ccm-products">
                    <span className="linkage-label">
                        Does this org have CCM products?
                        <OverlayTrigger
                            placement="top"
                            overlay={renderTooltip(
                                TOOLTIP_MESSAGES.createOrgGrp.CCM_PRODUCTS_TOOLTIP,
                                "ccm-products",
                            )}
                        >
                            <span className="linkage-info-icon">
                                <InfoIcon aria-label="Info" height={16} width={16} />
                            </span>
                        </OverlayTrigger>
                    </span>
                    <CustomRadioGroup
                        value={activeOrganization.hasCcmProducts}
                        onChange={(hasCcmProducts) =>
                            updateActive({ hasCcmProducts })
                        }
                    />
                </div>

                <AccountSection
                    key={activeOrganization.entityId}
                    label="LCRM Telemed"
                    system="telemed"
                    account={activeOrganization.lcrmTelemedAccount}
                    isBilling={activeOrganization.isBilling}
                    showApplyToAll={
                        !activeOrganization.isBilling &&
                        organizations.filter((organization) => !organization.isBilling)
                            .length > 1
                    }
                    onSelect={(selected) =>
                        updateAccount("lcrmTelemedAccount", {
                            selectedAccount: selected,
                            searchQuery: selected?.accountName ?? "",
                            accountName: selected?.accountName ?? "",
                        })
                    }
                    onQueryChange={(searchQuery) =>
                        updateAccount("lcrmTelemedAccount", {
                            searchQuery,
                            ...(searchQuery.trim() === ""
                                ? { selectedAccount: null, accountName: "" }
                                : {}),
                        })
                    }
                    onRelationshipChange={(relationship) =>
                        changeRelationship(
                            "lcrmTelemedAccount",
                            "telemed",
                            relationship,
                        )
                    }
                    onApplyToAll={() =>
                        applyToAllNonBillingOrgs("lcrmTelemedAccount")
                    }
                />
            </div>
        </div>
    );
};

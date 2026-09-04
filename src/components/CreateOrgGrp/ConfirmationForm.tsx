import { useEffect, useMemo } from "react";
import { Tab, Tabs } from "react-bootstrap";
import { RoundedLabel, SuccessIcon } from "@ucc/common-ui";
import { formatUTCtoDateOnly } from "@/utils";
import useCreateOrgGrpStore from "@/store/useCreateOrgGrpStore";
import { stripParentCode } from "./data/lcrmAccounts";
import {
    AccountType,
    CreateOrgGrpEntity,
    HierarchyPlacement,
    ManualEntityRecord,
    Opportunities,
    isParentDerivedRelationship,
} from "./types";
import "./ConfirmationForm.scss";

// Hierarchy keeps the parent as "541 - Blue Cross Blue Shield of NC"; the review
// cards show the name alone.
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

const emptyAccount = (recordId: string, system: string): AccountType => ({
    id: `${recordId}-${system}`,
    isNewAccount: false,
    accountName: "",
    lcrmRelationship: "parent_derived",
    searchQuery: "",
    selectedAccount: null,
});

// Groups are never linked to LCRM, so they only carry their placement data.
const createGroupEntity = (
    record: ManualEntityRecord,
    parentName: string,
    opportunity: string,
): CreateOrgGrpEntity => ({
    entityId: record.id,
    entityName: record.name,
    parentOrganization: parentName,
    hasCcmProducts: false,
    opportunity,
    isBilling: false,
    lcrmTelemedAccount: emptyAccount(record.id, "telemed"),
    lcrmCcmAccount: emptyAccount(record.id, "ccm"),
});

const isSameGroupEntity = (
    a: CreateOrgGrpEntity,
    b: CreateOrgGrpEntity,
): boolean =>
    a.entityId === b.entityId &&
    a.entityName === b.entityName &&
    a.parentOrganization === b.parentOrganization &&
    a.opportunity === b.opportunity;

const PRIORITY_LABEL: Record<string, string> = {
    NORMAL: "Normal",
    HIGH: "High",
    URGENT: "Urgent",
};

const CREATE_TYPE_LABEL: Record<string, string> = {
    organizations: "New org add",
    groups: "New group add",
};

const formatFileSizeMB = (bytes: number): string => {
    const mb = bytes / (1024 * 1024);
    return `${mb < 1 ? mb.toFixed(2) : Math.round(mb)} MB`;
};

const InfoRow: React.FC<{ label: string; children: React.ReactNode }> = ({
    label,
    children,
}) => (
    <div className="confirm-info-row" role="listitem">
        <span className="confirm-info-label">{label}</span>
        <div className="confirm-info-value">{children}</div>
    </div>
);

const AccountRow: React.FC<{ label: string; account: AccountType }> = ({
    label,
    account,
}) => {
    const parentDerived = isParentDerivedRelationship(account.lcrmRelationship);
    return (
        <div className="entity-row">
            <span className="entity-row-label">{label}</span>
            <div className="entity-account-cell">
                <div className="entity-account-main">
                    {parentDerived && <SuccessIcon />}
                    <span className="entity-account-name">
                        {account.accountName}
                    </span>
                    <RoundedLabel
                        text={parentDerived ? "Parent" : "Direct"}
                        variant="grey"
                    />
                </div>
                {account.selectedAccount && (
                    <span className="entity-account-guid">
                        {account.selectedAccount.accountGuid}
                    </span>
                )}
                {account.isNewAccount && (
                    <span className="entity-account-pending">
                        New account pending
                    </span>
                )}
            </div>
        </div>
    );
};

const EntityCard: React.FC<{ entity: CreateOrgGrpEntity }> = ({ entity }) => (
    <div className="entity-card">
        <div className="entity-card-header">
            <span className="entity-card-title">{entity.entityName}</span>
            {!entity.isBilling && (
                <RoundedLabel text="Not billing org" variant="grey" />
            )}
        </div>
        <div className="entity-card-body">
            <div className="entity-row entity-row--split">
                <span className="entity-row-label">Parent organization</span>
                <span className="entity-row-value">
                    {entity.parentOrganization}
                </span>
                <span className="entity-row-label">Opportunity</span>
                <span className="entity-row-value">{entity.opportunity}</span>
            </div>
            {/* Groups are never linked to LCRM, so the row only shows for orgs. */}
            {entity.lcrmTelemedAccount.selectedAccount && (
                <AccountRow
                    label="LCRM Telemed account"
                    account={entity.lcrmTelemedAccount}
                />
            )}
        </div>
    </div>
);

const EntityList: React.FC<{ entities: CreateOrgGrpEntity[] }> = ({ entities }) => (
    <div className="entity-list">
        {entities.map((entity) => (
            <EntityCard key={entity.entityId} entity={entity} />
        ))}
    </div>
);

export const ConfirmationForm = () => {
    const details = useCreateOrgGrpStore((state) => state.details);
    const selectedOpportunities = useCreateOrgGrpStore(
        (state) => state.opportunity.selectedOpportunities,
    );
    const bulkFile = useCreateOrgGrpStore((state) => state.basicInfo.bulkFile);
    const groupRecords = useCreateOrgGrpStore(
        (state) => state.basicInfo.groupRecords,
    );
    const placements = useCreateOrgGrpStore((state) => state.hierarchy.placements);
    const orgs = useCreateOrgGrpStore((state) => state.orgs);
    const groups = useCreateOrgGrpStore((state) => state.groups);
    const setGroups = useCreateOrgGrpStore((state) => state.setGroups);

    const parentByEntity = useMemo(
        () => parentNamesByEntity(placements),
        [placements],
    );

    // Groups skip the account linkage step, so they are gathered for review here.
    useEffect(() => {
        const next = groupRecords.map((record) =>
            createGroupEntity(
                record,
                parentByEntity.get(record.id) ?? "",
                opportunityTitleFor(record, selectedOpportunities),
            ),
        );
        const unchanged =
            next.length === groups.length &&
            next.every((entity, index) => isSameGroupEntity(entity, groups[index]));
        if (!unchanged) setGroups(next);
    }, [groupRecords, parentByEntity, selectedOpportunities, groups, setGroups]);

    const priority =
        PRIORITY_LABEL[details.priority] ?? (details.priority || "—");
    const typeOfEdit = details.createTypes.map(
        (type) => CREATE_TYPE_LABEL[type] ?? type,
    );
    const opportunityTitles = selectedOpportunities.map((opp) => opp.title);

    return (
        <div className="confirmation-form">
            <div className="confirm-info-list" role="list">
                <InfoRow label="Task ID">{details.taskId || "—"}</InfoRow>
                <InfoRow label="Priority">
                    <span className="confirm-priority">
                        <span className="confirm-priority-dot" />
                        {priority}
                    </span>
                </InfoRow>
                <InfoRow label="Type of edit">
                    {typeOfEdit.length > 0 ? typeOfEdit.join("; ") : "—"}
                </InfoRow>
                <InfoRow label="Planned launch date">
                    {details.launchDate
                        ? formatUTCtoDateOnly(details.launchDate.toISOString())
                        : "—"}
                </InfoRow>
                <InfoRow label="Opportunity">
                    <div className="confirm-opportunity-list">
                        {opportunityTitles.length > 0
                            ? opportunityTitles.map((opp) => (
                                <span key={opp} className="confirm-link">
                                    {opp}
                                </span>
                            ))
                            : "—"}
                    </div>
                </InfoRow>
                {/* Only the bulk upload path has a file to show. */}
                {bulkFile && (
                    <InfoRow label="File for bulk create and edit:">
                        <span className="confirm-file">
                            <span className="confirm-file-name">
                                {bulkFile.name}
                            </span>
                            <span className="confirm-file-size">
                                {formatFileSizeMB(bulkFile.size)}
                            </span>
                            <SuccessIcon />
                        </span>
                    </InfoRow>
                )}
            </div>

            <Tabs
                defaultActiveKey={details.createTypes.includes("organizations") ? "orgs" : "groups"}
                className="confirm-tabs mb-3"
            >
                {details.createTypes.includes("organizations") && (
                    <Tab eventKey="orgs" title={`Orgs (${orgs.length})`}>
                        <EntityList entities={orgs} />
                    </Tab>
                )}
                {details.createTypes.includes("groups") && (
                    <Tab eventKey="groups" title={`Groups (${groups.length})`}>
                        <EntityList entities={groups} />
                    </Tab>
                )}
            </Tabs>
        </div>
    );
};

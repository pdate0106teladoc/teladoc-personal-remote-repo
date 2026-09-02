import { Tab, Tabs } from "react-bootstrap";
import { RoundedLabel, SuccessIcon } from "@ucc/common-ui";
import useCreateOrgGrpStore from "@/store/useCreateOrgGrpStore";
import {
    AccountType,
    CreateOrgGrpEntity,
    LcrmRelationshipType,
} from "./types";
import "./ConfirmationForm.scss";

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

const isParentDerived = (relationship: LcrmRelationshipType): boolean =>
    relationship.toLowerCase() === "parent_derived";

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
    const parentDerived = isParentDerived(account.lcrmRelationship);
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
            <AccountRow
                label="LCRM Telemed account"
                account={entity.lcrmTelemedAccount}
            />
            <AccountRow
                label="LCRM CCM account"
                account={entity.lcrmCcmAccount}
            />
        </div>
    </div>
);

const EntityList: React.FC<{ entities: CreateOrgGrpEntity[] }> = ({ entities }) => (
    <div className="entity-list">
        {entities.map((entity) => (
            <EntityCard key={entity.entityName} entity={entity} />
        ))}
    </div>
);

const formatPlannedLaunchDate = (
    launchOption: string,
    launchDate: Date | null,
): string => {
    if (launchOption === "today") return "Today";
    if (!launchDate) return "";
    return launchDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export const ConfirmationForm = () => {
    const details = useCreateOrgGrpStore((state) => state.details);
    const selectedOpportunities = useCreateOrgGrpStore(
        (state) => state.opportunity.selectedOpportunities,
    );
    const bulkFile = useCreateOrgGrpStore((state) => state.basicInfo.bulkFile);
    const orgs = useCreateOrgGrpStore((state) => state.orgs);
    const groups = useCreateOrgGrpStore((state) => state.groups);

    const priority =
        PRIORITY_LABEL[details.priority] ?? (details.priority || "—");
    const typeOfEdit = details.createTypes.map(
        (type) => CREATE_TYPE_LABEL[type] ?? type,
    );
    const opportunityTitles = selectedOpportunities.map((opp) => opp.title);

    return (
        <div className="confirmation-form">
            <div className="confirm-info-list" role="list">
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
                    {formatPlannedLaunchDate(
                        details.launchOption,
                        details.launchDate,
                    ) || "—"}
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
                <InfoRow label="File for bulk create and edit:">
                    {bulkFile ? (
                        <span className="confirm-file">
                            <span className="confirm-file-name">
                                {bulkFile.name}
                            </span>
                            <span className="confirm-file-size">
                                {formatFileSizeMB(bulkFile.size)}
                            </span>
                            <SuccessIcon />
                        </span>
                    ) : (
                        "—"
                    )}
                </InfoRow>
            </div>

            <Tabs defaultActiveKey="orgs" className="confirm-tabs mb-3">
                <Tab eventKey="orgs" title={`Orgs (${orgs.length})`}>
                    <EntityList entities={orgs} />
                </Tab>
                <Tab eventKey="groups" title={`Groups (${groups.length})`}>
                    <EntityList entities={groups} />
                </Tab>
            </Tabs>
        </div>
    );
};

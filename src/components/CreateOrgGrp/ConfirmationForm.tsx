import { Tab, Tabs } from "react-bootstrap";
import { RoundedLabel, SuccessIcon } from "@ucc/common-ui";
import "./ConfirmationForm.scss";

type LcrmRelationshipType =
    | "direct"
    | "parent_derived"
    | "DIRECT"
    | "PARENT_DERIVED";

interface AccountType {
    id: string;
    isNewAccount: boolean;
    accountName: string;
    lcrmRelationship: LcrmRelationshipType;
}

interface Entity {
    entityName: string;
    parentOrganization: string;
    lcrmTelemedAccount: AccountType;
    lcrmCcmAccount: AccountType;
    opportunity: string;
    isBilling: boolean;
}

interface ConfirmedData {
    taskId: string;
    priority: string;
    typeOfEdit: string[];
    plannedLaunchDate: string;
    opportunity: string;
    fileForBulkCreateAndEdit: File;
    orgs: Entity[];
    groups: Entity[];
}

const mock: ConfirmedData = {
    taskId: "O-88990",
    priority: "Normal",
    typeOfEdit: ["New org add", "New group add"],
    plannedLaunchDate: "Jan 1, 2027",
    opportunity:
        "Expansion - BSBC North Carolina - New Business 2026; Expansion Amendment - BSBC North Carolina - New Business 2026",
    fileForBulkCreateAndEdit: new File(
        [new ArrayBuffer(3 * 1024 * 1024)],
        "bulk_org_create_02282026.csv",
        { type: "text/csv" },
    ),
    orgs: [
        {
            entityName: "BCBS City of Charlotte",
            parentOrganization: "Blue Cross Blue Shield of NC",
            opportunity: "Blue Cross Blue Shield of NC Expansion 2026 - 2027",
            isBilling: false,
            lcrmTelemedAccount: {
                id: "tlmd-charlotte-001",
                isNewAccount: true,
                accountName: "BCBS City of Charlotte",
                lcrmRelationship: "direct",
            },
            lcrmCcmAccount: {
                id: "ccm-charlotte-001",
                isNewAccount: true,
                accountName: "BCBS City of Charlotte",
                lcrmRelationship: "direct",
            },
        },
        {
            entityName: "BCBS City of Newton",
            parentOrganization: "Blue Cross Blue Shield of NC",
            opportunity: "Blue Cross Blue Shield of NC Expansion 2026 - 2027",
            isBilling: false,
            lcrmTelemedAccount: {
                id: "tlmd-newton-001",
                isNewAccount: false,
                accountName: "Blue Cross Blue Shield of NC",
                lcrmRelationship: "parent_derived",
            },
            lcrmCcmAccount: {
                id: "ccm-newton-001",
                isNewAccount: false,
                accountName: "Blue Cross Blue Shield of NC",
                lcrmRelationship: "parent_derived",
            },
        },
    ],
    groups: [],
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

const EntityCard: React.FC<{ entity: Entity }> = ({ entity }) => (
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

const EntityList: React.FC<{ entities: Entity[] }> = ({ entities }) => (
    <div className="entity-list">
        {entities.map((entity) => (
            <EntityCard key={entity.entityName} entity={entity} />
        ))}
    </div>
);

export const ConfirmationForm = () => {
    const data = mock;

    return (
        <div className="confirmation-form">
            <div className="confirm-info-list" role="list">
                <InfoRow label="Task ID">{data.taskId}</InfoRow>
                <InfoRow label="Priority">
                    <span className="confirm-priority">
                        <span className="confirm-priority-dot" />
                        {data.priority}
                    </span>
                </InfoRow>
                <InfoRow label="Type of edit">
                    {data.typeOfEdit.join("; ")}
                </InfoRow>
                <InfoRow label="Planned launch date">
                    {data.plannedLaunchDate}
                </InfoRow>
                <InfoRow label="Opportunity">
                    <div className="confirm-opportunity-list">
                        {data.opportunity.split(";").map((opp) => (
                            <span key={opp} className="confirm-link">
                                {opp.trim()}
                            </span>
                        ))}
                    </div>
                </InfoRow>
                <InfoRow label="File for bulk create and edit:">
                    <span className="confirm-file">
                        <span className="confirm-file-name">
                            {data.fileForBulkCreateAndEdit.name}
                        </span>
                        <span className="confirm-file-size">
                            {formatFileSizeMB(data.fileForBulkCreateAndEdit.size)}
                        </span>
                        <SuccessIcon />
                    </span>
                </InfoRow>
            </div>

            <Tabs defaultActiveKey="orgs" className="confirm-tabs mb-3">
                <Tab eventKey="orgs" title={`Orgs (${data.orgs.length})`}>
                    <EntityList entities={data.orgs} />
                </Tab>
                <Tab eventKey="groups" title={`Groups (${data.groups.length})`}>
                    <EntityList entities={data.groups} />
                </Tab>
            </Tabs>
        </div>
    );
};

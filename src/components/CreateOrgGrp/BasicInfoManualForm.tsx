import {
    Button,
    CloseIcon,
    CustomCheckbox,
    CustomInput,
    CustomRadioGroup,
    DatePicker,
} from "@ucc/common-ui";
import { useEffect, useRef, useState } from "react";
import { BsChevronDown } from "react-icons/bs";
import { DustbinIcon } from "@/assets";
import useCreateOrgGrpStore from "@/store/useCreateOrgGrpStore";
import { ManualEntityRecord } from "./types";
import "./BasicInfoManualForm.scss";

type ManualTab = "orgs" | "groups";

type OpportunityOption = { label: string; value: string };

const MIN_RECORDS = 1;
const MAX_RECORDS = 50;

let recordSeq = 0;

const createRecord = (): ManualEntityRecord => ({
    id: `manual-${++recordSeq}-${Date.now()}`,
    opportunityGuids: [],
    name: "",
    isBillingOrg: null,
    startDate: null,
});

const resizeRecords = (
    records: ManualEntityRecord[],
    count: number,
): ManualEntityRecord[] => {
    if (count <= records.length) return records.slice(0, count);
    const extras: ManualEntityRecord[] = [];
    for (let i = 0; i < count - records.length; i += 1) {
        extras.push(createRecord());
    }
    return [...records, ...extras];
};

interface OpportunitySelectProps {
    idPrefix: string;
    options: OpportunityOption[];
    values: string[];
    onChange: (values: string[]) => void;
}

const OpportunitySelect: React.FC<OpportunitySelectProps> = ({
    idPrefix,
    options,
    values,
    onChange,
}) => {
    const [open, setOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const selected = options.filter((option) => values.includes(option.value));

    useEffect(() => {
        if (!open) return;
        const handleOutsideClick = (event: MouseEvent) => {
            if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, [open]);

    const toggleOption = (value: string) =>
        onChange(
            values.includes(value)
                ? values.filter((selectedValue) => selectedValue !== value)
                : [...values, value],
        );

    return (
        <div className="opp-select" ref={wrapperRef}>
            <div
                className={`opp-select-control${open ? " open" : ""}`}
                role="button"
                tabIndex={0}
                onClick={() => setOpen((prev) => !prev)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpen((prev) => !prev);
                    }
                }}
            >
                {selected.length > 0 ? (
                    <span className="opp-select-chips">
                        {selected.map((option) => (
                            <span className="opp-select-chip" key={option.value}>
                                <span className="opp-select-chip-text">{option.label}</span>
                                <Button
                                    variant="secondary"
                                    className="opp-select-chip-remove"
                                    aria-label={`Remove ${option.label}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleOption(option.value);
                                    }}
                                >
                                    <CloseIcon />
                                </Button>
                            </span>
                        ))}
                    </span>
                ) : (
                    <span className="opp-select-placeholder">Select opportunity ...</span>
                )}
                <BsChevronDown className="opp-select-caret" />
            </div>

            {open && (
                <ul className="opp-select-menu">
                    {options.length === 0 && (
                        <li className="opp-select-empty">No opportunities selected</li>
                    )}
                    {options.map((option) => {
                        const checked = values.includes(option.value);
                        const checkboxId = `${idPrefix}-${option.value}`;
                        return (
                            <li key={option.value}>
                                <div
                                    className={`opp-select-option${checked ? " selected" : ""}`}
                                >
                                    <CustomCheckbox
                                        id={checkboxId}
                                        checked={checked}
                                        onChange={() => toggleOption(option.value)}
                                    />
                                    <label htmlFor={checkboxId}>
                                        {option.label}
                                    </label>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

export const BasicInfoManualForm: React.FC = () => {
    const createTypes = useCreateOrgGrpStore((state) => state.details.createTypes);
    const selectedOpportunities = useCreateOrgGrpStore(
        (state) => state.opportunity.selectedOpportunities,
    );
    const orgRecords = useCreateOrgGrpStore((state) => state.basicInfo.orgRecords);
    const groupRecords = useCreateOrgGrpStore((state) => state.basicInfo.groupRecords);
    const setBasicInfo = useCreateOrgGrpStore((state) => state.setBasicInfo);

    const showOrgs = createTypes.includes("organizations");
    const showGroups = createTypes.includes("groups");
    const [activeTab, setActiveTab] = useState<ManualTab>(
        showOrgs ? "orgs" : "groups",
    );

    const isOrgTab = activeTab === "orgs";
    const records = isOrgTab ? orgRecords : groupRecords;
    const entityLabel = isOrgTab ? "organization" : "group";

    const opportunityOptions = selectedOpportunities.map((opp) => ({
        label: opp.title,
        value: opp.opportunityGUID,
    }));

    const usedOpportunities = new Set(
        records.flatMap((record) => record.opportunityGuids),
    );

    const saveRecords = (next: ManualEntityRecord[]) =>
        setBasicInfo(isOrgTab ? { orgRecords: next } : { groupRecords: next });

    // The tab always shows at least one card to fill in.
    useEffect(() => {
        if (records.length === 0) {
            setBasicInfo(
                isOrgTab
                    ? { orgRecords: resizeRecords([], MIN_RECORDS) }
                    : { groupRecords: resizeRecords([], MIN_RECORDS) },
            );
        }
    }, [isOrgTab, records.length, setBasicInfo]);

    const handleCountChange = (value: string) => {
        const count = Math.min(
            Math.max(Number(value) || MIN_RECORDS, MIN_RECORDS),
            MAX_RECORDS,
        );
        saveRecords(resizeRecords(records, count));
    };

    const updateRecord = (index: number, patch: Partial<ManualEntityRecord>) =>
        saveRecords(
            records.map((record, recordIndex) =>
                recordIndex === index ? { ...record, ...patch } : record,
            ),
        );

    const removeRecord = (index: number) => {
        const next = records.filter((_, recordIndex) => recordIndex !== index);
        saveRecords(next.length === 0 ? resizeRecords([], MIN_RECORDS) : next);
    };

    const applyStartDateToAll = (startDate: Date | null) =>
        saveRecords(records.map((record) => ({ ...record, startDate })));

    return (
        <div className="basic-info-manual">
            <div className="manual-tabs">
                {showOrgs && (
                    <Button
                        variant="secondary"
                        className={`manual-tab${isOrgTab ? " active" : ""}`}
                        onClick={() => setActiveTab("orgs")}
                    >
                        Enter orgs manually
                    </Button>
                )}
                {showGroups && (
                    <Button
                        variant="secondary"
                        className={`manual-tab${!isOrgTab ? " active" : ""}`}
                        onClick={() => setActiveTab("groups")}
                    >
                        Enter groups manually
                    </Button>
                )}
            </div>

            <div className="manual-count-row">
                <label className="manual-count-label" htmlFor="manual-count">
                    How many {entityLabel}s are you creating?
                    <span className="required">*</span>
                </label>
                <CustomInput
                    id="manual-count"
                    type="number"
                    min={MIN_RECORDS}
                    max={MAX_RECORDS}
                    className="manual-count-input"
                    value={records.length}
                    onChange={(e) => handleCountChange(e.target.value)}
                />
                <span className="manual-opp-counter">
                    {usedOpportunities.size}/{selectedOpportunities.length} opportunities
                    selected
                </span>
            </div>

            <div className="manual-records">
                {records.map((record, index) => (
                    <div className="manual-record" key={record.id}>
                        <div className="manual-record-fields">
                            <div className="manual-field">
                                <span className="manual-field-label">
                                    Opportunity<span className="required">*</span>
                                </span>
                                <div className="manual-field-control">
                                    <OpportunitySelect
                                        idPrefix={`manual-opp-${record.id}`}
                                        options={opportunityOptions}
                                        values={record.opportunityGuids}
                                        onChange={(opportunityGuids) =>
                                            updateRecord(index, { opportunityGuids })
                                        }
                                    />
                                </div>
                            </div>

                            <div className="manual-field">
                                <span className="manual-field-label">
                                    {isOrgTab ? "Organization" : "Group"} name
                                    <span className="required">*</span>
                                </span>
                                <div className="manual-field-control">
                                    <CustomInput
                                        value={record.name}
                                        placeholder={
                                            isOrgTab
                                                ? "Enter the new org's name"
                                                : "Enter the new group name"
                                        }
                                        onChange={(e) =>
                                            updateRecord(index, { name: e.target.value })
                                        }
                                    />
                                </div>
                            </div>

                            {/* Billing applies to orgs only; the group design has no such row. */}
                            {isOrgTab && (
                                <div className="manual-field">
                                    <span className="manual-field-label">
                                        Billing org?<span className="required">*</span>
                                    </span>
                                    <div className="manual-field-control">
                                        <CustomRadioGroup
                                            value={record.isBillingOrg as boolean}
                                            onChange={(isBillingOrg) =>
                                                updateRecord(index, { isBillingOrg })
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="manual-field">
                                <span className="manual-field-label">
                                    {isOrgTab ? "Org start date" : "Group effective start date"}
                                    <span className="required">*</span>
                                </span>
                                <div className="manual-field-control manual-date-control">
                                    <div className="manual-date">
                                        <DatePicker
                                            value={record.startDate}
                                            onChange={(startDate) =>
                                                updateRecord(index, { startDate })
                                            }
                                            label=""
                                            placeholder="Select date ..."
                                            disablePastDates={false}
                                            exactUtcTime={true}
                                        />
                                    </div>
                                    {index === 0 && record.startDate && records.length > 1 && (
                                        <Button
                                            variant="secondary"
                                            className="manual-apply-all"
                                            onClick={() => applyStartDateToAll(record.startDate)}
                                        >
                                            Apply to all
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {records.length > 1 && (
                            <Button
                                variant="secondary"
                                className="manual-record-remove"
                                aria-label={`Remove ${entityLabel}`}
                                onClick={() => removeRecord(index)}
                            >
                                <DustbinIcon />
                            </Button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BasicInfoManualForm;

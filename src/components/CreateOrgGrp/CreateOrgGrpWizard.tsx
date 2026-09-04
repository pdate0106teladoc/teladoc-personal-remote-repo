import { useState } from "react";
import { Offcanvas } from "react-bootstrap";
import { Breadcrumb, Button, CloseIcon } from "@ucc/common-ui";
import "./CreateOrgGrpWizard.scss";
import { OppurtunityForm } from "./OppurtunityForm";
import { BasicInfoForm } from "./BasicInfoForm";
import { HierarchyForm } from "./HierarchyForm";
import { AccountLinkageForm } from "./AccountLinkageForm";
import { ConfirmationForm } from "./ConfirmationForm";
import { isAccountLinked, isManualBasicInfoComplete } from "./types";
import useCreateOrgGrpStore, {
    emptyCreateOrgGrpBasicInfo,
    emptyCreateOrgGrpHierarchy,
    emptyCreateOrgGrpOpportunity,
} from "@/store/useCreateOrgGrpStore";

type StepKey =
    | "opportunity"
    | "basicInfo"
    | "hierarchy"
    | "accountLinkage"
    | "confirmation";

const STEP_LABELS: Record<StepKey, string> = {
    opportunity: "Opportunity",
    basicInfo: "Basic information",
    hierarchy: "Hierarchy",
    accountLinkage: "Account linkage",
    confirmation: "Confirmation",
};

const ALL_STEPS: StepKey[] = [
    "opportunity",
    "basicInfo",
    "hierarchy",
    "accountLinkage",
    "confirmation",
];

interface CreateOrgGrpWizardProps {
    show: boolean;
    onClose: () => void;
}

const CreateOrgGrpWizard: React.FC<CreateOrgGrpWizardProps> = ({ show, onClose }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const selectedOpportunities = useCreateOrgGrpStore(
        (state) => state.opportunity.selectedOpportunities,
    );
    const createTypes = useCreateOrgGrpStore((state) => state.details.createTypes);
    const basicInfoMethod = useCreateOrgGrpStore((state) => state.details.basicInfoMethod);
    const bulkFile = useCreateOrgGrpStore((state) => state.basicInfo.bulkFile);
    const orgRecords = useCreateOrgGrpStore((state) => state.basicInfo.orgRecords);
    const groupRecords = useCreateOrgGrpStore((state) => state.basicInfo.groupRecords);
    const hierarchyPlacements = useCreateOrgGrpStore(
        (state) => state.hierarchy.placements,
    );
    const organizations = useCreateOrgGrpStore((state) => state.orgs);
    const accountLinkageIndex = useCreateOrgGrpStore(
        (state) => state.accountLinkageIndex,
    );
    const setAccountLinkageIndex = useCreateOrgGrpStore(
        (state) => state.setAccountLinkageIndex,
    );

    const steps = ALL_STEPS.filter(
        (step) => step !== "accountLinkage" || createTypes.includes("organizations"),
    );
    const currentStep = steps[Math.min(activeIndex, steps.length - 1)];
    const isFirstStep = activeIndex === 0;
    const isLastStep = activeIndex === steps.length - 1;
    const isBasicInfoStep = currentStep === "basicInfo";
    const isHierarchyStep = currentStep === "hierarchy";
    const isAccountLinkageStep = currentStep === "accountLinkage";
    const basicInfoIncomplete =
        basicInfoMethod === "manual"
            ? !isManualBasicInfoComplete(createTypes, orgRecords, groupRecords)
            : !bulkFile;
    // The step walks the orgs one at a time, so only the current org gates Continue.
    const linkageOrganization = organizations[accountLinkageIndex];
    const primaryDisabled =
        (isFirstStep && selectedOpportunities.length === 0) ||
        (isBasicInfoStep && basicInfoIncomplete) ||
        (isHierarchyStep &&
            hierarchyPlacements.length < orgRecords.length + groupRecords.length) ||
        (isAccountLinkageStep &&
            (!linkageOrganization || !isAccountLinked(linkageOrganization)));
    const renderContent = (step: StepKey) => {
        switch (step) {
            case "opportunity": return <OppurtunityForm />;
            case "basicInfo": return <BasicInfoForm />;
            case "hierarchy": return <HierarchyForm />;
            case "accountLinkage": return <AccountLinkageForm />;
            case "confirmation": return <ConfirmationForm />;
            default: return null;
        }
    };

    const handleClose = () => {
        setActiveIndex(0);
        onClose();
    };

    const handleRestart = () => {
        const store = useCreateOrgGrpStore.getState();
        store.setOpportunity({ ...emptyCreateOrgGrpOpportunity });
        store.setBasicInfo({ ...emptyCreateOrgGrpBasicInfo });
        store.setHierarchy({ ...emptyCreateOrgGrpHierarchy });
        store.setOrgs([]);
        store.setGroups([]);
        store.setAccountLinkageIndex(0);
        setActiveIndex(0);
    };

    const primaryLabel = isFirstStep
        ? "Add from opportunity"
        : isLastStep
            ? "Confirm"
            : "Continue";

    const handleNext = () => {
        // Linking the current org unlocks the next one; the step ends on the last.
        if (isAccountLinkageStep && accountLinkageIndex < organizations.length - 1) {
            setAccountLinkageIndex(accountLinkageIndex + 1);
            return;
        }
        if (isLastStep) {
            handleClose();
            return;
        }
        setActiveIndex((prev) => Math.min(prev + 1, steps.length - 1));
    };

    const breadcrumbItems = steps.map((step, index) => ({
        label: `${index + 1}. ${STEP_LABELS[step]}`,
        active: index === activeIndex,
        onClick: index < activeIndex ? () => setActiveIndex(index) : undefined,
    }));

    return (
        // Rendered directly instead of via SideModal so the backdrop can be static:
        // the wizard holds unsaved input, so only Cancel and the close button dismiss it.
        <Offcanvas
            show={show}
            onHide={handleClose}
            placement="end"
            backdrop="static"
            keyboard={false}
            className="side-modal-lg"
        >
            <Offcanvas.Header>
                <Offcanvas.Title>
                    <span className="side-modal-title">
                        Create new organizations and groups
                    </span>
                </Offcanvas.Title>
                <Button
                    variant="secondary"
                    onClick={handleClose}
                    className="wizard-close-button"
                    aria-label="Close"
                >
                    <CloseIcon width={24} height={24} />
                </Button>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <div className="create-org-grp-wizard">
                    <div className="wizard-breadcrumb">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>

                    <div className="wizard-content">
                        {renderContent(currentStep)}
                    </div>

                    <div className={`footer${isFirstStep ? " no-top-border" : ""}`}>
                        <div className="footer-left">
                            <Button variant="secondary" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant="secondary" onClick={handleRestart}>
                                Restart
                            </Button>
                        </div>
                        <Button
                            variant="primary"
                            onClick={handleNext}
                            disabled={primaryDisabled}
                        >
                            {primaryLabel}
                        </Button>
                    </div>
                </div>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default CreateOrgGrpWizard;

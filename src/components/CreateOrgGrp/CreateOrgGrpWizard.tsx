import { useState } from "react";
import { Offcanvas } from "react-bootstrap";
import { Breadcrumb, Button, CloseIcon } from "@ucc/common-ui";
import "./CreateOrgGrpWizard.scss";
import { OppurtunityForm } from "./OppurtunityForm";
import { BasicInfoForm } from "./BasicInfoForm";
import { HierarchyForm } from "./HierarchyForm";
import { AccountLinkageForm } from "./AccountLinkageForm";
import { ConfirmationForm } from "./ConfirmationForm";
import { isManualBasicInfoComplete } from "./types";
import useCreateOrgGrpStore, {
    emptyCreateOrgGrpBasicInfo,
    emptyCreateOrgGrpHierarchy,
    emptyCreateOrgGrpOpportunity,
} from "@/store/useCreateOrgGrpStore";

const STEPS = [
    "1. Opportunity",
    "2. Basic information",
    "3. Hierarchy",
    "4. Account linkage",
    "5. Confirmation",
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
    const isFirstStep = activeIndex === 0;
    const isLastStep = activeIndex === STEPS.length - 1;
    const isBasicInfoStep = activeIndex === 1;
    const isHierarchyStep = activeIndex === 2;
    const basicInfoIncomplete =
        basicInfoMethod === "manual"
            ? !isManualBasicInfoComplete(createTypes, orgRecords, groupRecords)
            : !bulkFile;
    const primaryDisabled =
        (isFirstStep && selectedOpportunities.length === 0) ||
        (isBasicInfoStep && basicInfoIncomplete) ||
        (isHierarchyStep &&
            hierarchyPlacements.length < orgRecords.length + groupRecords.length);
    const renderContent = (index: number) => {
        switch (index) {
            case 0: return <OppurtunityForm />;
            case 1: return <BasicInfoForm />;
            case 2: return <HierarchyForm />;
            case 3: return <AccountLinkageForm />;
            case 4: return <ConfirmationForm />;
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
        setActiveIndex(0);
    };

    const primaryLabel = isFirstStep
        ? "Add from opportunity"
        : isLastStep
            ? "Confirm"
            : "Continue";

    const handleNext = () => {
        if (isLastStep) {
            handleClose();
            return;
        }
        setActiveIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
    };

    const breadcrumbItems = STEPS.map((label, index) => ({
        label,
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
                        {renderContent(activeIndex)}
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

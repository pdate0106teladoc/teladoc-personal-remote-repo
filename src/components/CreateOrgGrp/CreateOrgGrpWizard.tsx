import { useState } from "react";
import { Breadcrumb, Button, SideModal } from "@ucc/common-ui";
import "./CreateOrgGrpWizard.scss";
import { OppurtunityForm } from "./OppurtunityForm";
import { BasicInfoForm } from "./BasicInfoForm";
import { HierarchyForm } from "./HierarchyForm";
import { AccountLinkageForm } from "./AccountLinkageForm";
import { ConfirmationForm } from "./ConfirmationForm";

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
    const isFirstStep = activeIndex === 0;
    const isLastStep = activeIndex === STEPS.length - 1;
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

    const handleBack = () => setActiveIndex((prev) => Math.max(prev - 1, 0));

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
        <SideModal
            show={show}
            onHide={handleClose}
            title="Create new organizations and groups"
            type="lg"
        >
            <div className="create-org-grp-wizard">
                <div className="wizard-breadcrumb">
                    <Breadcrumb items={breadcrumbItems} />
                </div>

                <div className="wizard-content">
                    {renderContent(activeIndex)}
                </div>

                <div className={`footer${isFirstStep ? " no-top-border" : ""}`}>
                    <Button variant="secondary" onClick={isFirstStep ? handleClose : handleBack}>
                        {isFirstStep ? "Cancel" : "Back"}
                    </Button>
                    <Button variant="primary" onClick={handleNext}>
                        {isLastStep ? "Confirm" : "Continue"}
                    </Button>
                </div>
            </div>
        </SideModal>
    );
};

export default CreateOrgGrpWizard;

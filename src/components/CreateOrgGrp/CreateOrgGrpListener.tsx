import { useEffect, useState } from "react";
import InitialOrgGrpDetailForm from "./InitialOrgGrpDetailForm";
import CreateOrgGrpWizard from "./CreateOrgGrpWizard";
import useCreateOrgGrpStore from "@/store/useCreateOrgGrpStore";

const CreateOrgGrpListener: React.FC = () => {
  const [createOrgGrpOpen, setCreateOrgGrpOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const resetCreateOrgGrp = useCreateOrgGrpStore((state) => state.reset);

  useEffect(() => {
    const handleOpen = () => setCreateOrgGrpOpen(true);
    window.addEventListener("create-org-grp:open", handleOpen);
    return () => window.removeEventListener("create-org-grp:open", handleOpen);
  }, []);

  const handleCancel = () => {
    resetCreateOrgGrp();
    setCreateOrgGrpOpen(false);
  };

  return (
    <>
      <InitialOrgGrpDetailForm
        show={createOrgGrpOpen}
        onCancel={handleCancel}
        onContinue={() => {
          setCreateOrgGrpOpen(false);
          setWizardOpen(true);
        }}
      />
      <CreateOrgGrpWizard
        show={wizardOpen}
        onClose={() => {
          resetCreateOrgGrp();
          setWizardOpen(false);
        }}
      />
    </>
  );
};

export default CreateOrgGrpListener;

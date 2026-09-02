import { useEffect, useState } from "react";
import InitialOrgGrpDetailForm from "./InitialOrgGrpDetailForm";
import CreateOrgGrpWizard from "./CreateOrgGrpWizard";

const CreateOrgGrpListener: React.FC = () => {
  const [createOrgGrpOpen, setCreateOrgGrpOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setCreateOrgGrpOpen(true);
    window.addEventListener("create-org-grp:open", handleOpen);
    return () => window.removeEventListener("create-org-grp:open", handleOpen);
  }, []);

  return (
    <>
      <InitialOrgGrpDetailForm
        show={createOrgGrpOpen}
        onCancel={() => setCreateOrgGrpOpen(false)}
        onContinue={() => {
          setCreateOrgGrpOpen(false);
          setWizardOpen(true);
        }}
      />
      <CreateOrgGrpWizard
        show={wizardOpen}
        onClose={() => setWizardOpen(false)}
      />
    </>
  );
};

export default CreateOrgGrpListener;

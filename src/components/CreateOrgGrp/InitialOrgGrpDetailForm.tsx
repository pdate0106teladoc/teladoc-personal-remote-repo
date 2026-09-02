import { TOOLTIP_MESSAGES } from "@/constants";
import {
  Button,
  CheckboxGroup,
  CloseIcon,
  CustomInput,
  CustomRadioToggle,
  DatePicker,
  DropdownWithIcon,
} from "@ucc/common-ui";
import { useState } from "react";
import { Offcanvas } from "react-bootstrap";
import { isValidURL } from "@/utils";
import useCreateOrgGrpStore from "@/store/useCreateOrgGrpStore";
import FileUpload from "../FileUpload/FileUpload";
import "./InitialOrgGrpDetailForm.scss";

interface InitialOrgGrpDetailFormPayload {
  priority: string;
  launchOption: "today" | "later" | "";
  launchDate: Date | null;
  workfrontId: string;
  playbookLink: string;
  createTypes: string[];
  basicInfoMethod: "upload" | "manual" | "";
  files: string[];
}

interface InitialOrgGrpDetailFormProps {
  show: boolean;
  onCancel: () => void;
  onContinue?: (payload: InitialOrgGrpDetailFormPayload) => void;
}

const InitialOrgGrpDetailForm: React.FC<InitialOrgGrpDetailFormProps> = ({
  show,
  onCancel,
  onContinue,
}) => {
  const [dropdownPriority, setDropdownPriority] = useState("");
  const [launchOption, setLaunchOption] = useState<"today" | "later" | "">("");
  const [dateValue, setDateValue] = useState<Date | null>(null);
  const [workfrontId, setWorkfrontId] = useState("");
  const [workfrontLinkError, setWorkfrontLinkError] = useState<boolean>(false);
  const [playbookLink, setPlaybookLink] = useState("");
  const [playbookLinkError, setPlaybookLinkError] = useState<boolean>(false);
  const [createTypes, setCreateTypes] = useState<string[]>([]);
  const [basicInfoMethod, setBasicInfoMethod] = useState<
    "upload" | "manual" | ""
  >("");
  const [files, setFiles] = useState<string[]>([]);
  const dropdownOptionsIcon = [
    { label: "Normal", value: "NORMAL" },
    { label: "High", value: "HIGH" },
    { label: "Urgent", value: "URGENT" },
  ];

  // "today" needs no date; "later" requires a chosen future date; "" is unset.
  const launchDateMissing =
    launchOption === "" || (launchOption === "later" && !dateValue);

  // Both links are optional, so only a non-empty value that fails the pattern is an error.
  const isMalformedLink = (link: string) =>
    Boolean(link.trim() && !isValidURL(link));

  const requiredFieldsIncomplete =
    !dropdownPriority ||
    launchDateMissing ||
    createTypes.length === 0 ||
    !basicInfoMethod;

  const startDisabled =
    requiredFieldsIncomplete ||
    isMalformedLink(workfrontId) ||
    isMalformedLink(playbookLink);

  const handleContinue = () => {
    const workfrontInvalid = isMalformedLink(workfrontId);
    const playbookInvalid = isMalformedLink(playbookLink);
    setWorkfrontLinkError(workfrontInvalid);
    setPlaybookLinkError(playbookInvalid);
    if (workfrontInvalid || playbookInvalid) return;

    const payload = {
      priority: dropdownPriority,
      launchOption,
      launchDate: dateValue,
      workfrontId,
      playbookLink,
      createTypes,
      basicInfoMethod,
      files,
    };
    useCreateOrgGrpStore.getState().setDetails(payload);
    onContinue?.(payload);
  };
  return (
    // Rendered directly instead of via SideModal so the backdrop can be static:
    // the form holds unsaved input, so only Cancel and the close button dismiss it.
    <Offcanvas
      show={show}
      onHide={onCancel}
      placement="end"
      backdrop="static"
      keyboard={false}
    >
      <Offcanvas.Header>
        <Offcanvas.Title>
          <span className="side-modal-title">Create new org/group</span>
        </Offcanvas.Title>
        <Button
          variant="secondary"
          onClick={onCancel}
          className="initial-close-button"
          aria-label="Close"
        >
          <CloseIcon width={24} height={24} />
        </Button>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <div className="initial-org-grp-form">
          <div className="d-flex align-items-center info-text">
            <span className="required">* </span>
            <span className="required-label">indicates a required field</span>
          </div>
          <DropdownWithIcon
            value={dropdownPriority}
            label="Priority"
            dropdownOptions={dropdownOptionsIcon}
            customClass="input-w-190"
            onChange={(value) => setDropdownPriority(value)}
            isRequired
          />
          <div className="launch-option-section d-flex flex-column gap-2">
            <label className="launch-option-label">
              When should this go to production?
              <span className="required"> *</span>
            </label>
            <CustomRadioToggle
              name="launch-option"
              value={launchOption}
              onChange={(value) =>
                setLaunchOption(value as "today" | "later" | "")
              }
              options={[
                {
                  label: (
                    <span className="launch-option-text">
                      <strong>Today</strong> - send it to production immediately
                    </span>
                  ) as unknown as string,
                  value: "today",
                },
                {
                  label: (
                    <span className="launch-option-text">
                      <strong>Schedule for later</strong> - select a future date
                      to go to production
                    </span>
                  ) as unknown as string,
                  value: "later",
                },
              ]}
            />
            {launchOption === "later" && (
              <DatePicker
                value={dateValue}
                disablePastAndTodayDates={true}
                onChange={(date) => setDateValue(date)}
                label=""
                placeholder=" "
                isRequired
                customClass="input-w-190 date-picker-later"
                tooltipContent={
                  TOOLTIP_MESSAGES.createOrgGrp.PLANNED_LAUNCH_DATE_TOOLTIP
                }
                exactUtcTime={true}
              />
            )}
          </div>

          <div>
            <CustomInput
              label="Workfront link (if any)"
              value={workfrontId}
              onChange={(e) => {
                setWorkfrontId(e.target.value);
                setWorkfrontLinkError(false);
              }}
              onBlur={(e) => setWorkfrontLinkError(isMalformedLink(e.target.value))}
              placeholder=" "
              className="input-style"
              error={
                workfrontLinkError ? "Please enter a valid URL" : undefined
              }
            />
          </div>

          <div>
            <CustomInput
              label="Playbook link (if applicable)"
              value={playbookLink}
              onChange={(e) => {
                setPlaybookLink(e.target.value);
                setPlaybookLinkError(false);
              }}
              onBlur={(e) => setPlaybookLinkError(isMalformedLink(e.target.value))}
              placeholder=" "
              className="input-style"
              error={
                playbookLinkError ? "Please enter a valid URL" : undefined
              }
            />
          </div>

          <CheckboxGroup
            title={
              (
                <>
                  What do you want to create?
                  <span className="required"> *</span>
                </>
              ) as unknown as string
            }
            options={[
              { label: "Organizations", value: "organizations" },
              { label: "Groups", value: "groups" },
            ]}
            selectedValues={createTypes}
            onChange={setCreateTypes}
          />

          <div className="info-method-section d-flex flex-column gap-2">
            <label className="info-method-label">
              How do you want to enter the basic info?
              <span className="required"> *</span>
            </label>
            <div className="info-method-options">
              <label
                className={`info-method-option ${basicInfoMethod === "upload" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="basic-info-method"
                  value="upload"
                  checked={basicInfoMethod === "upload"}
                  onChange={() => setBasicInfoMethod("upload")}
                />
                <div className="d-flex flex-column gap-1">
                  <span className="info-method-head">Upload a list</span>
                  <span className="info-method-description">
                    Use our template to upload a spreadsheet later on with all
                    basic info at once.
                  </span>
                </div>
              </label>
              <label
                className={`info-method-option ${basicInfoMethod === "manual" ? "selected" : ""}`}
              >
                <input
                  type="radio"
                  name="basic-info-method"
                  value="manual"
                  checked={basicInfoMethod === "manual"}
                  onChange={() => setBasicInfoMethod("manual")}
                />
                <div className="d-flex flex-column gap-1">
                  <span className="info-method-head">Enter manually</span>
                  <span className="info-method-description">
                    Fill in fields directly. Best when you have a few records.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <FileUpload onUpload={setFiles} />

          <div className="footer">
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleContinue}
              disabled={startDisabled}
            >
              Start
            </Button>
          </div>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default InitialOrgGrpDetailForm;

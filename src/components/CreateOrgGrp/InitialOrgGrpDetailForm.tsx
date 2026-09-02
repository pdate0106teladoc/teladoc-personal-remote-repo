import { TOOLTIP_MESSAGES } from "@/constants";
import {
  Button,
  CheckboxGroup,
  CustomInput,
  CustomRadioToggle,
  DatePicker,
  DropdownWithIcon,
  InfoIcon,
  renderTooltip,
  SideModal,
} from "@ucc/common-ui";
import { useState } from "react";
import { OverlayTrigger } from "react-bootstrap";
import "./InitialOrgGrpDetailForm.scss";

interface InitialOrgGrpDetailFormPayload {
  priority: string;
  launchOption: "today" | "later" | "";
  launchDate: Date | null;
  workfrontId: string;
  playbookLink: string;
  createTypes: string[];
  basicInfoMethod: "upload" | "manual" | "";
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
  const [incomplete, setIncomplete] = useState<boolean>(false);
  const [workfrontId, setWorkfrontId] = useState("");
  const [playbookLink, setPlaybookLink] = useState("");
  const [playbookLinkError, setPlaybookLinkError] = useState<boolean>(false);
  const [createTypes, setCreateTypes] = useState<string[]>([]);
  const [basicInfoMethod, setBasicInfoMethod] = useState<
    "upload" | "manual" | ""
  >("");
  const dropdownOptionsIcon = [
    { label: "Normal", value: "NORMAL" },
    { label: "High", value: "HIGH" },
    { label: "Urgent", value: "URGENT" },
  ];

  // "today" needs no date; "later" requires a chosen future date; "" is unset.
  const launchDateMissing =
    launchOption === "" || (launchOption === "later" && !dateValue);

  const handleContinue = () => {
    onContinue?.({
      priority: dropdownPriority,
      launchOption,
      launchDate: dateValue,
      workfrontId,
      playbookLink,
      createTypes,
      basicInfoMethod,
    });
  };
  return (
    <SideModal show={show} onHide={onCancel} title="Create new org/group">
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
          onError={incomplete && !dropdownPriority}
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
                    <OverlayTrigger
                      placement="top"
                      overlay={renderTooltip(
                        TOOLTIP_MESSAGES.createOrgGrp
                          .SCHEDULE_FOR_LATER_TOOLTIP,
                        "schedule-for-later",
                      )}
                    >
                      <span className="info-icon ms-2 text-center">
                        <InfoIcon />
                      </span>
                    </OverlayTrigger>
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
              onError={incomplete && !dateValue}
              exactUtcTime={true}
            />
          )}
        </div>

        <CustomInput
          label="Workfront ID (if any)"
          value={workfrontId}
          onChange={(e) => setWorkfrontId(e.target.value)}
          placeholder=" "
          className="input-style"
        />

        <div>
          <CustomInput
            label="Playbook link (if applicable)"
            value={playbookLink}
            onChange={(e) => {
              setPlaybookLink(e.target.value);
              setPlaybookLinkError(false);
            }}
            placeholder=" "
            className="input-style"
          />
          {playbookLinkError && (
            <span className="error-message">Please enter a valid URL</span>
          )}
        </div>

        <CheckboxGroup
          title="What do you want to create?"
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

        <div className="footer">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={launchDateMissing || !dropdownPriority}
          >
            Start
          </Button>
        </div>
      </div>
    </SideModal>
  );
};

export default InitialOrgGrpDetailForm;

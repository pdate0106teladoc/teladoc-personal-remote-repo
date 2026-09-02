import { ArrowDownload, Button } from "@ucc/common-ui";
import "./BasicInfoForm.scss";

export const BasicInfoForm: React.FC = () => {
    const handleDownloadTemplate = () => {
        // TODO: wire to the real template URL / download endpoint.
    };

    return (
        <div className="basic-info-form">
            <div className="basic-info-header">
                <span className="basic-info-instruction">Upload an Excel file following the template format.</span>
                <Button variant="secondary" className="download-template-btn" onClick={handleDownloadTemplate}>
                    <ArrowDownload />
                    Download template
                </Button>
            </div>

            <div className="basic-info-upload">
                <span className="basic-info-upload-hint">The max file size is 5 MB.</span>

                {/* TODO: replace with the common-ui file input component once available. */}
                <div className="basic-info-dropzone">
                    <p className="basic-info-dropzone-text">
                        Drag and drop or <span className="basic-info-choose-link">choose file</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

import { XIcon } from "lucide-react";
import Input from "../common/Input";

const CreateApplication = () => {
  function handleClose() {
    (document.getElementById("create-app-modal") as HTMLDialogElement)?.close();
  }

  function handleSave() {
    console.log("Implement API call to save the application details");
  }

  return (
    <dialog id="create-app-modal" className="modal">
      <div className="modal-box">
        <div className="flex gap-4 w-full justify-between mb-4 items-center">
          <h3 className="font-bold text-lg">Create new Application</h3>
          <button className="btn btn-ghost btn-square" onClick={handleClose}>
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {/* Application Name */}
          <Input
            label="Application Name"
            isRequired
            type="text"
            placeholder="E.g: Mobile Application"
          />

          {/* Application Description */}
          <Input
            label="Application Description"
            type="text"
            isTextarea
            rows={3}
            placeholder="E.g: This is a mobile application which is going to access the internal APIs."
          />
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={handleSave}>Save</button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default CreateApplication;
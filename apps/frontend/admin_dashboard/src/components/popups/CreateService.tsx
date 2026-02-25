import { XIcon } from "lucide-react";
import Input from "../common/Input";

const CreateService = () => {
  function handleClose() {
    (
      document.getElementById("create-service-modal") as HTMLDialogElement
    )?.close();
  }

  function handleSave() {
    console.log("Implement API call to save the service details");
  }

  return (
    <dialog id="create-service-modal" className="modal">
      <div className="modal-box">
        <div className="flex gap-4 w-full justify-between mb-4 items-center">
          <h3 className="font-bold text-lg">Create new Service</h3>
          <button className="btn btn-ghost btn-square" onClick={handleClose}>
            <XIcon className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {/* Service Name */}
          <Input
            label="Service Name"
            isRequired
            type="text"
            placeholder="E.g: Mobile Service"
          />

          {/* Base URL */}
          <Input
            label="Base URL"
            isRequired
            type="url"
            placeholder="E.g: https://api.example.com"
          />

          {/* Service Description */}
          <Input
            label="Service Description"
            type="text"
            isTextarea
            rows={3}
            placeholder="E.g: This is a mobile service which is going to access the internal APIs."
          />
        </div>
        <div className="modal-action">
          <form method="dialog">
            <button className="btn" onClick={handleSave}>
              Save
            </button>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default CreateService;

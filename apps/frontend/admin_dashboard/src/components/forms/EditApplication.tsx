import { clientPermissions } from "../../data/dummyTableData";
import { clientPermissionColumns } from "../../types/table";

import Input from "../common/Input";
import Table from "../common/Table";

const EditApplication = ({ itemId }: { itemId: string }) => {
  function handleUpdate() {
    console.log("Updating item with id:", itemId);
  }

  return (
    <form action="" className="p-4 bg-base-300 rounded-xl flex flex-col gap-4">
      <Input label="Name" placeholder="E.g: Mobile App" />

      <Input
        label="Description"
        placeholder="E.g: This app is for..."
        isTextarea
        rows={3}
      />

      <Input label="Application Secret" placeholder="*****************" />

      <label className="label">
        <input type="checkbox" className="checkbox" />
        <span className="label-text text-sm">Is Active</span>
      </label>

      <div className="divider" />

      <h2 className="text-xl font-bold mb-4">Application Permissions</h2>

      <div className="rounded-xl overflow-clip">
        <Table
          columns={clientPermissionColumns}
          data={clientPermissions}
          rowKey="id"
          pinHeaderRows={1}
          maxHeight="300px"
          striped={true}
          hover={true}
          compact={false}
        />
      </div>

      <div className="divider" />

      <button className="btn btn-primary" onClick={handleUpdate}>
        Save Changes
      </button>
    </form>
  );
};

export default EditApplication;

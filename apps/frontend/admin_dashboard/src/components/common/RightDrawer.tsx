import { type ReactNode } from "react";
import { Maximize2Icon, Minimize2Icon, XIcon } from "lucide-react";

interface RightDrawerProps {
  isVisible: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
  children?: ReactNode;
}

const RightDrawer = ({
  isVisible,
  isExpanded,
  onToggleExpand,
  onClose,
  children,
}: RightDrawerProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <>
      {/* Desktop side drawer */}
      <div className="hidden md:flex bg-base-200 overflow-auto transition-all duration-300 flex-1">
        <div className="p-4 w-full flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <button onClick={onToggleExpand} className="btn btn-sm btn-ghost">
              {isExpanded ? (
                <Minimize2Icon className="h-4 w-4" />
              ) : (
                <Maximize2Icon className="h-4 w-4" />
              )}
              {/* {isExpanded ? "Collapse" : "Expand"} */}
            </button>

            <h2 className="font-bold text-lg">Details</h2>

            <button
              onClick={onClose}
              className="btn btn-sm btn-square btn-ghost"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </div>

      {/* Mobile bottom sheet */}
      <div className="md:hidden fixed inset-0 flex flex-col">
        {/* Backdrop */}
        <div
          className="bg-black bg-opacity-50 z-40"
          onClick={onClose}
          style={{
            height: isExpanded ? "0%" : "auto",
            flex: isExpanded ? "0" : "1",
          }}
        />

        {/* Sheet */}
        <div className="bg-base-200 overflow-auto z-50 flex flex-col h-full transition-all duration-300">
          {/* Handle */}
          <div className="flex justify-center pt-2 pb-2 shrink-0">
            <div className="w-12 h-1 bg-base-300 rounded-full" />
          </div>

          {/* Header */}
          <div className="p-4 shrink-0 flex justify-between items-center">
            <h2 className="font-bold text-lg">Details</h2>
            <button
              onClick={onClose}
              className="btn btn-sm btn-square btn-ghost"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto px-4 pb-4">{children}</div>
        </div>
      </div>
    </>
  );
};

export default RightDrawer;

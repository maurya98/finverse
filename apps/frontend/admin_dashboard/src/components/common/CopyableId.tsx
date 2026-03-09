import { useState } from "react";
import { CopyIcon, CheckIcon } from "lucide-react";

interface Props {
  id: string;
  truncate?: boolean;
}

const CopyableId = ({ id, truncate = false }: Props) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const displayId = truncate ? `${id.slice(0, 8)}…` : id;

  return (
    <div className="tooltip" data-tip={copied ? "Copied!" : `Copy: ${id}`}>
      <button
        type="button"
        onClick={handleCopy}
        className="font-mono text-xs flex items-center gap-1 text-gray-400 hover:text-primary transition-colors cursor-pointer"
      >
        <span className={truncate ? "" : "whitespace-nowrap"}>{displayId}</span>
        {copied ? (
          <CheckIcon size={12} className="text-success shrink-0" />
        ) : (
          <CopyIcon size={12} className="shrink-0" />
        )}
      </button>
    </div>
  );
};

export default CopyableId;

import { diffLines, type Change } from "diff";
import "./FileDiffViewer.css";

function contentToText(content: unknown): string {
  if (content === null || content === undefined) return "";
  if (typeof content === "string") return content;
  return JSON.stringify(content, null, 2);
}

export type FileDiffViewerProps = {
  path: string;
  oldContent: unknown;
  newContent: unknown;
  mode: "added" | "removed" | "modified";
};

export function FileDiffViewer({ path, oldContent, newContent, mode }: FileDiffViewerProps) {
  const oldText = contentToText(oldContent);
  const newText = contentToText(newContent);
  const changes: Change[] =
    mode === "added"
      ? [{ value: newText, added: true }]
      : mode === "removed"
        ? [{ value: oldText, removed: true }]
        : diffLines(oldText, newText);

  const lines: { kind: "add" | "remove" | "context"; text: string }[] = [];
  for (const change of changes) {
    const kind = change.added ? "add" : change.removed ? "remove" : "context";
    const parts = (change.value ?? "").split("\n");
    const lastEmpty = parts.length > 1 && parts[parts.length - 1] === "";
    const lineParts = lastEmpty ? parts.slice(0, -1) : parts;
    for (const line of lineParts) {
      lines.push({ kind, text: line });
    }
    if (lastEmpty && (change.added || change.removed)) {
      lines.push({ kind, text: "" });
    }
  }

  return (
    <div className="file-diff-viewer">
      <div className="file-diff-viewer-header">{path}</div>
      <pre className="file-diff-viewer-body">
        <code>
          {lines.map((line, i) => (
            <div
              key={i}
              className={`file-diff-line file-diff-line-${line.kind}`}
              data-kind={line.kind}
            >
              <span className="file-diff-line-prefix">
                {line.kind === "add" ? "+" : line.kind === "remove" ? "-" : " "}
              </span>
              <span className="file-diff-line-content">
                {line.text || " "}
              </span>
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
}

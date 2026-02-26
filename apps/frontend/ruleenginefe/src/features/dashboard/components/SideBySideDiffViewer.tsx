import "./SideBySideDiffViewer.css";

function contentToText(content: unknown): string {
  if (content === null || content === undefined) return "";
  if (typeof content === "string") return content;
  return JSON.stringify(content, null, 2);
}

export type SideBySideDiffViewerProps = {
  path: string;
  oldContent: unknown;
  newContent: unknown;
  mode: "added" | "removed" | "modified";
};

function toLines(text: string): string[] {
  if (!text.length) return [];
  const parts = text.split("\n");
  const lastEmpty = parts.length > 1 && parts[parts.length - 1] === "";
  return lastEmpty ? parts.slice(0, -1) : parts;
}

export function SideBySideDiffViewer({ path, oldContent, newContent, mode }: SideBySideDiffViewerProps) {
  const oldText = contentToText(oldContent);
  const newText = contentToText(newContent);
  const oldLines = toLines(oldText);
  const newLines = toLines(newText);
  const maxLines = Math.max(oldLines.length, newLines.length, 1);

  return (
    <div className="side-by-side-diff">
      <div className="side-by-side-diff-header">{path}</div>
      <div className="side-by-side-diff-columns">
        <div className="side-by-side-diff-panel side-by-side-diff-old">
          <div className="side-by-side-diff-panel-title">Previous</div>
          <pre className="side-by-side-diff-content">
            <code>
              {mode === "added" ? (
                <div className="side-by-side-diff-line side-by-side-diff-empty">(new file)</div>
              ) : (
                Array.from({ length: maxLines }, (_, i) => (
                  <div key={i} className="side-by-side-diff-line">
                    <span className="side-by-side-diff-num">{i + 1}</span>
                    <span className="side-by-side-diff-text">{oldLines[i] ?? ""}</span>
                  </div>
                ))
              )}
            </code>
          </pre>
        </div>
        <div className="side-by-side-diff-panel side-by-side-diff-new">
          <div className="side-by-side-diff-panel-title">Current</div>
          <pre className="side-by-side-diff-content">
            <code>
              {mode === "removed" ? (
                <div className="side-by-side-diff-line side-by-side-diff-empty">(deleted)</div>
              ) : (
                Array.from({ length: maxLines }, (_, i) => (
                  <div key={i} className="side-by-side-diff-line">
                    <span className="side-by-side-diff-num">{i + 1}</span>
                    <span className="side-by-side-diff-text">{newLines[i] ?? ""}</span>
                  </div>
                ))
              )}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

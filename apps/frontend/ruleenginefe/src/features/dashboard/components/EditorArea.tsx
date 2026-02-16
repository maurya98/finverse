import { useCallback, useState } from "react";
import Editor from "@monaco-editor/react";
import { JdmEditorView } from "./JdmEditorView";
import "./EditorArea.css";

type JsonViewMode = "jdm" | "raw";

type EditorAreaProps = {
  content: string;
  language: string;
  onChange: (value: string) => void;
  onSave?: () => void;
  dirty?: boolean;
  fileName: string | null;
  readOnly?: boolean;
  /** JSON file paths in the repo (for Decision node key dropdown) */
  decisionKeyOptions?: string[];
  /** When editing in a repo, pass so simulate can resolve Decision node keys */
  repositoryId?: string;
  branch?: string;
  /** Build decisions map from current UI state so simulation uses uncommitted + committed state, not backend repo */
  getDecisionsForSimulation?: () => Promise<Record<string, unknown>>;
};

export function EditorArea({
  content,
  language,
  onChange,
  onSave,
  dirty,
  fileName,
  readOnly,
  decisionKeyOptions,
  repositoryId,
  branch,
  getDecisionsForSimulation,
}: EditorAreaProps) {
  const [jsonViewMode, setJsonViewMode] = useState<JsonViewMode>("jdm");
  const handleEditorDidMount = useCallback(() => {}, []);

  if (!fileName) {
    return (
      <div className="editor-area editor-area-empty">
        <p>Select a file from the sidebar or create a new file.</p>
      </div>
    );
  }

  const isJson = fileName.toLowerCase().endsWith(".json");
  const lang = language === "json" ? "json" : "plaintext";
  const showJdm = isJson && jsonViewMode === "jdm";

  return (
    <div className="editor-area">
      <div className="editor-toolbar">
        <span className="editor-tab">{fileName}</span>
        {isJson && (
          <div className="editor-json-view-toggle" role="tablist" aria-label="JSON view mode">
            <button
              type="button"
              role="tab"
              aria-selected={jsonViewMode === "jdm"}
              className={`editor-view-tab ${jsonViewMode === "jdm" ? "active" : ""}`}
              onClick={() => setJsonViewMode("jdm")}
            >
              JDM Editor
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={jsonViewMode === "raw"}
              className={`editor-view-tab ${jsonViewMode === "raw" ? "active" : ""}`}
              onClick={() => setJsonViewMode("raw")}
            >
              Raw JSON
            </button>
          </div>
        )}
        {dirty && <span className="editor-dirty">Modified</span>}
        {onSave && (
          <button
            type="button"
            className="editor-save-btn"
            onClick={onSave}
            disabled={!dirty}
          >
            Save
          </button>
        )}
      </div>
      <div className="editor-container">
        {showJdm ? (
          <JdmEditorView
            content={content}
            onChange={onChange}
            decisionKeyOptions={decisionKeyOptions}
            repositoryId={repositoryId}
            branch={branch}
            getDecisionsForSimulation={getDecisionsForSimulation}
          />
        ) : (
          <Editor
            height="100%"
            language={lang}
            value={content}
            onChange={(v) => onChange(v ?? "")}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              readOnly: !!readOnly,
              minimap: { enabled: true },
              fontSize: 13,
              wordWrap: "on",
              padding: { top: 12 },
            }}
          />
        )}
      </div>
    </div>
  );
}

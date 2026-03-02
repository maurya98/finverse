interface InputProps {
  label?: string;
  type?: React.InputHTMLAttributes<HTMLInputElement>["type"];
  placeholder?: string;
  isRequired?: boolean;
  validationHint?: string;
  disabled?: boolean;
  isTextarea?: boolean;
  rows?: number;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const Input = (props: InputProps) => {
  return (
    <fieldset className="fieldset">
      {props.label && (
        <legend className="fieldset-legend">{props.label}</legend>
      )}
      {props.isTextarea ? (
        <textarea
          className="textarea validator w-full"
          required={props.isRequired}
          placeholder={props.placeholder}
          disabled={props.disabled}
          rows={props.rows}
          value={props.value}
          onChange={props.onChange}
        />
      ) : (
        <input
          className="input validator w-full"
          type={props.type}
          required={props.isRequired}
          placeholder={props.placeholder}
          disabled={props.disabled}
          value={props.value}
          onChange={props.onChange}
        />
      )}
      {props.validationHint && (
        <div className="validator-hint">{props.validationHint}</div>
      )}
    </fieldset>
  );
};

export default Input;

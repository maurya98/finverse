import MuiTextField, { type TextFieldProps } from "@mui/material/TextField";

export function AppInput(props: TextFieldProps) {
  return (
    <MuiTextField
      size="small"
      fullWidth
      variant="outlined"
      {...props}
    />
  );
}

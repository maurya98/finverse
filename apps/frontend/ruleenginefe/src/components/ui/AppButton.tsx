import type { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import MuiButton from "@mui/material/Button";
import { forwardRef } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

export interface AppButtonProps extends Omit<MuiButtonProps, "color" | "variant"> {
  variant?: ButtonVariant;
}

const variantMap: Record<ButtonVariant, MuiButtonProps["variant"]> = {
  primary: "contained",
  secondary: "outlined",
  danger: "contained",
  ghost: "text",
};

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(function AppButton(
  { variant = "primary", ...props },
  ref
) {
  const muiVariant = variantMap[variant];
  const color = variant === "danger" ? "error" : "primary";
  return (
    <MuiButton
      ref={ref}
      variant={muiVariant}
      color={color}
      {...props}
      sx={{
        ...(variant === "danger" && {
          backgroundColor: "var(--color-danger, #f87171)",
          "&:hover": { backgroundColor: "var(--color-danger, #f87171)", filter: "brightness(1.1)" },
        }),
        ...props.sx,
      }}
    />
  );
});

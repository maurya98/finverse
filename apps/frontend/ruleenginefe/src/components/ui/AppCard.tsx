import MuiCard from "@mui/material/Card";
import type { CardProps } from "@mui/material/Card";

export function AppCard(props: CardProps) {
  return (
    <MuiCard
      variant="outlined"
      sx={{
        borderColor: "divider",
        "&:hover": { backgroundColor: "action.hover" },
        ...props.sx,
      }}
      {...props}
    />
  );
}

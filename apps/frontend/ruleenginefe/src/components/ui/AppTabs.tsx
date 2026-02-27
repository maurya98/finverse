import MuiTabs from "@mui/material/Tabs";
import MuiTab from "@mui/material/Tab";
import { NavLink, useNavigate } from "react-router-dom";
import type { TabsProps, TabProps } from "@mui/material";

export interface AppTabItem {
  label: string;
  value: string;
  to?: string;
}

export interface AppTabsProps extends Omit<TabsProps, "children" | "onChange"> {
  items: AppTabItem[];
  value: string;
  onChange?: (value: string) => void;
  useRouter?: boolean;
}

export function AppTabs({ items, value, onChange, useRouter, ...tabsProps }: AppTabsProps) {
  const navigate = useNavigate();
  const handleChange = (_e: React.SyntheticEvent, newValue: string) => onChange?.(newValue);
  return (
    <MuiTabs value={value} onChange={onChange ? handleChange : undefined} {...tabsProps}>
      {items.map((item) => {
        const tabProps: TabProps & { to?: string; component?: typeof NavLink } = {
          label: item.label,
          value: item.value,
        };
        if (useRouter && item.to) {
          tabProps.component = NavLink;
          tabProps.to = item.to;
        } else if (onChange) {
          tabProps.onClick = () => onChange(item.value);
        } else if (item.to) {
          tabProps.onClick = () => navigate(item.to!);
        }
        return <MuiTab key={item.value} {...tabProps} />;
      })}
    </MuiTabs>
  );
}

import { Link } from "react-router";
import { appRoutes } from "../../data/AppRoutes";

const SidebarList = () => {
  return (
    <ul className="menu w-full grow gap-3">
      {appRoutes.map((route) => (
        <li key={route.path as string}>
          <Link
            to={route.path as string}
            className="is-drawer-close:tooltip is-drawer-close:tooltip-right flex items-center gap-3 h-10"
            data-tip={route.description}
          >
            <div className="shrink-0">{route.icon}</div>
            <span className="is-drawer-close:hidden truncate">{route.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SidebarList;

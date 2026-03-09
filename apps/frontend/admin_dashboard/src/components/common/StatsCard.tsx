import type { ReactNode } from "react";

export interface StatItem {
  title: string;
  value: string | number;
  desc?: string;
  icon?: ReactNode;
}

interface Props {
  stats: StatItem[];
}

const StatsCard = ({ stats }: Props) => {
  return (
    <div className="stats shadow">
      {stats.map((stat, i) => (
        <div key={i} className="stat">
          {stat.icon && (
            <div className="stat-figure text-secondary">{stat.icon}</div>
          )}
          <div className="stat-title">{stat.title}</div>
          <div className="stat-value">{stat.value}</div>
          {stat.desc && <div className="stat-desc">{stat.desc}</div>}
        </div>
      ))}
    </div>
  );
};

export default StatsCard;

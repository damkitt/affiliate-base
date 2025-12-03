import {
  HiCheckCircle,
  HiCurrencyDollar,
  HiRocketLaunch,
  HiShieldCheck,
  HiChartBar,
  HiUserGroup,
} from "react-icons/hi2";

interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  highlight?: string;
}

const FEATURES: Feature[] = [
  {
    icon: HiCurrencyDollar,
    title: "High Commission Rates",
    description: "Earn competitive commissions on every successful referral",
    highlight: "Up to 50%",
  },
  {
    icon: HiRocketLaunch,
    title: "Fast Payouts",
    description: "Get paid quickly with reliable payment schedules",
    highlight: "Weekly",
  },
  {
    icon: HiShieldCheck,
    title: "Trusted Platform",
    description: "Join a verified program with proven track record",
    highlight: "100% Safe",
  },
  {
    icon: HiChartBar,
    title: "Detailed Analytics",
    description: "Track your performance with comprehensive dashboards",
    highlight: "Real-time",
  },
  {
    icon: HiUserGroup,
    title: "Dedicated Support",
    description: "Get help from our affiliate success team",
    highlight: "24/7",
  },
  {
    icon: HiCheckCircle,
    title: "Easy Integration",
    description: "Simple setup with ready-to-use marketing materials",
    highlight: "5 min",
  },
];

export function ProgramFeatures() {
  return (
    <div>
      <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">
        Why Join This Program
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="p-4 rounded-lg border border-[var(--border)] hover:border-[var(--accent)]/20 transition-colors"
            >
              {/* Icon & Highlight */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[var(--accent)]/10">
                  <Icon className="w-5 h-5 text-[var(--accent)]" />
                </div>
                {feature.highlight && (
                  <span className="text-xs font-semibold text-[var(--accent)]">
                    {feature.highlight}
                  </span>
                )}
              </div>

              {/* Content */}
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { CATEGORIES } from "@/constants";
import type { Program } from "@/types";

interface EditFormProps {
  program: Partial<Program>;
  onChange: (field: keyof Program, value: unknown) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function EditForm({
  program,
  onChange,
  onSave,
  onCancel,
}: EditFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
            Program Name *
          </label>
          <input
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.programName || ""}
            onChange={(e) => onChange("programName", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
            Category *
          </label>
          <select
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.category || ""}
            onChange={(e) => onChange("category", e.target.value)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
          Tagline *
        </label>
        <input
          className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
          value={program.tagline || ""}
          onChange={(e) => onChange("tagline", e.target.value)}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
          Description *
        </label>
        <textarea
          className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] min-h-[100px]"
          value={program.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
            Website URL *
          </label>
          <input
            type="url"
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.websiteUrl || ""}
            onChange={(e) => onChange("websiteUrl", e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
            Affiliate URL *
          </label>
          <input
            type="url"
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.affiliateUrl || ""}
            onChange={(e) => onChange("affiliateUrl", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
            Commission Rate *
          </label>
          <input
            type="number"
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.commissionRate || ""}
            onChange={(e) =>
              onChange("commissionRate", Number.parseInt(e.target.value))
            }
            placeholder="e.g. 20"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
            Cookie Duration (days)
          </label>
          <input
            type="number"
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.cookieDuration || ""}
            onChange={(e) =>
              onChange("cookieDuration", Number.parseInt(e.target.value))
            }
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
            Country
          </label>
          <input
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.country || ""}
            onChange={(e) => onChange("country", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
            X Handle
          </label>
          <input
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.xHandle || ""}
            onChange={(e) => onChange("xHandle", e.target.value)}
            placeholder="@username"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
            Email
          </label>
          <input
            type="email"
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.email || ""}
            onChange={(e) => onChange("email", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
          Logo URL
        </label>
        <input
          type="url"
          className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
          value={program.logoUrl || ""}
          onChange={(e) => onChange("logoUrl", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
            Affiliates Count Range
          </label>
          <input
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.affiliatesCountRange || ""}
            onChange={(e) => onChange("affiliatesCountRange", e.target.value)}
            placeholder="e.g. 100-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
            Payouts Total Range
          </label>
          <input
            className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)]"
            value={program.payoutsTotalRange || ""}
            onChange={(e) => onChange("payoutsTotalRange", e.target.value)}
            placeholder="e.g. $10k-$50k"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[var(--text-tertiary)] mb-2">
          Additional Info
        </label>
        <textarea
          className="w-full px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border)] text-[var(--text-primary)] min-h-[80px]"
          value={program.additionalInfo || ""}
          onChange={(e) => onChange("additionalInfo", e.target.value)}
          placeholder="Trust booster information..."
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
        <button
          onClick={onSave}
          className="px-6 py-3 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-600 transition-colors shadow-lg"
        >
          Save Changes
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 rounded-xl bg-[var(--bg-secondary)] text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)] hover:bg-[var(--border)] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

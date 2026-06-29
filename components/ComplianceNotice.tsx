import { Scale } from "lucide-react";
import { COMPLIANCE_NOTE } from "@/lib/types";

export default function ComplianceNotice() {
  return (
    <div className="mx-auto mt-6 flex max-w-3xl items-start gap-3 rounded-2xl border border-hairline bg-white/50 px-5 py-4">
      <Scale size={16} className="mt-0.5 shrink-0 text-navy-muted" />
      <p className="text-[12.5px] leading-relaxed text-navy-muted">
        {COMPLIANCE_NOTE}
      </p>
    </div>
  );
}

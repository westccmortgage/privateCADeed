import { COMPANY, telHref } from "@/lib/company";
import type { RequestFailure } from "@/lib/forms";

export const SEND_FAILED = "We could not send your request. Please try again or call";
export const CHAT_FAILED = "We could not process your message. Please try again or call";

/**
 * Failure text for a lead/AI request. Our own validation messages are shown as
 * is; network/server failures get a plain sentence with a tap-to-call link.
 */
export default function FormError({
  failure,
  lead = SEND_FAILED,
  tone = "light",
  className = "",
}: {
  failure: RequestFailure | null;
  lead?: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  if (!failure) return null;
  const color = tone === "dark" ? "text-red-200" : "text-red-600";
  return (
    <p role="alert" className={`text-[13.5px] font-medium ${color} ${className}`}>
      {failure.kind === "validation" ? (
        failure.message
      ) : (
        <>
          {lead}{" "}
          <a
            href={telHref(COMPANY.phoneOffice)}
            className="whitespace-nowrap underline underline-offset-2"
          >
            {COMPANY.phoneOfficeDisplay}
          </a>
          .
        </>
      )}
    </p>
  );
}

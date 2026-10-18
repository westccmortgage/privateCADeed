export default function EndOfYearSpecial() {
  return (
    <section
      lang="en"
      aria-labelledby="year-end-special-title"
      aria-describedby="year-end-special-terms"
      className="mt-12 rounded-card border border-gold/40 bg-navy p-6 text-white shadow-soft sm:p-8"
    >
      <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-gold-soft">
        For private investors
      </p>
      <div className="mt-3 grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
        <div>
          <h2 id="year-end-special-title" className="text-[26px] font-semibold tracking-tight sm:text-[32px]">
            End-of-Year Special
          </h2>
          <p className="mt-2 text-[16px] leading-relaxed text-white/85">
            Fund an individual loan in full, secured by a Deed of Trust.
            Short-term and long-term investments.
          </p>
        </div>
        <p className="sm:text-right">
          <span className="block text-[48px] font-semibold leading-none tracking-tight text-gold-soft">10%</span>
          <span className="mt-2 block text-[15px] font-medium">annual interest</span>
        </p>
      </div>
      <p className="mt-5 text-[14px] font-medium">Short-term starts at six months.</p>
      <p id="year-end-special-terms" className="mt-4 border-t border-white/20 pt-4 text-[13px] leading-relaxed text-white/80">
        Subject to investor eligibility, availability, and executed investment agreements.
        Returns are not guaranteed. Investing involves risk, including loss of principal.
      </p>
    </section>
  );
}

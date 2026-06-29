const FOOTER_LINKS = [
  { label: "How It Works", href: "#how-it-works" },
  { label: "Solutions", href: "#solutions" },
  { label: "About Us", href: "#about" },
  { label: "Resources", href: "#resources" },
  { label: "Book Deal Review", href: "#book" },
];

export default function Footer() {
  return (
    <footer className="mx-auto mt-20 max-w-engine px-5 pb-12 sm:px-8">
      <div className="border-t border-hairline pt-8">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div className="flex flex-col leading-none">
            <span className="text-[15px] font-semibold tracking-tight text-navy">
              CADeed<span className="text-gold">.com</span>
            </span>
            <span className="mt-1 text-[12px] font-medium tracking-wide text-navy-muted">
              Private Capital Engine
            </span>
          </div>

          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-[13px] font-medium text-navy-muted transition-colors hover:text-navy"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <p className="mt-8 text-[12px] leading-relaxed text-navy-muted/80">
          © {new Date().getFullYear()} CADeed.com · California Private Capital
          Engine. Information presented is for preliminary scenario modeling only
          and does not constitute a loan approval, commitment to lend, or an
          offer of credit. Private capital arranged through licensed
          professionals where required.
        </p>
      </div>
    </footer>
  );
}

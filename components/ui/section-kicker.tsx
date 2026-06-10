/**
 * Editorial kicker used as anchor for each section.
 * Format: — [NN] LABEL TEXT  (Wibify-inspired)
 */
interface SectionKickerProps {
  num: string;
  label: string;
  align?: 'left' | 'center';
}

export function SectionKicker({ num, label, align = 'left' }: SectionKickerProps) {
  return (
    <div className={`flex items-center gap-3 reveal ${align === 'center' ? 'justify-center' : ''}`}>
      <span className="w-7 h-px bg-cyan-core/60" aria-hidden="true" />
      <span className="section-num tnum">{num}</span>
      <span className="kicker">{label}</span>
    </div>
  );
}

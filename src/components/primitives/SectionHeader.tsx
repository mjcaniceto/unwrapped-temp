interface SectionHeaderProps {
  chapter: string;
  title: string;
  subtitle?: string;
  emoji?: string;
  align?: 'left' | 'center';
}

export default function SectionHeader({ chapter, title, subtitle, emoji, align = 'center' }: SectionHeaderProps) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      <p className="font-sans text-xs font-bold uppercase tracking-[0.2em] text-ink-soft">{chapter}</p>
      <h2 className="mt-2 font-display text-4xl font-bold leading-tight text-ink sm:text-5xl">
        {emoji && <span className="mr-2">{emoji}</span>}
        {title}
      </h2>
      {subtitle && <p className="mx-auto mt-3 max-w-md font-sans text-base text-ink-soft">{subtitle}</p>}
    </div>
  );
}

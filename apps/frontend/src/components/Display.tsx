import { useId, type ReactNode } from 'react';

type Tone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

export function Chip({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`el-chip el-chip--${tone}`}>{children}</span>;
}

// Count with an accessible name ("2 notificações não lidas"); hidden when zero.
export function Badge({ count, label }: { count: number; label: string }) {
  if (count <= 0) return null;
  return (
    <span className="el-badge" aria-label={`${count} ${label}`}>
      {count}
    </span>
  );
}

export function Callout({ title, tone = 'accent', children }: { title: string; tone?: Tone; children?: ReactNode }) {
  return (
    <div className={`el-callout el-callout--${tone}`}>
      <p className="el-callout__title">{title}</p>
      {children ? <div className="el-callout__body">{children}</div> : null}
    </div>
  );
}

// Decorative: the name is always rendered next to it by the caller.
export function Avatar({ initials }: { initials: string }) {
  return (
    <span className="el-avatar" aria-hidden="true">
      {initials}
    </span>
  );
}

interface CardProps {
  title?: string;
  headingLevel?: 2 | 3;
  className?: string;
  children: ReactNode;
}

export function Card({ title, headingLevel = 2, className, children }: CardProps) {
  const id = useId();
  const classes = ['el-card', className].filter(Boolean).join(' ');
  if (!title) return <div className={classes}>{children}</div>;
  const Heading = headingLevel === 2 ? 'h2' : 'h3';
  return (
    <section className={classes} aria-labelledby={id}>
      <Heading id={id} className="el-card__title">
        {title}
      </Heading>
      {children}
    </section>
  );
}

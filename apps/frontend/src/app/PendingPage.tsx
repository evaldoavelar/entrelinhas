// Honest placeholder for screens planned in later sprints: it states that the screen does not
// exist yet instead of faking a feature. Replaced when the corresponding task is integrated.
export function PendingPage({ eyebrow, title, sprint }: { eyebrow: string; title: string; sprint: string }) {
  return (
    <div className="page">
      <header className="page__header">
        <p className="page__eyebrow">{eyebrow}</p>
        <h1 className="page__title">{title}</h1>
        <p className="page__subtitle">Esta tela ainda não foi implementada ({sprint}).</p>
      </header>
    </div>
  );
}

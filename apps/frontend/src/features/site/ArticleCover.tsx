export function ArticleCover() {
  return (
    <div className="site-article__cover" aria-hidden="true">
      <svg viewBox="0 0 80 56" width="80" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="56" rx="8" fill="var(--color-surface-sunken)" />
        <circle cx="28" cy="18" r="6" fill="#3a3d4f" />
        <path d="M8 48L24 24L44 48H8Z" fill="var(--color-cover-a)" />
        <path d="M28 48L46 32L68 48H28Z" fill="var(--color-cover-b)" />
      </svg>
    </div>
  );
}

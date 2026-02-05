import type { ThemeMode } from '../types/slides';

type ThemeToggleProps = {
  theme: ThemeMode;
  onToggle: () => void;
};

const ThemeToggle = ({ theme, onToggle }: ThemeToggleProps) => (
  <button
    type="button"
    className={`theme-toggle theme-toggle--${theme}`}
    onClick={onToggle}
    aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
    aria-pressed={theme === 'dark'}
  >
    <span className="theme-toggle__icon theme-toggle__icon--light" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="M12 4v2m0 12v2m8-8h-2M6 12H4m12.95-6.95-1.4 1.4M8.45 15.55l-1.4 1.4m0-10.9 1.4 1.4m8.1 8.1 1.4 1.4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    </span>
    <span className="theme-toggle__icon theme-toggle__icon--dark" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 14.5A9.5 9.5 0 0 1 9.5 3c-.3 0-.6.02-.89.05a7 7 0 0 0 8.34 10.94c.04.29.05.59.05.89Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  </button>
);

export default ThemeToggle;

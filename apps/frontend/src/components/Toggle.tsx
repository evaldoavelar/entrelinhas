import { useId } from 'react';

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

// Switch pattern: native button (Space/Enter) with role="switch" and aria-checked.
export function Toggle({ label, description, checked, onChange, disabled }: ToggleProps) {
  const id = useId();
  return (
    <div className="el-toggle">
      <div className="el-toggle__text">
        <span id={`${id}-label`} className="el-toggle__label">
          {label}
        </span>
        {description ? (
          <span id={`${id}-desc`} className="el-toggle__description">
            {description}
          </span>
        ) : null}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        aria-describedby={description ? `${id}-desc` : undefined}
        disabled={disabled}
        className="el-toggle__switch"
        onClick={() => onChange(!checked)}
      >
        <span className="el-toggle__thumb" aria-hidden="true" />
      </button>
    </div>
  );
}

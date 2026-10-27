import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';

interface FieldFrameProps {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  // Caller-provided description ids are kept and merged before hint/error ids.
  describedBy?: string | undefined;
  children: (aria: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}

function FieldFrame({ label, hint, error, describedBy: external, children }: FieldFrameProps) {
  const id = useId();
  const describedBy = [external ?? '', hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div className="el-field">
      <label htmlFor={id} className="el-field__label">
        {label}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint ? (
        <p id={`${id}-hint`} className="el-field__hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="el-field__error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  hint?: string;
  error?: string;
}

export function TextField({ label, hint, error, className, 'aria-describedby': external, 'aria-invalid': ariaInvalid, ...props }: TextFieldProps) {
  return (
    <FieldFrame label={label} hint={hint} error={error} describedBy={external}>
      {({ id, describedBy, invalid }) => (
        <input
          {...props}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || ariaInvalid || undefined}
          className={['el-input', className].filter(Boolean).join(' ')}
        />
      )}
    </FieldFrame>
  );
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  label: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, hint, error, options, className, 'aria-describedby': external, 'aria-invalid': ariaInvalid, ...props }: SelectProps) {
  return (
    <FieldFrame label={label} hint={hint} error={error} describedBy={external}>
      {({ id, describedBy, invalid }) => (
        <select
          {...props}
          id={id}
          aria-describedby={describedBy}
          aria-invalid={invalid || ariaInvalid || undefined}
          className={['el-input', 'el-select', className].filter(Boolean).join(' ')}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </FieldFrame>
  );
}

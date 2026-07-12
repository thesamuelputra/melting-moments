'use client';

import { useEffect, useId, useRef } from 'react';

/* ===== Shared plumbing ===== */

type FieldBaseProps = {
  label: string;
  required?: boolean;
  error?: string;
  help?: string;
  id?: string;
  disabled?: boolean;
};

function useFieldIds(explicitId: string | undefined) {
  const autoId = useId();
  const id = explicitId ?? autoId;
  return { id, helpId: `${id}-help`, errorId: `${id}-error` };
}

function describedBy(hasHelp: boolean, hasError: boolean, helpId: string, errorId: string): string | undefined {
  const ids: string[] = [];
  if (hasError) ids.push(errorId);
  if (hasHelp) ids.push(helpId);
  return ids.length > 0 ? ids.join(' ') : undefined;
}

function FieldLabel({ htmlFor, label, required }: { htmlFor: string; label: string; required?: boolean }) {
  return (
    <label className="admin-field__label" htmlFor={htmlFor}>
      {label}
      {required && (
        <span className="admin-field__required" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

function FieldMeta({
  error,
  help,
  errorId,
  helpId,
  counter,
}: {
  error?: string;
  help?: string;
  errorId: string;
  helpId: string;
  counter?: string;
}) {
  if (!error && !help && !counter) return null;
  return (
    <div className="admin-field__meta">
      <div>
        {error && (
          <p id={errorId} className="admin-field__error">
            {error}
          </p>
        )}
        {help && (
          <p id={helpId} className="admin-field__help">
            {help}
          </p>
        )}
      </div>
      {counter && <span className="admin-field__counter">{counter}</span>}
    </div>
  );
}

/* ===== TextField ===== */

export type TextFieldProps = FieldBaseProps & {
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'url' | 'password';
  placeholder?: string;
  maxLength?: number;
  name?: string;
  autoComplete?: string;
  onBlur?: () => void;
};

export function TextField({
  label,
  required,
  error,
  help,
  id: explicitId,
  disabled,
  value,
  onChange,
  type = 'text',
  placeholder,
  maxLength,
  name,
  autoComplete,
  onBlur,
}: TextFieldProps) {
  const { id, helpId, errorId } = useFieldIds(explicitId);
  return (
    <div className="admin-field">
      <FieldLabel htmlFor={id} label={label} required={required} />
      <input
        id={id}
        className="admin-field__input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        name={name}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(!!help, !!error, helpId, errorId)}
      />
      <FieldMeta error={error} help={help} errorId={errorId} helpId={helpId} />
    </div>
  );
}

/* ===== TextAreaField ===== */

export type TextAreaFieldProps = FieldBaseProps & {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  /** Grows with content (default true). */
  autoGrow?: boolean;
  /** When set, shows a live "used/max" counter and enforces the limit. */
  maxLength?: number;
  name?: string;
  onBlur?: () => void;
};

export function TextAreaField({
  label,
  required,
  error,
  help,
  id: explicitId,
  disabled,
  value,
  onChange,
  placeholder,
  rows = 3,
  autoGrow = true,
  maxLength,
  name,
  onBlur,
}: TextAreaFieldProps) {
  const { id, helpId, errorId } = useFieldIds(explicitId);
  const ref = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!autoGrow) return;
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight + 2}px`;
  }, [value, autoGrow]);

  return (
    <div className="admin-field">
      <FieldLabel htmlFor={id} label={label} required={required} />
      <textarea
        id={id}
        ref={ref}
        className={`admin-field__input${autoGrow ? ' admin-field__input--autogrow' : ''}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        name={name}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(!!help, !!error, helpId, errorId)}
      />
      <FieldMeta
        error={error}
        help={help}
        errorId={errorId}
        helpId={helpId}
        counter={maxLength !== undefined ? `${value.length}/${maxLength}` : undefined}
      />
    </div>
  );
}

/* ===== SelectField ===== */

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectFieldProps = FieldBaseProps & {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  /** Renders a disabled empty first option, e.g. "Select a category…". */
  placeholder?: string;
  name?: string;
};

export function SelectField({
  label,
  required,
  error,
  help,
  id: explicitId,
  disabled,
  value,
  onChange,
  options,
  placeholder,
  name,
}: SelectFieldProps) {
  const { id, helpId, errorId } = useFieldIds(explicitId);
  return (
    <div className="admin-field">
      <FieldLabel htmlFor={id} label={label} required={required} />
      <select
        id={id}
        className="admin-field__input admin-field__input--select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        name={name}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(!!help, !!error, helpId, errorId)}
      >
        {placeholder !== undefined && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      <FieldMeta error={error} help={help} errorId={errorId} helpId={helpId} />
    </div>
  );
}

/* ===== NumberField ===== */
/* String-backed so the input can be cleared while editing (no
   parseFloat(...) || 0 snap-to-zero). Parse at submit with parseNumberField(). */

export type NumberFieldProps = FieldBaseProps & {
  /** Raw string state; '' is a valid in-progress value. */
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  /** Allow a leading minus sign (default false; admin values are non-negative). */
  allowNegative?: boolean;
  /** Allow decimals (default true). */
  allowDecimal?: boolean;
  name?: string;
  onBlur?: () => void;
};

/** Parse a NumberField string at submit time. Returns null for empty/invalid input. */
export function parseNumberField(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '-' || trimmed === '.' || trimmed === '-.') return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export function NumberField({
  label,
  required,
  error,
  help,
  id: explicitId,
  disabled,
  value,
  onChange,
  placeholder,
  allowNegative = false,
  allowDecimal = true,
  name,
  onBlur,
}: NumberFieldProps) {
  const { id, helpId, errorId } = useFieldIds(explicitId);
  const pattern = allowDecimal
    ? allowNegative
      ? /^-?\d*\.?\d*$/
      : /^\d*\.?\d*$/
    : allowNegative
      ? /^-?\d*$/
      : /^\d*$/;

  return (
    <div className="admin-field">
      <FieldLabel htmlFor={id} label={label} required={required} />
      <input
        id={id}
        className="admin-field__input"
        type="text"
        inputMode={allowDecimal ? 'decimal' : 'numeric'}
        value={value}
        onChange={(e) => {
          const next = e.target.value;
          if (pattern.test(next)) onChange(next);
        }}
        onBlur={onBlur}
        placeholder={placeholder}
        name={name}
        required={required}
        disabled={disabled}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(!!help, !!error, helpId, errorId)}
      />
      <FieldMeta error={error} help={help} errorId={errorId} helpId={helpId} />
    </div>
  );
}

/* ===== ToggleSwitch ===== */

export type ToggleSwitchProps = FieldBaseProps & {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export function ToggleSwitch({
  label,
  required,
  error,
  help,
  id: explicitId,
  disabled,
  checked,
  onChange,
}: ToggleSwitchProps) {
  const { id, helpId, errorId } = useFieldIds(explicitId);
  const labelId = `${id}-label`;
  return (
    <div className="admin-field admin-field--switch">
      <div className="admin-field__switch-text">
        <span id={labelId} className="admin-field__label admin-field__label--switch">
          {label}
          {required && (
            <span className="admin-field__required" aria-hidden="true">
              *
            </span>
          )}
        </span>
        <FieldMeta error={error} help={help} errorId={errorId} helpId={helpId} />
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        aria-describedby={describedBy(!!help, !!error, helpId, errorId)}
        className="admin-switch"
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        <span className="admin-switch__knob" aria-hidden="true" />
      </button>
    </div>
  );
}

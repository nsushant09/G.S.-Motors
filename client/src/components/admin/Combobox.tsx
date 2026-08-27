import { useId } from 'react';

interface ComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder?: string;
  className?: string;
}

/** A text input backed by a <datalist> — pick a known value or type a brand-new one. */
export function Combobox({ value, onChange, options, placeholder, className }: ComboboxProps) {
  const listId = useId();
  return (
    <>
      <input
        list={listId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        className={className ?? 'w-full rounded border border-moss/25 bg-bone px-4 py-2.5 text-sm text-slate focus:border-moss'}
      />
      <datalist id={listId}>
        {options.map((opt) => (
          <option key={opt} value={opt} />
        ))}
      </datalist>
    </>
  );
}

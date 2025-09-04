import React from 'react'

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string }

export function Input({ label, id, className = '', ...rest }: Props) {
    const computedId = id || `input-${Math.random().toString(36).slice(2)}`
    return (
        <label htmlFor={computedId} className="flex-1">
            {label && <div className="text-xs mb-1 text-[var(--muted)]">{label}</div>}
            <input id={computedId} className={`input ${className}`} {...rest} />
        </label>
    )
}



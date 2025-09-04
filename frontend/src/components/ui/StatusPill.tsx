import React from 'react'

type Props = { label: string; ok?: boolean }

export function StatusPill({ label, ok = false }: Props) {
    return (
        <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full border ${ok ? 'border-green-900/40 text-green-400 bg-green-900/10' : 'border-[var(--line)] text-[var(--muted)]'}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${ok ? 'bg-green-400' : 'bg-zinc-500'}`} />
            {label}
        </span>
    )
}



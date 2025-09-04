import React from 'react'

type Props = {
    title: string
    value: React.ReactNode
    hint?: string
}

export function KpiCard({ title, value, hint }: Props) {
    return (
        <div className="card">
            <div className="text-sm text-[var(--muted)] mb-2">{title}</div>
            <div className="text-3xl font-semibold tracking-tight">{value}</div>
            {hint && <div className="mt-2 text-xs text-[var(--muted)]">{hint}</div>}
        </div>
    )
}



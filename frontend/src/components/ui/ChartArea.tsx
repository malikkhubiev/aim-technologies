import React from 'react'

type Props = {
    title: string
    children?: React.ReactNode
    height?: number
}

export function ChartArea({ title, children, height = 180 }: Props) {
    return (
        <div className="card">
            <div className="flex items-center justify-between mb-3">
                <div className="text-sm text-[var(--muted)]">{title}</div>
            </div>
            <div style={{ height }} className="w-full">
                {children}
            </div>
        </div>
    )
}



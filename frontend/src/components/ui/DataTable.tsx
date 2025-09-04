import React from 'react'

type Column<T> = {
    key: keyof T | string
    header: string
    render?: (row: T) => React.ReactNode
    className?: string
}

type Props<T> = {
    columns: Column<T>[]
    rows: T[]
    empty?: string
    rowKey: (row: T, idx: number) => string
}

export function DataTable<T>({ columns, rows, empty = 'Нет данных', rowKey }: Props<T>) {
    return (
        <div className="table-wrap">
            <table className="table">
                <thead>
                    <tr>
                        {columns.map(c => (
                            <th key={String(c.key)} className={c.className}>{c.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={rowKey(r, i)}>
                            {columns.map(c => (
                                <td key={String(c.key)} className={c.className}>
                                    {c.render ? c.render(r) : (r as any)[c.key]}
                                </td>
                            ))}
                        </tr>
                    ))}
                    {rows.length === 0 && (
                        <tr>
                            <td className="muted" colSpan={columns.length}>{empty}</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}



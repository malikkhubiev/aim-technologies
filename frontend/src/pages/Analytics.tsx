import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHistory, HistoryItem } from '../services/api'
import { MockToggle } from '../components'
import { useMock } from '../context/MockContext'

type Dist = { label: string; value: number }

function Bar({ value, label, max }: { value: number; label: string; max: number }) {
    const width = max ? Math.max(2, (value / max) * 100) : 0
    return (
        <div className="mb-2">
            <div className="flex justify-between text-xs text-[var(--muted)]"><span>{label}</span><span>{value}</span></div>
            <div className="h-2 bg-[#0e0f11] rounded">
                <div className="h-2 rounded bg-[var(--accent)]" style={{ width: `${width}%` }} />
            </div>
        </div>
    )
}

export default function Analytics() {
    const [history, setHistory] = useState<HistoryItem[]>([])
    const { mock } = useMock()
    useEffect(() => {
        document.title = 'Analytics · Retail AI';
        const meta = document.querySelector('meta[name="description"]')
        if (meta) meta.setAttribute('content', 'Аналитика интентов, успешности и трендов продаж')
        getHistory(500).then(setHistory)
    }, [mock])

    const { intents, salesTrend, successVsFailed } = useMemo(() => {
        const byIntent = new Map<string, number>()
        const byDate = new Map<string, { sales: number; total: number }>()
        let success = 0, failed = 0
        for (const h of history) {
            byIntent.set(h.intent, (byIntent.get(h.intent) || 0) + 1)
            const d = new Date(h.created_at); const key = d.toISOString().slice(0, 10)
            const bucket = byDate.get(key) || { sales: 0, total: 0 }
            bucket.total += 1; if (h.sale) bucket.sales += 1
            byDate.set(key, bucket)
            if (h.result && (h.result.toLowerCase().includes('ok') || h.result.toLowerCase().includes('success'))) success++; else failed++
        }
        const intents: Dist[] = Array.from(byIntent.entries()).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
        const max = Math.max(1, ...Array.from(byDate.values()).map(v => v.total))
        const salesTrend = Array.from(byDate.entries()).sort(([a], [b]) => a.localeCompare(b))
            .map(([date, v]) => ({ date, ratio: v.total ? v.sales / v.total : 0, total: v.total, max }))
        const successVsFailed = [{ label: 'Success', value: success }, { label: 'Failed', value: failed }]
        return { intents, salesTrend, successVsFailed }
    }, [history])

    const maxIntent = Math.max(1, ...intents.map(i => i.value))

    return (
        <div className="min-h-screen">
            <header className="container">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="title">Analytics</h1>
                        <p className="subtitle">Инсайты по интентам и продажам</p>
                    </div>
                    <nav className="hidden md:flex gap-3 items-center">
                        <Link className="btn" to="/">Dashboard</Link>
                        <Link className="btn" to="/analytics">Analytics</Link>
                        <Link className="btn" to="/recommendations">Recommendations</Link>
                        <Link className="btn" to="/voice">Voice</Link>
                        <MockToggle />
                    </nav>
                </div>
            </header>

            <main className="container grid">
                <section className="card">
                    <div className="section-title">Распределение интентов</div>
                    {intents.slice(0, 10).map(d => (<Bar key={d.label} label={d.label} value={d.value} max={maxIntent} />))}
                </section>

                <section className="card">
                    <div className="section-title">Успех vs Ошибки</div>
                    {successVsFailed.map(s => (<Bar key={s.label} label={s.label} value={s.value} max={Math.max(...successVsFailed.map(x => x.value), 1)} />))}
                </section>

                <section className="card span-2">
                    <div className="section-title">Тренд продаж (доля успешных)</div>
                    <svg width="100%" height="220" viewBox="0 0 800 220">
                        <polyline fill="none" stroke="rgba(255,255,255,.3)" strokeWidth="1" points={Array.from({ length: 6 }, (_, i) => `0 ${40 * (i + 1)}`).join(' ')} />
                        <polyline fill="none" stroke="url(#g)" strokeWidth="2" points={salesTrend.map((p, idx) => {
                            const x = (idx / Math.max(1, salesTrend.length - 1)) * 780 + 10
                            const y = 200 - p.ratio * 180
                            return `${x},${y}`
                        }).join(' ')} />
                        <defs>
                            <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                                <stop offset="0%" stopColor="#fff" stopOpacity=".8" />
                                <stop offset="100%" stopColor="#fff" stopOpacity=".2" />
                            </linearGradient>
                        </defs>
                    </svg>
                </section>
            </main>
            <footer className="container footer">© {new Date().getFullYear()} Retail AiM MVP</footer>
        </div>
    )
}



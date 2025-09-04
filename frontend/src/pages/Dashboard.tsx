import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHistory, HistoryItem } from '../services/api'
import { Button, DataTable, KpiCard, MockToggle } from '../components'
import { useMock } from '../context/MockContext'

export default function Dashboard() {
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const { mock } = useMock()

    useEffect(() => {
        document.title = 'Dashboard · Retail AI'
        const meta = document.querySelector('meta[name="description"]')
        if (meta) meta.setAttribute('content', 'Панель Retail AI: KPI, история, быстрые инсайты')
            ; (async () => {
                try {
                    setLoading(true)
                    const items = await getHistory(100)
                    setHistory(items)
                    setError('')
                } catch (e: any) {
                    setError('Не удалось загрузить историю')
                } finally {
                    setLoading(false)
                }
            })()
    }, [mock])

    const stats = useMemo(() => {
        const now = Date.now()
        const last30 = now - 30 * 24 * 3600 * 1000
        const prev30 = now - 60 * 24 * 3600 * 1000

        const inRange = (t: string, start: number, end: number) => {
            const d = new Date(t).getTime()
            return d >= start && d < end
        }

        const last30Items = history.filter(h => inRange(h.created_at, last30, now))
        const prev30Items = history.filter(h => inRange(h.created_at, prev30, last30))
        const interactions = history.length
        const salesLast = last30Items.filter(h => h.sale).length
        const salesPrev = prev30Items.filter(h => h.sale).length
        const salesUplift = salesPrev > 0 ? ((salesLast - salesPrev) / salesPrev) : null
        const activeUsers = new Set(last30Items.map(h => h.customer_phone).filter(Boolean)).size
        const margins = history.map(h => h.amount).filter(a => typeof a === 'number' && !Number.isNaN(a))
        const avgMargin = margins.length ? (margins.reduce((a, b) => a + b, 0) / margins.length) : null

        return { interactions, salesUplift, activeUsers, avgMargin }
    }, [history])

    return (
        <div className="min-h-screen">
            <header className="container">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="title">Retail AI Assistant</h1>
                        <p className="subtitle">Панель мониторинга</p>
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

            <main className="container">
                <div className="grid">
                    <KpiCard title="Interactions" value={stats.interactions.toLocaleString('ru-RU')} />
                    <KpiCard title="Active Users (30d)" value={stats.activeUsers.toLocaleString('ru-RU')} />
                    <KpiCard title="Sales Uplift" value={stats.salesUplift === null ? '—' : `${(stats.salesUplift * 100).toFixed(1)}%`} />
                    <KpiCard title="Avg. Margin" value={stats.avgMargin === null ? '—' : stats.avgMargin.toFixed(0)} />

                    <section className="card span-2">
                        <div className="section-title">История взаимодействий</div>
                        <div className="row">
                            <Button onClick={() => { setLoading(true); getHistory(100).then(setHistory).finally(() => setLoading(false)) }}>Обновить</Button>
                        </div>
                        <DataTable
                            columns={[
                                { key: 'interaction_id', header: 'ID', className: 'mono' },
                                { key: 'channel', header: 'Канал' },
                                { key: 'customer_phone', header: 'Пользователь', render: r => (r.customer_phone ? `${r.customer_phone.slice(0, 2)}***${r.customer_phone.slice(-2)}` : '—'), className: 'mono' },
                                { key: 'intent', header: 'Интент' },
                                { key: 'sale', header: 'Сделка', render: r => (r.sale ? 'Да' : 'Нет') },
                                { key: 'amount', header: 'Сумма' },
                                { key: 'result', header: 'Результат' },
                                { key: 'created_at', header: 'Когда' },
                            ]}
                            rows={history}
                            rowKey={(r) => r.interaction_id}
                            empty={loading ? 'Загрузка…' : (error || 'Нет данных')}
                        />
                    </section>
                </div>
            </main>
            <footer className="container footer">© {new Date().getFullYear()} Retail AiM MVP</footer>
        </div>
    )
}



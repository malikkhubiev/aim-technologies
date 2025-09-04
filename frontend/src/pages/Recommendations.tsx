import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { recommend, Product } from '../services/api'
import { Button, DataTable, Input, MockToggle } from '../components'
import { useMock } from '../context/MockContext'

export default function Recommendations() {
    const [q, setQ] = useState('игровой ноутбук')
    const [rows, setRows] = useState<Product[]>([])
    const [loading, setLoading] = useState(false)
    const { mock } = useMock()

    useEffect(() => {
        document.title = 'Recommendations · Retail AI'
        const meta = document.querySelector('meta[name="description"]')
        if (meta) meta.setAttribute('content', 'Рекомендации товаров по запросу из Retail AI')
    }, [])

    useEffect(() => {
        if (rows.length > 0) {
            setLoading(true)
            recommend(q).then(setRows).finally(() => setLoading(false))
        }
    }, [mock])

    const onSearch = async () => {
        setLoading(true)
        const res = await recommend(q)
        setRows(res)
        setLoading(false)
    }

    return (
        <div className="min-h-screen">
            <header className="container">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="title">Recommendations</h1>
                        <p className="subtitle">Поиск и рекомендации товаров</p>
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
                <section className="card">
                    <div className="row">
                        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Найдите лучшее предложение…" aria-label="Запрос" />
                        <Button onClick={onSearch} aria-label="Искать">Искать</Button>
                    </div>
                    <DataTable
                        columns={[
                            { key: 'name', header: 'Название' },
                            { key: 'category', header: 'Категория' },
                            { key: 'price', header: 'Цена', render: r => r.price.toLocaleString('ru-RU') },
                            { key: 'discount', header: 'Скидка', render: r => `${(r.discount * 100).toFixed(0)}%` },
                            { key: 'margin_rate', header: 'Маржа', render: r => `${(r.margin_rate * 100).toFixed(0)}%` },
                            { key: 'score', header: 'Score' },
                        ]}
                        rows={rows}
                        empty={loading ? 'Загрузка…' : 'Нет рекомендаций'}
                        rowKey={(r, i) => (r as any).id || String(i)}
                    />
                </section>
            </main>
            <footer className="container footer">© {new Date().getFullYear()} Retail AiM MVP</footer>
        </div>
    )
}



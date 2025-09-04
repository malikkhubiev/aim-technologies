import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function NotFound() {
    useEffect(() => { document.title = '404 · Retail AI' }, [])
    return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
            <div className="text-center p-8 rounded-xl border" style={{ borderColor: 'var(--line)', background: 'var(--panel)' }}>
                <div className="text-5xl font-bold mb-3">404</div>
                <div className="text-[var(--muted)] mb-6">Страница не найдена</div>
                <Link className="btn" to="/">Вернуться на главную</Link>
            </div>
        </div>
    )
}



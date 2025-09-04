import React from 'react'
import { useMock } from '../../context/MockContext'

export function MockToggle() {
    const { mock, setMock } = useMock()
    return (
        <div className="flex items-center gap-2">
            <label className="text-sm text-[var(--muted)]">Mock</label>
            <button
                aria-label="Toggle Mock Mode"
                onClick={() => setMock(!mock)}
                className={`relative h-6 w-11 rounded-full transition-all duration-200 border ${mock ? 'bg-[var(--accent)] border-[var(--accent)]' : 'bg-[#0d0f12] border-[var(--line)]'}`}
            >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all duration-200 ${mock ? 'right-0.5' : 'left-0.5'}`} />
            </button>
            <span className="text-xs text-[var(--muted)]">Mode: {mock ? 'Mock' : 'Real'}</span>
        </div>
    )
}

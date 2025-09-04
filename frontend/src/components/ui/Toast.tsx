import React from 'react'

type Props = { message: string; type?: 'error' | 'info' }

export function Toast({ message, type = 'info' }: Props) {
    return (
        <div role="status" aria-live="polite" className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl border shadow-luxury ${type === 'error' ? 'border-red-900/50 text-red-300 bg-red-900/10' : 'border-[var(--line)] text-[var(--text)] bg-[#121315]'}`}>
            {message}
        </div>
    )
}



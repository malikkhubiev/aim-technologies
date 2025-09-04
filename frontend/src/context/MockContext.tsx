import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { setMockMode } from '../services/api'

export type MockContextValue = {
    mock: boolean
    setMock: (v: boolean) => void
}

const MockContext = createContext<MockContextValue | undefined>(undefined)

export function MockProvider({ children }: { children: React.ReactNode }) {
    const [mock, setMock] = useState<boolean>(() => {
        try {
            const v = localStorage.getItem('mock-mode')
            return v === '1'
        } catch {
            return false
        }
    })

    useEffect(() => {
        setMockMode(mock)
        try {
            localStorage.setItem('mock-mode', mock ? '1' : '0')
        } catch { }
    }, [mock])

    const value = useMemo(() => ({ mock, setMock }), [mock])

    return <MockContext.Provider value={value}>{children}</MockContext.Provider>
}

export function useMock() {
    const ctx = useContext(MockContext)
    if (!ctx) throw new Error('useMock must be used within MockProvider')
    return ctx
}

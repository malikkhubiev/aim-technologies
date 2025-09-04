import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Recommendations = lazy(() => import('./pages/Recommendations'))
const Voice = lazy(() => import('./pages/Voice'))
const NotFound = lazy(() => import('./pages/NotFound'))

function Skeleton() {
    return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
            <div className="max-w-6xl mx-auto p-6">
                <div className="h-8 w-40 bg-[#15171a] rounded mb-4 animate-pulse" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-40 bg-[#121315] border border-[var(--line)] rounded-xl animate-pulse" />
                    <div className="h-40 bg-[#121315] border border-[var(--line)] rounded-xl animate-pulse" />
                    <div className="h-64 md:col-span-2 bg-[#121315] border border-[var(--line)] rounded-xl animate-pulse" />
                </div>
            </div>
        </div>
    )
}

export default function App() {
    return (
        <BrowserRouter>
            <Suspense fallback={<Skeleton />}>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/recommendations" element={<Recommendations />} />
                    <Route path="/voice" element={<Voice />} />
                    <Route path="/404" element={<NotFound />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}



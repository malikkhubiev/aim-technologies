import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHealth, logWebhookMinimal, sttFromWebm, tts } from '../services/api'
import { Button, Input, StatusPill, MockToggle } from '../components'

export default function Voice() {
    const [text, setText] = useState('Здравствуйте! Это демо.')
    const [audioUrl, setAudioUrl] = useState<string>('')
    const [isRec, setIsRec] = useState(false)
    const recRef = useRef<MediaRecorder | null>(null)
    const chunksRef = useRef<Blob[]>([])
    const [statusOk, setStatusOk] = useState(false)

    useEffect(() => {
        document.title = 'Voice · Retail AI';
        const meta = document.querySelector('meta[name="description"]')
        if (meta) meta.setAttribute('content', 'Голосовые возможности: синтез и распознавание речи')
        getHealth().then(() => setStatusOk(true)).catch(() => setStatusOk(false))
    }, [])

    const onTts = async () => {
        const blob = await tts(text)
        if (!blob) return
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        logWebhookMinimal('tts')
    }

    const toggleRec = async () => {
        if (isRec) {
            recRef.current?.stop(); setIsRec(false); return
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        const rec = new MediaRecorder(stream)
        chunksRef.current = []
        rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
        rec.onstop = async () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
            const text = await sttFromWebm(blob)
            if (text) setText(text)
            logWebhookMinimal('stt')
        }
        recRef.current = rec
        rec.start(); setIsRec(true)
    }

    return (
        <div className="min-h-screen">
            <header className="container">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="title">Voice</h1>
                        <p className="subtitle">TTS/STT демо</p>
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
                    <div className="section-title">Статус сервисов</div>
                    <div className="flex gap-2 items-center">
                        <StatusPill label="JAICP" ok={statusOk} />
                        <StatusPill label="YDB" ok={statusOk} />
                        <StatusPill label="Fallback" ok={true} />
                    </div>
                </section>

                <section className="card span-2">
                    <div className="section-title">Синтез речи</div>
                    <div className="row">
                        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Текст для озвучки" aria-label="Текст" />
                        <Button onClick={onTts}>Синтез</Button>
                        <Button onClick={toggleRec} variant={isRec ? 'danger' : 'default'}>{isRec ? 'Стоп' : 'Запись'}</Button>
                    </div>
                    <audio className="audio" controls src={audioUrl} />
                </section>
            </main>
            <footer className="container footer">© {new Date().getFullYear()} Retail AiM MVP</footer>
        </div>
    )
}



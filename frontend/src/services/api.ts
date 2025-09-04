export type HistoryItem = {
    interaction_id: string
    channel: string
    customer_phone: string
    intent: string
    result: string
    sale: boolean
    amount: number
    created_at: string
}

export type Product = {
    id: string
    name: string
    price: number
    category: string
    discount: number
    margin_rate: number
    score: number
}

const api = (path: string) => path

let mockEnabled = false
export function setMockMode(enabled: boolean) { mockEnabled = enabled }
export function isMockMode() { return mockEnabled }

export async function getHealth(): Promise<{ status: string }> {
    if (isMockMode()) return Promise.resolve({ status: 'ok' })
    const res = await fetch(api('/health'))
    if (!res.ok) throw new Error('health failed')
    return res.json()
}

export async function getHistory(limit = 50): Promise<HistoryItem[]> {
    if (isMockMode()) {
        const mod = await import('../mocks/history.json')
        const raw = (mod.default || []) as Array<any>
        const items: HistoryItem[] = raw.slice(0, limit).map((r: any, i: number) => ({
            interaction_id: r.id || String(i),
            channel: r.channel || 'unknown',
            customer_phone: r.user || '',
            intent: r.intent || '',
            result: r.result || '',
            sale: Boolean(r.deal),
            amount: typeof r.amount === 'number' ? r.amount : 0,
            created_at: r.timestamp || new Date().toISOString(),
        }))
        return items
    }
    const res = await fetch(api(`/jaicp/history?limit=${limit}`))
    if (!res.ok) return []
    const data = await res.json()
    return data.items ?? []
}

export async function recommend(query: string, top_k?: number): Promise<Product[]> {
    if (isMockMode()) {
        const mod = await import('../mocks/recommendations.json')
        const raw = (mod.default || []) as Array<any>
        const products: Product[] = raw.map((r: any, idx: number) => ({
            id: r.id || String(idx),
            name: r.name,
            category: r.category,
            price: Number(r.price) || 0,
            discount: typeof r.discount === 'number' ? r.discount / 100 : 0,
            margin_rate: typeof r.margin === 'number' ? r.margin / 100 : 0,
            score: Number(r.score) || 0,
        }))
        return products
    }
    const res = await fetch(api('/recommend/query'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, top_k })
    })
    if (!res.ok) return []
    return res.json()
}

export async function tts(text: string, voice?: string): Promise<Blob | null> {
    if (isMockMode()) {
        const mod = await import('../mocks/tts.json')
        const data = mod.default as any
        const base64 = data.audio_base64 as string
        if (!base64) return null
        const binary = atob(base64)
        const bytes = new Uint8Array(binary.length)
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
        return new Blob([bytes], { type: 'audio/wav' })
    }
    const res = await fetch(api('/jaicp/tts'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, voice })
    })
    if (!res.ok) return null
    const data = await res.json()
    const hex: string = data.audio_hex || ''
    if (!hex) return null
    const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map(b => parseInt(b, 16)))
    return new Blob([bytes], { type: 'audio/wav' })
}

export async function sttFromWebm(webm: Blob): Promise<string> {
    if (isMockMode()) {
        const mod = await import('../mocks/stt.json')
        const data = mod.default as any
        return data.transcript || ''
    }
    const arrayBuffer = await webm.arrayBuffer()
    const bytes = new Uint8Array(arrayBuffer)
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
    const res = await fetch(api('/jaicp/stt'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ audio_hex: hex }) })
    if (!res.ok) return ''
    const data = await res.json()
    return data.text || ''
}

export async function logWebhookMinimal(intent: 'tts' | 'stt') {
    try {
        if (isMockMode()) return
        await fetch(api('/jaicp/webhook'), {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channel: 'demo', intent, status: 'success', sale: false, amount: 0 })
        })
    } catch (_) { /* ignore */ }
}



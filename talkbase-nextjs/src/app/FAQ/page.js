'use client'
import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/layout/DashboardLayout'

// FIX: category/sort/filter persist across navigation via sessionStorage
const SS_CATEGORY = 'faq_activeCategory'
const SS_FILTER   = 'faq_filter'
const SS_SORT     = 'faq_sort'

const CATEGORIES = [
  { id: 'all',       label: 'All'       },
  { id: 'fashion',   label: 'Fashion'   },
  { id: 'ecommerce', label: 'E-commerce'},
  { id: 'food',      label: 'Food'      },
  { id: 'pharmacy',  label: 'Pharmacy'  },
]

function Badge({ color, children }) {
  const s = {
    green:  { background: '#F0FDF4', color: '#15803D', border: '1px solid #BBF7D0' },
    orange: { background: '#FAFAF9', color: '#92400E', border: '1px solid #D6D3D1' },
    red:    { background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FECACA' },
    blue:   { background: '#F8FAFC', color: '#1E40AF', border: '1px solid #CBD5E1' },
    gray:   { background: '#F8FAFC', color: '#475569', border: '1px solid #CBD5E1' },
    purple: { background: '#F8FAFC', color: '#5B21B6', border: '1px solid #CBD5E1' },
  }
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0" style={s[color]}>
      {children}
    </span>
  )
}

function Toast({ toast }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white transition-all duration-300"
      style={{
        background: toast.type === 'success' ? '#16A34A' : '#DC2626',
        opacity: toast.visible ? 1 : 0,
        transform: toast.visible ? 'translateY(0)' : 'translateY(12px)',
        pointerEvents: 'none',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      }}>
      {toast.message}
    </div>
  )
}

function Spinner({ small = false }) {
  const size = small ? 'w-3 h-3' : 'w-4 h-4'
  return (
    <div className={`${size} rounded-full border-2 animate-spin flex-shrink-0`}
      style={{ borderColor: 'rgba(37,99,235,0.2)', borderTopColor: '#2563EB' }} />
  )
}

function authHeader() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

// ── Helper: mark FAQ(s) as ingested in MongoDB so badge survives refresh ──
async function markIngested(faqIds) {
  try {
    await fetch('/api/faq/mark-ingested', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeader() },
      body: JSON.stringify({ faqIds }),
    })
  } catch {
    // non-fatal — badge may reset on next refresh but data is safe
  }
}

export default function FAQPage() {
  // FIX: restore persisted tab/filter/sort from sessionStorage
  const [faqs,           setFaqs]          = useState([])
  const [loading,        setLoading]        = useState(true)
  const [activeCategory, setActiveCategory] = useState(() =>
    typeof window !== 'undefined' ? (sessionStorage.getItem(SS_CATEGORY) || 'all') : 'all'
  )
  const [filter, setFilter] = useState(() =>
    typeof window !== 'undefined' ? (sessionStorage.getItem(SS_FILTER) || 'all') : 'all'
  )
  const [sort, setSort] = useState(() =>
    typeof window !== 'undefined' ? (sessionStorage.getItem(SS_SORT) || 'askCount') : 'askCount'
  )

  const [saving,      setSaving]      = useState(null)
  const [editingId,   setEditingId]   = useState(null)
  const [editAnswer,  setEditAnswer]  = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newQ,        setNewQ]        = useState('')
  const [newA,        setNewA]        = useState('')
  const [newCategory, setNewCategory] = useState('fashion')
  const [adding,      setAdding]      = useState(false)
  const [toast,       setToast]       = useState({ visible: false, message: '', type: 'success' })

  const [ingestingId,  setIngestingId]  = useState(null)
  const [ingestingAll, setIngestingAll] = useState(false)
  const [deletingId,   setDeletingId]   = useState(null)

  function showToast(message, type = 'success') {
    setToast({ visible: true, message, type })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 3500)
  }

  // FIX: persist tab/filter/sort to sessionStorage whenever they change
  useEffect(() => { sessionStorage.setItem(SS_CATEGORY, activeCategory) }, [activeCategory])
  useEffect(() => { sessionStorage.setItem(SS_FILTER,   filter)         }, [filter])
  useEffect(() => { sessionStorage.setItem(SS_SORT,     sort)           }, [sort])

  const fetchFAQs = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('answered', filter === 'answered' ? 'true' : 'false')
      params.set('sort', sort)
      const res  = await fetch(`/api/faq?${params}`, { headers: authHeader() })
      const data = await res.json()
      if (res.ok) setFaqs(data.faqs)
      else showToast(data.message || 'Something went wrong', 'error')
    } catch {
      showToast('Cannot connect to server', 'error')
    } finally {
      setLoading(false)
    }
  }, [filter, sort])

  useEffect(() => { fetchFAQs() }, [fetchFAQs])

  /* ── INGEST single FAQ ── */
  async function ingestFAQ(faq) {
    if (!faq.answer?.trim()) {
      showToast('Add an answer before ingesting into AI', 'error')
      return
    }
    setIngestingId(faq._id)
    try {
      const res = await fetch('/api/ai/ingest-faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ faqId: faq._id, question: faq.question, answer: faq.answer }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Ingest failed')

      // FIX: persist isIngested to MongoDB so it survives page refresh
      await markIngested([faq._id])

      // Optimistic update in local state
      setFaqs(prev => prev.map(f =>
        f._id === faq._id ? { ...f, isIngested: true, ingestedAt: new Date().toISOString() } : f
      ))
      showToast('FAQ ingested into AI knowledge base ✓')
    } catch (err) {
      showToast(err.message || 'Failed to ingest FAQ', 'error')
    } finally {
      setIngestingId(null)
    }
  }

  /* ── INGEST ALL answered FAQs ──
     FIX: was using filteredFaqs (only the visible category tab).
     Now uses the full `faqs` array so ALL answered FAQs are ingested
     regardless of which category tab is active. The button label also
     shows the total answered count, not just the visible count. */
  async function ingestAll() {
    const answered = faqs.filter(f => f.isAnswered)
    if (answered.length === 0) {
      showToast('No answered FAQs to ingest', 'error')
      return
    }
    setIngestingAll(true)
    try {
      const res = await fetch('/api/ai/ingest-faq-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({
          faqs: answered.map(f => ({ faqId: f._id, question: f.question, answer: f.answer })),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Bulk ingest failed')

      // FIX: persist all ingested IDs to MongoDB
      await markIngested(answered.map(f => f._id))

      // Optimistic update
      const answeredIds = new Set(answered.map(f => f._id))
      setFaqs(prev => prev.map(f =>
        answeredIds.has(f._id) ? { ...f, isIngested: true, ingestedAt: new Date().toISOString() } : f
      ))
      showToast(`${answered.length} FAQs ingested into AI knowledge base ✓`)
    } catch (err) {
      showToast(err.message || 'Bulk ingest failed', 'error')
    } finally {
      setIngestingAll(false)
    }
  }

  /* ── SAVE answer ── */
  async function saveAnswer(faqId) {
    if (!editAnswer.trim()) { showToast('Answer cannot be empty', 'error'); return }
    setSaving(faqId)
    try {
      const res = await fetch(`/api/faq/${faqId}/answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ answer: editAnswer }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast('Answer saved ✓')
        setEditingId(null)
        setEditAnswer('')
        fetchFAQs()
      } else {
        showToast(data.message || 'Error occurred', 'error')
      }
    } catch {
      showToast('Server error', 'error')
    } finally {
      setSaving(null)
    }
  }

  /* ── DELETE FAQ ── */
  async function deleteFAQ(faqId) {
    if (!confirm('Are you sure you want to delete this FAQ?')) return
    setDeletingId(faqId)
    try {
      const res = await fetch(`/api/faq/${faqId}`, {
        method: 'DELETE',
        headers: authHeader(),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Failed to delete FAQ')
      }

      try {
        const vecRes = await fetch(`/api/ai/vectors/${faqId}`, {
          method: 'DELETE',
          headers: authHeader(),
        })
        if (!vecRes.ok) {
          showToast('FAQ deleted, but vector cleanup failed — check Pinecone manually', 'error')
        } else {
          showToast('FAQ and AI vectors deleted successfully')
        }
      } catch {
        showToast('FAQ deleted, but vector cleanup failed — check Pinecone manually', 'error')
      }

      fetchFAQs()
    } catch (err) {
      showToast(err.message || 'Could not delete FAQ', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  /* ── ADD manual FAQ ── */
  async function addManualFAQ() {
    if (!newQ.trim()) { showToast('Question is required', 'error'); return }
    setAdding(true)
    try {
      const res = await fetch('/api/faq/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ question: newQ, answer: newA, category: newCategory }),
      })
      const data = await res.json()
      if (res.ok) {
        showToast('FAQ added ✓')
        setNewQ(''); setNewA(''); setShowAddForm(false)
        fetchFAQs()
      } else {
        showToast(data.message || 'Error occurred', 'error')
      }
    } catch {
      showToast('Server error / backend not running', 'error')
    } finally {
      setAdding(false)
    }
  }

  /* ── Derived ──
     FIX: category filter applied client-side from the full faqs array.
     ingestAll() uses the full array; counts displayed per-category are correct. */
  const filteredFaqs    = activeCategory === 'all' ? faqs : faqs.filter(f => f.category === activeCategory)
  // FIX: "Ingest All" count reflects ALL answered FAQs, not just the visible tab
  const totalAnswered   = faqs.filter(f => f.isAnswered).length
  const unansweredCount = filteredFaqs.filter(f => !f.isAnswered).length
  const answeredCount   = filteredFaqs.filter(f => f.isAnswered).length

  const categoryColor = { fashion: 'purple', ecommerce: 'blue', food: 'orange', pharmacy: 'green' }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#0F172A' }}>FAQ Manager</h1>
            <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>
              Manage frequently asked questions captured from your chatbot
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* FIX: "Ingest All" now shows count of ALL answered FAQs (not filtered) */}
            <button
              onClick={ingestAll}
              disabled={ingestingAll || totalAnswered === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
              style={{
                background: ingestingAll || totalAnswered === 0 ? '#F1F5F9' : '#EFF6FF',
                color:      ingestingAll || totalAnswered === 0 ? '#94A3B8' : '#2563EB',
                border:     `1px solid ${ingestingAll || totalAnswered === 0 ? '#E2E8F0' : '#BFDBFE'}`,
                cursor:     ingestingAll || totalAnswered === 0 ? 'not-allowed' : 'pointer',
              }}>
              {ingestingAll ? <Spinner small /> : null}
              {ingestingAll ? 'Ingesting…' : `Ingest All (${totalAnswered})`}
            </button>

            <button
              onClick={() => setShowAddForm(v => !v)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
              style={{ background: '#2563EB', border: 'none', cursor: 'pointer' }}>
              {showAddForm ? '✕ Close' : '+ Add FAQ'}
            </button>
          </div>
        </div>

        {/* ── Category Tabs ── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all flex-shrink-0"
              style={{
                background: activeCategory === cat.id ? '#2563EB' : '#fff',
                color:      activeCategory === cat.id ? '#fff' : '#475569',
                border:     activeCategory === cat.id ? '1px solid #2563EB' : '1px solid #E2E8F0',
                cursor: 'pointer',
              }}>
              {cat.label}
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  background: activeCategory === cat.id ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                  color:      activeCategory === cat.id ? '#fff' : '#64748B',
                }}>
                {cat.id === 'all' ? faqs.length : faqs.filter(f => f.category === cat.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total FAQs',  value: filteredFaqs.length, color: '#2563EB' },
            { label: 'Unanswered',  value: unansweredCount,     color: '#D97706' },
            { label: 'Answered',    value: answeredCount,        color: '#16A34A' },
          ].map(s => (
            <div key={s.label} className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid #E2E8F0' }}>
              <p className="text-xs font-medium mb-1" style={{ color: '#64748B' }}>{s.label}</p>
              <p className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── Add Form ── */}
        {showAddForm && (
          <div className="rounded-xl p-5 mb-5" style={{ background: '#fff', border: '1px solid #BFDBFE' }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: '#1E40AF' }}>Add New FAQ Manually</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Category *</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                    <button key={cat.id} onClick={() => setNewCategory(cat.id)}
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{
                        background: newCategory === cat.id ? '#EFF6FF' : '#F8FAFC',
                        color:      newCategory === cat.id ? '#2563EB' : '#64748B',
                        border:     newCategory === cat.id ? '1.5px solid #2563EB' : '1px solid #E2E8F0',
                        cursor: 'pointer',
                      }}>
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Question *</label>
                <input value={newQ} onChange={e => setNewQ(e.target.value)}
                  placeholder="e.g. What is your return policy?"
                  className="w-full text-sm rounded-lg outline-none"
                  style={{ padding: '9px 13px', border: '1.5px solid #E2E8F0', color: '#0F172A' }}
                  onFocus={e => e.target.style.borderColor = '#2563EB'}
                  onBlur={e  => e.target.style.borderColor = '#E2E8F0'} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: '#64748B' }}>Answer (optional)</label>
                <textarea value={newA} onChange={e => setNewA(e.target.value)}
                  placeholder="You can add the answer later..."
                  rows={3}
                  className="w-full text-sm rounded-lg outline-none resize-none"
                  style={{ padding: '9px 13px', border: '1.5px solid #E2E8F0', color: '#0F172A', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = '#2563EB'}
                  onBlur={e  => e.target.style.borderColor = '#E2E8F0'} />
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-sm rounded-lg"
                  style={{ border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={addManualFAQ} disabled={adding}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white rounded-lg"
                  style={{ background: adding ? '#93C5FD' : '#2563EB', border: 'none', cursor: adding ? 'not-allowed' : 'pointer' }}>
                  {adding && <Spinner small />}
                  {adding ? 'Adding…' : 'Add FAQ'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid #E2E8F0' }}>
            {['all', 'unanswered', 'answered'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-2 text-sm font-medium"
                style={{
                  background: filter === f ? '#2563EB' : '#fff',
                  color:      filter === f ? '#fff' : '#64748B',
                  border: 'none', cursor: 'pointer',
                  borderRight: f !== 'answered' ? '1px solid #E2E8F0' : 'none',
                }}>
                {f === 'all' ? 'All' : f === 'unanswered' ? 'Unanswered' : 'Answered'}
              </button>
            ))}
          </div>
          <select value={sort} onChange={e => setSort(e.target.value)}
            className="text-sm rounded-lg px-3 py-2"
            style={{ border: '1px solid #E2E8F0', color: '#475569', background: '#fff', cursor: 'pointer' }}>
            <option value="askCount">Most Asked</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        {/* ── FAQ List ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Spinner />
              <p className="text-sm" style={{ color: '#94A3B8' }}>Loading FAQs…</p>
            </div>
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="text-center py-20 rounded-xl" style={{ border: '2px dashed #E2E8F0' }}>
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium" style={{ color: '#64748B' }}>No FAQs found</p>
            <p className="text-sm mt-1" style={{ color: '#94A3B8' }}>
              {activeCategory === 'all'
                ? 'Questions from your chatbot will automatically appear here'
                : `No FAQs added for ${CATEGORIES.find(c => c.id === activeCategory)?.label} yet`}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredFaqs.map(faq => {
              // FIX: isIngested now comes from the DB (persists across refresh),
              // with a local optimistic update applied after ingest actions.
              const isIngested  = !!faq.isIngested
              const isIngesting = ingestingId === faq._id
              const isDeleting  = deletingId  === faq._id

              return (
                <div key={faq._id} className="rounded-xl overflow-hidden"
                  style={{ background: '#fff', border: '1px solid #E2E8F0' }}>

                  <div className="px-5 py-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div style={{
                          width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                          background: faq.isAnswered ? '#16A34A' : '#F59E0B',
                        }} />
                        <p className="text-sm font-medium leading-snug" style={{ color: '#0F172A' }}>
                          {faq.question}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                        {faq.category && (
                          <Badge color={categoryColor[faq.category] || 'gray'}>
                            {CATEGORIES.find(c => c.id === faq.category)?.label}
                          </Badge>
                        )}
                        <Badge color={faq.askCount >= 5 ? 'red' : faq.askCount >= 2 ? 'orange' : 'gray'}>
                          Asked {faq.askCount}x
                        </Badge>
                        <Badge color={faq.source === 'chat' ? 'blue' : 'gray'}>
                          {faq.source === 'chat' ? 'Chat' : 'Manual'}
                        </Badge>
                        {/* FIX: badge reads from DB field — survives page refresh */}
                        {isIngested && (
                          <Badge color="green">In AI</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 py-4">
                    {editingId === faq._id ? (
                      <div className="flex flex-col gap-3">
                        <textarea
                          value={editAnswer}
                          onChange={e => setEditAnswer(e.target.value)}
                          placeholder="Write your answer here..."
                          rows={3}
                          className="w-full text-sm rounded-lg outline-none resize-none"
                          style={{
                            padding: '9px 13px',
                            border: '1.5px solid #2563EB',
                            color: '#0F172A',
                            fontFamily: 'inherit',
                            boxShadow: '0 0 0 3px rgba(37,99,235,0.08)',
                          }} />
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => { setEditingId(null); setEditAnswer('') }}
                            className="px-3 py-1.5 text-sm rounded-lg"
                            style={{ border: '1px solid #E2E8F0', background: '#fff', color: '#64748B', cursor: 'pointer' }}>
                            Cancel
                          </button>
                          <button onClick={() => saveAnswer(faq._id)} disabled={saving === faq._id}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-white rounded-lg"
                            style={{ background: saving === faq._id ? '#93C5FD' : '#2563EB', border: 'none', cursor: 'pointer' }}>
                            {saving === faq._id && <Spinner small />}
                            Save Answer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-4">
                        {faq.isAnswered ? (
                          <p className="text-sm leading-relaxed flex-1" style={{ color: '#475569' }}>
                            {faq.answer}
                          </p>
                        ) : (
                          <p className="text-sm italic" style={{ color: '#94A3B8' }}>
                            No answer provided yet…
                          </p>
                        )}

                        <div className="flex gap-2 flex-shrink-0 flex-wrap">
                          <button
                            onClick={() => { setEditingId(faq._id); setEditAnswer(faq.answer || '') }}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg"
                            style={{ background: '#F8FAFC', color: '#374151', border: '1px solid #CBD5E1', cursor: 'pointer' }}>
                            {faq.isAnswered ? 'Edit' : 'Add Answer'}
                          </button>

                          <button
                            onClick={() => ingestFAQ(faq)}
                            disabled={isIngesting || !faq.isAnswered}
                            title={!faq.isAnswered ? 'Add an answer first to enable AI ingestion' : isIngested ? 'Re-ingest into AI' : 'Ingest into AI knowledge base'}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg"
                            style={{
                              background: !faq.isAnswered ? '#F8FAFC' : isIngested ? '#F0FDF4' : '#F8FAFC',
                              color: !faq.isAnswered ? '#94A3B8' : isIngested ? '#15803D' : '#1E40AF',
                              border: `1px solid ${!faq.isAnswered ? '#E2E8F0' : isIngested ? '#BBF7D0' : '#CBD5E1'}`,
                              cursor: !faq.isAnswered || isIngesting ? 'not-allowed' : 'pointer',
                            }}>
                            {isIngesting
                              ? <><Spinner small /> Ingesting…</>
                              : isIngested
                                ? 'Re-ingest'
                                : 'Ingest'}
                          </button>

                          <button
                            onClick={() => deleteFAQ(faq._id)}
                            disabled={isDeleting}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg"
                            style={{
                              background: '#FEE2E2', color: '#DC2626',
                              border: '1px solid #FECACA',
                              cursor: isDeleting ? 'not-allowed' : 'pointer',
                              opacity: isDeleting ? 0.6 : 1,
                            }}>
                            {isDeleting ? <><Spinner small /> Deleting…</> : (
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
      <Toast toast={toast} />
    </DashboardLayout>
  )
}

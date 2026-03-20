
import { useState, useEffect, useRef, useCallback } from 'react'
import { adminApi } from '../../lib/api'
import { messagesApi } from '../../lib/api'
import { Card, PageHeader, Badge, Alert, Button } from '../../components/ui'
import { Send, RefreshCw, CheckCircle, Clock, RotateCcw, MessageSquare } from 'lucide-react'
import '../../components/ui/components.css'
import './adminissues.css'

const initials = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

const timeAgo = (dt) => {
  if (!dt) return ''
  const diff = Date.now() - new Date(dt).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return new Date(dt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

export default function AdminIssuesPage() {
  const [issues,   setIssues]   = useState([])
  const [filter,   setFilter]   = useState('all')
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [selected, setSelected] = useState(null)
  const [thread,   setThread]   = useState([])
  const [loadingThread, setLoadingThread] = useState(false)
  const [reply,    setReply]    = useState('')
  const [sending,  setSending]  = useState(false)
  const bottomRef = useRef(null)

  const load = useCallback(() => {
    setLoading(true)
    adminApi.getIssues({ status: filter === 'all' ? '' : filter })
      .then(r => setIssues(r.data.issues || []))
      .catch(() => setError('Failed to load issues.'))
      .finally(() => setLoading(false))
  }, [filter])

  useEffect(() => { load() }, [filter])

  const openIssue = async (issue) => {
    setSelected(issue)
    setLoadingThread(true)
    setThread([])
    try {
      const r = await messagesApi.getThread(issue.id)
      setThread(r.data.messages || [])
    } catch { setThread([]) }
    finally { setLoadingThread(false) }
    // Refresh list to clear unread badge
    load()
  }

  // Scroll to bottom when thread updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [thread])

  const sendReply = async () => {
    if (!reply.trim() || !selected) return
    setSending(true)
    try {
      await messagesApi.sendMessage({ issue_id: selected.id, message: reply.trim() })
      setReply('')
      // Refresh thread
      const r = await messagesApi.getThread(selected.id)
      setThread(r.data.messages || [])
    } catch { setError('Failed to send message.') }
    finally { setSending(false) }
  }

  const resolveIssue = async (id) => {
    try {
      await adminApi.updateIssue({ id, status: 'resolved' })
      load()
      if (selected?.id === id) setSelected(s => ({ ...s, status: 'resolved' }))
    } catch { setError('Failed to update issue.') }
  }

  const reopenIssue = async (id) => {
    try {
      await adminApi.updateIssue({ id, status: 'pending' })
      load()
      if (selected?.id === id) setSelected(s => ({ ...s, status: 'pending' }))
    } catch { setError('Failed to update issue.') }
  }

  const tabs = [
    { key: 'all',      label: 'All' },
    { key: 'pending',  label: 'Pending' },
    { key: 'resolved', label: 'Resolved' },
  ]

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Reported Issues"
        subtitle="View and respond to issues from class representatives"
        actions={
          <Button size="sm" variant="secondary" icon={<RefreshCw size={14}/>} onClick={load}>
            Refresh
          </Button>
        }
      />

      {error && <Alert variant="error" onClose={() => setError('')} style={{ marginBottom: 16 }}>{error}</Alert>}

      <div className="issues-layout">
        {/* ── Left panel — issue list ── */}
        <div className="issues-list-panel">
          {/* Filter tabs */}
          <div className="issues-tabs">
            {tabs.map(t => (
              <button
                key={t.key}
                className={`issues-tab ${filter === t.key ? 'issues-tab-active' : ''}`}
                onClick={() => setFilter(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="issues-loading">
              {[1,2,3,4,5].map(i => <div key={i} className="issues-skeleton" />)}
            </div>
          ) : issues.length === 0 ? (
            <div className="issues-empty-list">
              <MessageSquare size={32} />
              <p>No issues found</p>
            </div>
          ) : (
            <div className="issues-list">
              {issues.map(issue => (
                <button
                  key={issue.id}
                  className={`issue-item ${selected?.id === issue.id ? 'issue-item-active' : ''} ${issue.unread_count > 0 ? 'issue-item-unread' : ''}`}
                  onClick={() => openIssue(issue)}
                >
                  <div className="issue-item-avatar">{initials(issue.classrep_name)}</div>
                  <div className="issue-item-content">
                    <div className="issue-item-top">
                      <span className="issue-item-name">{issue.classrep_name || 'Unknown'}</span>
                      <span className="issue-item-time">{timeAgo(issue.created_at)}</span>
                    </div>
                    <p className="issue-item-subject">{issue.subject}</p>
                    <div className="issue-item-bottom">
                      <Badge variant={issue.status === 'resolved' ? 'present' : 'pending'}>
                        {issue.status === 'resolved' ? '✅ Resolved' : '🕐 Pending'}
                      </Badge>
                      {issue.unread_count > 0 && (
                        <span className="issue-unread-badge">{issue.unread_count}</span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right panel — chat thread ── */}
        <div className="issues-chat-panel">
          {!selected ? (
            <div className="issues-chat-empty">
              <MessageSquare size={48} />
              <h3>Select an Issue</h3>
              <p>Click on an issue from the list to view the conversation</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="chat-header">
                <div className="chat-header-left">
                  <div className="chat-avatar">{initials(selected.classrep_name)}</div>
                  <div>
                    <p className="chat-header-name">{selected.classrep_name}</p>
                    <p className="chat-header-email">{selected.classrep_email}</p>
                  </div>
                </div>
                <div className="chat-header-actions">
                  {selected.status !== 'resolved' ? (
                    <Button
                      size="sm"
                      variant="success"
                      icon={<CheckCircle size={13}/>}
                      onClick={() => resolveIssue(selected.id)}
                    >
                      Mark Resolved
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      icon={<RotateCcw size={13}/>}
                      onClick={() => reopenIssue(selected.id)}
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </div>

              {/* Issue subject */}
              <div className="chat-subject">
                <span className="chat-subject-label">Subject:</span>
                <span className="chat-subject-text">{selected.subject}</span>
              </div>

              {/* Messages */}
              <div className="chat-messages">
                {/* Original issue message as first bubble */}
                <div className="chat-bubble chat-bubble-classrep">
                  <div className="chat-bubble-meta">
                    <span className="chat-bubble-sender">{selected.classrep_name}</span>
                    <span className="chat-bubble-time">{timeAgo(selected.created_at)}</span>
                  </div>
                  <div className="chat-bubble-text">{selected.body || selected.message}</div>
                </div>

                {loadingThread ? (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--muted)', fontSize: '0.85rem' }}>
                    Loading conversation…
                  </div>
                ) : (
                  thread.map((msg, i) => {
                    const isAdmin = msg.sender_role === 'admin'
                    return (
                      <div
                        key={i}
                        className={`chat-bubble ${isAdmin ? 'chat-bubble-admin' : 'chat-bubble-classrep'}`}
                      >
                        <div className="chat-bubble-meta">
                          <span className="chat-bubble-sender">
                            {isAdmin ? '🛡️ Admin' : selected.classrep_name}
                          </span>
                          <span className="chat-bubble-time">{timeAgo(msg.created_at)}</span>
                        </div>
                        <div className="chat-bubble-text">{msg.message}</div>
                      </div>
                    )
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Reply box */}
              <div className="chat-reply-box">
                <textarea
                  className="chat-reply-input"
                  placeholder={selected.status === 'resolved' ? 'This issue is resolved. Reopen to reply.' : 'Type your reply…'}
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  disabled={selected.status === 'resolved'}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendReply()
                    }
                  }}
                  rows={3}
                />
                <Button
                  variant="primary"
                  icon={<Send size={15}/>}
                  loading={sending}
                  disabled={!reply.trim() || selected.status === 'resolved'}
                  onClick={sendReply}
                >
                  Send
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
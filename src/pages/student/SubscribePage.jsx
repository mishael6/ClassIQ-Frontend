import { useState, useEffect } from 'react'

const API_URL = 'https://api-classiq.onrender.com'
const PAYLOQA_KEY = import.meta.env.VITE_PAYLOQA_API_KEY
const PAYLOQA_PLATFORM = import.meta.env.VITE_PAYLOQA_PLATFORM_ID

export default function SubscribePage() {
  const [studentId, setStudentId] = useState(null)
  const [studentName, setStudentName] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [widgetReady, setWidgetReady] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('student_id')
    const name = params.get('name') || 'Student'

    if (!id) {
      setStatus('error')
      setMessage('Invalid link. Please go back to the app.')
      return
    }

    setStudentId(id)
    setStudentName(decodeURIComponent(name))
    checkExistingSubscription(id)

    // Load Payloqa CDN script
    const script = document.createElement('script')
    script.src = 'https://cdn.payloqa.com/payment-widget.js'
    script.async = true
    script.onload = () => setWidgetReady(true)
    script.onerror = () => {
      console.log('CDN failed, using direct API')
      setWidgetReady(true)
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const checkExistingSubscription = async (id) => {
    try {
      const res = await fetch(`${API_URL}/ai/check_payment.php?student_id=${id}&check_only=1`)
      const data = await res.json()
      if (data.subscribed) {
        setStatus('already_subscribed')
      }
    } catch (e) {}
  }

  const handlePay = async () => {
    if (!studentId) return
    setStatus('loading')

    const orderId = `SIX-${studentId}-${Date.now()}`

    try {
      // Try CDN widget first
      if (window.PayloqaWidget) {
        window.PayloqaWidget.open({
          apiKey: PAYLOQA_KEY,
          platformId: PAYLOQA_PLATFORM,
          amount: 30.00,
          currency: 'GHS',
          primaryColor: '#1A73E8',
          orderId,
          webhookUrl: `${API_URL}/ai/payment_callback.php`,
          metadata: {
            student_id: studentId,
            type: 'six_subscription',
            customer_name: studentName,
          },
          onSuccess: async (result) => {
            await savePending(result.payment_id || result.id || orderId)
            setStatus('success')
          },
          onClose: () => setStatus('idle'),
          onError: () => {
            setStatus('idle')
            alert('Payment failed. Please try again.')
          },
        })
      } else {
        // Fallback — use direct API via our PHP backend
        const res = await fetch(`${API_URL}/ai/subscribe.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            student_id: studentId,
            phone: prompt('Enter your MoMo number (e.g. 0244000000):'),
            network: prompt('Enter your network (mtn / vodafone / airteltigo):') || 'mtn',
          }),
        })
        const data = await res.json()
        if (data.success) {
          setStatus('pending_momo')
          setMessage(data.message)
        } else {
          setStatus('idle')
          alert(data.message || 'Payment failed.')
        }
      }
    } catch (e) {
      setStatus('idle')
      alert('Something went wrong. Please try again.')
    }
  }

  const savePending = async (paymentId) => {
    try {
      await fetch(`${API_URL}/ai/save_pending.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          payment_id: paymentId,
          amount: 30.00,
        }),
      })
    } catch (e) {}
  }

  // ── Success ───────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.emoji}>🎉</div>
          <h1 style={styles.title}>Payment Successful!</h1>
          <p style={styles.subtitle}>Six unlimited is now active. Go back to the ClassIQ app to start studying!</p>
          <div style={{ ...styles.badge, backgroundColor: '#38A16922', color: '#38A169' }}>✓ Subscription Activated</div>
          <p style={styles.hint}>You can close this page and return to the app.</p>
        </div>
      </div>
    )
  }

  // ── Pending MoMo ──────────────────────────────────────────────
  if (status === 'pending_momo') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.emoji}>📱</div>
          <h1 style={styles.title}>Check Your Phone!</h1>
          <p style={styles.subtitle}>{message}</p>
          <p style={styles.hint}>Approve the MoMo prompt then return to the ClassIQ app.</p>
          <button style={styles.payBtn} onClick={() => window.close()}>
            Done — Go Back to App
          </button>
        </div>
      </div>
    )
  }

  // ── Already subscribed ────────────────────────────────────────
  if (status === 'already_subscribed') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.emoji}>✨</div>
          <h1 style={styles.title}>Already Subscribed!</h1>
          <p style={styles.subtitle}>You already have an active Six subscription.</p>
          <p style={styles.hint}>Go back to the ClassIQ app to continue studying.</p>
        </div>
      </div>
    )
  }

  // ── Error ─────────────────────────────────────────────────────
  if (status === 'error') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.emoji}>❌</div>
          <h1 style={styles.title}>Invalid Link</h1>
          <p style={styles.subtitle}>{message}</p>
        </div>
      </div>
    )
  }

  // ── Loading ───────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <div style={styles.emoji}>⏳</div>
          <p style={styles.subtitle}>Opening payment...</p>
        </div>
      </div>
    )
  }

  // ── Main ──────────────────────────────────────────────────────
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <span style={{ fontSize: 36 }}>✨</span>
        </div>
        <h1 style={styles.title}>Unlock Six Unlimited</h1>
        <p style={styles.subtitle}>
          Hi {studentName}! Get unlimited AI explanations, flashcards, MCQs and more.
        </p>

        <div style={styles.planCard}>
          <div style={styles.priceRow}>
            <span style={styles.currency}>GHS</span>
            <span style={styles.price}>30</span>
            <span style={styles.per}>/month</span>
          </div>
          <ul style={styles.featureList}>
            {[
              '✓ Unlimited AI explanations',
              '✓ Unlimited MCQ generation',
              '✓ Unlimited flashcards',
              '✓ Fill-in-the-blank questions',
              '✓ Priority Six responses',
            ].map((f, i) => (
              <li key={i} style={styles.featureItem}>{f}</li>
            ))}
          </ul>
        </div>

        <button
          style={{ ...styles.payBtn, opacity: widgetReady ? 1 : 0.7 }}
          onClick={handlePay}
          disabled={!widgetReady}
        >
          {widgetReady ? 'Pay GHS 30 & Activate Six' : 'Loading payment...'}
        </button>

        <p style={styles.securedBy}>🔒 Secured by Payloqa</p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#F5F7FA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    padding: '40px 32px',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 4px 40px rgba(0,0,0,0.10)',
    textAlign: 'center',
  },
  logoWrap: {
    width: '72px', height: '72px',
    backgroundColor: '#6B46C122',
    borderRadius: '20px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
  },
  emoji: { fontSize: '56px', marginBottom: '16px' },
  title: { fontSize: '26px', fontWeight: '800', color: '#0D1B2A', marginBottom: '8px' },
  subtitle: { fontSize: '15px', color: '#4A5568', marginBottom: '24px', lineHeight: '1.6' },
  planCard: {
    backgroundColor: '#1A73E812',
    border: '1.5px solid #1A73E840',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '24px',
    textAlign: 'left',
  },
  priceRow: {
    display: 'flex', alignItems: 'flex-end', gap: '4px',
    justifyContent: 'center', marginBottom: '16px',
  },
  currency: { fontSize: '18px', fontWeight: '700', color: '#1A73E8', marginBottom: '6px' },
  price: { fontSize: '48px', fontWeight: '900', color: '#1A73E8', lineHeight: '1' },
  per: { fontSize: '16px', color: '#4A5568', marginBottom: '8px' },
  featureList: { listStyle: 'none', padding: '0', margin: '0', display: 'flex', flexDirection: 'column', gap: '8px' },
  featureItem: { fontSize: '14px', color: '#0D1B2A', fontWeight: '500' },
  payBtn: {
    backgroundColor: '#1A73E8',
    color: '#fff',
    border: 'none',
    borderRadius: '999px',
    padding: '16px 32px',
    fontSize: '16px',
    fontWeight: '800',
    cursor: 'pointer',
    width: '100%',
    marginBottom: '12px',
  },
  securedBy: { fontSize: '12px', color: '#9AA5B4' },
  badge: {
    display: 'inline-block',
    padding: '8px 20px',
    borderRadius: '999px',
    fontWeight: '700',
    fontSize: '14px',
    marginBottom: '16px',
  },
  hint: { fontSize: '13px', color: '#9AA5B4', marginTop: '16px' },
}
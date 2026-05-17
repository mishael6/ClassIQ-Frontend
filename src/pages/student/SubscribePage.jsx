import { useState, useEffect } from 'react'
import { PaymentWidget } from '@payloqa/payment-widget'
import '@payloqa/payment-widget/styles'

const API_URL = 'https://api-classiq.onrender.com'

export default function SubscribePage() {
  const [studentId, setStudentId] = useState(null)
  const [studentName, setStudentName] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const id = params.get('student_id')
    const name = params.get('name') || 'Student'

    if (!id) { setStatus('error'); return; }

    setStudentId(id)
    setStudentName(decodeURIComponent(name))
    checkSubscription(id)
  }, [])

  const checkSubscription = async (id) => {
    try {
      const res = await fetch(`${API_URL}/ai/check_payment.php?student_id=${id}&check_only=1`)
      const data = await res.json()
      if (data.subscribed) setStatus('already_subscribed')
    } catch (e) {}
  }

  const handleSuccess = async (result) => {
    setIsOpen(false)
    setStatus('loading')
    try {
      await fetch(`${API_URL}/ai/save_pending.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          payment_id: result.payment_id || result.transactionId || result.id,
          amount: 30.00,
        }),
      })
    } catch (e) {}
    setStatus('success')
  }

  const paymentConfig = {
  apiKey: import.meta.env.VITE_PAYLOQA_API_KEY || 'pk_live_of502pjkel',
  platformId: import.meta.env.VITE_PAYLOQA_PLATFORM_ID || 'plat_xvadsq3rx0f',
  amount: 30.00,
  currency: 'GHS',
  primaryColor: '#1A73E8',
  displayMode: 'modal',
  webhookUrl: `${API_URL}/ai/payment_callback.php`,
  orderId: `SIX-${studentId}-${Date.now()}`,
  metadata: {
    student_id: studentId,
    type: 'six_subscription',
    customer_name: studentName,
  },
}

  if (status === 'success') return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.emoji}>🎉</div>
        <h1 style={styles.title}>Payment Successful!</h1>
        <p style={styles.subtitle}>Six unlimited is now active. Go back to the ClassIQ app!</p>
        <p style={styles.hint}>You can close this page.</p>
      </div>
    </div>
  )

  if (status === 'already_subscribed') return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.emoji}>✨</div>
        <h1 style={styles.title}>Already Subscribed!</h1>
        <p style={styles.subtitle}>You already have an active Six subscription.</p>
        <p style={styles.hint}>Go back to the ClassIQ app to continue studying.</p>
      </div>
    </div>
  )

  if (status === 'loading') return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.emoji}>⏳</div>
        <p style={styles.subtitle}>Activating your subscription...</p>
      </div>
    </div>
  )

  if (status === 'error') return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.emoji}>❌</div>
        <h1 style={styles.title}>Invalid Link</h1>
        <p style={styles.subtitle}>Please go back to the app and try again.</p>
      </div>
    </div>
  )

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

        <div style={styles.networkHint}>
          <strong style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>💡 Network Tips:</strong>
          <span style={{ display: 'block', marginBottom: '6px' }}>
            • <strong>MTN / AirtelTigo:</strong> You will get a direct push prompt on your phone to enter your PIN.
          </span>
          <span>
            • <strong>Telecel (Vodafone):</strong> Telecel does not send OTPs automatically! You must dial <strong>*110#</strong> on your phone, choose <strong>Option 4 (Make Payment)</strong>, then <strong>Option 1 (Generate Voucher)</strong>, and enter that Voucher Code in the payment screen.
          </span>
        </div>

        <button style={styles.payBtn} onClick={() => setIsOpen(true)}>
          Pay GHS 30 & Activate Six
        </button>
        <p style={styles.securedBy}>🔒 Secured by Payloqa</p>

        <PaymentWidget
          config={paymentConfig}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSuccess={handleSuccess}
        />
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', backgroundColor: '#F5F7FA',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  card: {
    backgroundColor: '#fff', borderRadius: '24px', padding: '40px 32px',
    maxWidth: '420px', width: '100%',
    boxShadow: '0 4px 40px rgba(0,0,0,0.10)', textAlign: 'center',
  },
  logoWrap: {
    width: '72px', height: '72px', backgroundColor: '#6B46C122',
    borderRadius: '20px', display: 'flex', alignItems: 'center',
    justifyContent: 'center', margin: '0 auto 16px',
  },
  emoji: { fontSize: '56px', marginBottom: '16px' },
  title: { fontSize: '26px', fontWeight: '800', color: '#0D1B2A', marginBottom: '8px' },
  subtitle: { fontSize: '15px', color: '#4A5568', marginBottom: '24px', lineHeight: '1.6' },
  planCard: {
    backgroundColor: '#1A73E812', border: '1.5px solid #1A73E840',
    borderRadius: '16px', padding: '20px', marginBottom: '24px', textAlign: 'left',
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
    backgroundColor: '#1A73E8', color: '#fff', border: 'none',
    borderRadius: '999px', padding: '16px 32px', fontSize: '16px',
    fontWeight: '800', cursor: 'pointer', width: '100%', marginBottom: '12px',
  },
  securedBy: { fontSize: '12px', color: '#9AA5B4' },
  hint: { fontSize: '13px', color: '#9AA5B4', marginTop: '16px' },
  networkHint: {
    backgroundColor: '#FFF9E6', border: '1px solid #FFE0B2',
    color: '#B78103', borderRadius: '12px', padding: '14px 16px',
    fontSize: '13px', lineHeight: '1.5', textAlign: 'left',
    marginBottom: '20px',
  },
}
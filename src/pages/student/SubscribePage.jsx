import { useState, useEffect } from 'react'

const API_URL = 'https://api-classiq.onrender.com'
const PAYLOQA_KEY = import.meta.env.VITE_PAYLOQA_API_KEY
const PAYLOQA_PLATFORM = import.meta.env.VITE_PAYLOQA_PLATFORM_ID

export default function SubscribePage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const studentId = params.get('student_id')
    const name = params.get('name') || 'Student'
    window.location.href = `/payment.html?student_id=${studentId}&name=${name}`
  }, [])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <p>Redirecting to payment...</p>
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
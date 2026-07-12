import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { lecturerApi } from '../../lib/api'
import { L, ensureLeafletIcons } from '../../lib/leafletSetup'
import { Button, Select, Alert, Card, PageHeader } from '../../components/ui'
import { QrCode, Navigation, Loader2, ArrowLeft } from 'lucide-react'
import QRCode from 'qrcode'
import '../../components/ui/components.css'
import '../classrep/generateqr.css'

const RADII = [10, 20, 30, 50, 100, 150, 200]

export default function LecturerGenerateQRPage() {
  const [step, setStep] = useState('map')
  const [weeks, setWeeks] = useState([])
  const [weeksLoading, setWeeksLoading] = useState(true)
  const [weekNumber, setWeekNumber] = useState('')
  const [radius, setRadius] = useState(100)
  const [pin, setPin] = useState(null)
  const [session, setSession] = useState(null)
  const [qrUrl, setQrUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [ending, setEnding] = useState(false)
  const [error, setError] = useState('')
  const [mapReady, setMapReady] = useState(false)
  const [pinStatus, setPinStatus] = useState('idle')

  const mapRef = useRef(null)
  const leaflet = useRef(null)
  const markerRef = useRef(null)
  const circleRef = useRef(null)
  const radiusRef = useRef(radius)

  useEffect(() => { radiusRef.current = radius }, [radius])

  useEffect(() => {
    lecturerApi.getWeeks()
      .then(r => {
        const list = r.data.weeks || []
        setWeeks(list)
        if (list.length) setWeekNumber(String(list[0].week_number))
      })
      .catch(() => setError('Failed to load weeks. Add weeks first.'))
      .finally(() => setWeeksLoading(false))
  }, [])

  const placePin = useCallback((map, pinIcon, lat, lng) => {
    if (markerRef.current) map.removeLayer(markerRef.current)
    if (circleRef.current) map.removeLayer(circleRef.current)

    const r = radiusRef.current
    const marker = L.marker([lat, lng], { icon: pinIcon, draggable: true }).addTo(map)
    const circle = L.circle([lat, lng], {
      radius: r, color: '#0066ff', fillColor: '#0066ff', fillOpacity: 0.1, weight: 2, dashArray: '6 4',
    }).addTo(map)

    marker.on('dragend', e => {
      const { lat: la, lng: lo } = e.target.getLatLng()
      setPin({ lat: la, lng: lo })
      circle.setLatLng([la, lo])
    })

    markerRef.current = marker
    circleRef.current = circle
    setPin({ lat, lng })
    setPinStatus('set')
    map.setView([lat, lng], 18)
  }, [])

  const mapActive = step === 'map' && !weeksLoading && weeks.length > 0

  useEffect(() => {
    if (!mapActive || !mapRef.current) return

    ensureLeafletIcons()
    setMapReady(false)

    const pinIcon = L.divIcon({
      className: '', html: '<div class="map-pin-icon"></div>',
      iconSize: [28, 28], iconAnchor: [14, 28],
    })

    const map = L.map(mapRef.current, { zoomControl: true }).setView([6.6884, -1.6244], 16)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19,
    }).addTo(map)

    map.on('click', e => placePin(map, pinIcon, e.latlng.lat, e.latlng.lng))
    leaflet.current = { map, pinIcon }

    const refresh = () => map.invalidateSize()
    const t1 = setTimeout(refresh, 100)
    const t2 = setTimeout(refresh, 400)
    const t3 = setTimeout(() => { refresh(); setMapReady(true) }, 600)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      map.remove()
      leaflet.current = null
      markerRef.current = null
      circleRef.current = null
      setMapReady(false)
    }
  }, [mapActive, placePin])

  useEffect(() => {
    if (circleRef.current) circleRef.current.setRadius(radius)
  }, [radius])

  const autoLocate = () => {
    if (!navigator.geolocation || !leaflet.current) return
    const { map, pinIcon } = leaflet.current
    navigator.geolocation.getCurrentPosition(
      p => placePin(map, pinIcon, p.coords.latitude, p.coords.longitude),
      () => setError('Could not get your location.'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const selectedWeek = weeks.find(w => String(w.week_number) === String(weekNumber))

  const generate = async () => {
    if (!pin) { setError('Please drop a pin on the map first.'); return }
    if (!weekNumber) { setError('Please select a week.'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await lecturerApi.generateQR({
        week_number: parseInt(weekNumber, 10), lat: pin.lat, lng: pin.lng, radius_m: radius,
      })
      if (data.success !== false && (data.session || data.attendance_url)) {
        setSession(data.session)
        const url = await QRCode.toDataURL(data.attendance_url || data.session?.attendance_url, { width: 500, margin: 2 })
        setQrUrl(url)
        setStep('qr')
      } else setError(data.message || 'Failed to generate QR.')
    } catch (err) {
      setError(err?.response?.data?.message || 'Connection error.')
    } finally { setLoading(false) }
  }

  const endSession = async () => {
    if (!session) return
    setEnding(true)
    try {
      await lecturerApi.endSession({ session_id: session.id })
      setSession(null); setQrUrl(''); setPin(null); setPinStatus('idle'); setStep('map')
    } catch { setError('Failed to end session.') }
    finally { setEnding(false) }
  }

  if (weeksLoading) {
    return (
      <div className="animate-fade-up">
        <PageHeader title="Generate Attendance QR" subtitle="Loading your weeks…" />
        <Card style={{ padding: 40, textAlign: 'center' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: 'var(--blue)', margin: '0 auto' }} />
        </Card>
      </div>
    )
  }

  if (!weeks.length) {
    return (
      <div className="animate-fade-up">
        <PageHeader title="Generate Attendance QR" subtitle="Set up weeks before taking attendance" />
        <Card style={{ padding: 32, textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', marginBottom: 16 }}>You need at least one week with a topic before generating QR codes.</p>
          <Link to="/lecturer/weeks"><Button>Add Weeks & Topics</Button></Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="animate-fade-up qr-page">
      <PageHeader
        title="Generate Attendance QR"
        subtitle={step === 'map' ? 'Pin your classroom, select a week/topic, then generate' : 'Show this QR to students'}
      />
      {error && <Alert variant="error" onClose={() => setError('')} style={{ marginBottom: 16 }}>{error}</Alert>}

      {step === 'map' && (
        <div className="qr-map-step">
          <Card>
            <div className="step-head">
              <div className="step-num">1</div>
              <div>
                <p className="step-title">Pin Your Classroom</p>
                <p className="step-sub">Click the map or use GPS</p>
              </div>
              <Button variant="ghost" size="sm" icon={<Navigation size={14}/>} onClick={autoLocate} style={{ marginLeft: 'auto' }}>Use GPS</Button>
            </div>
            <div className="qr-map-wrap">
              {!mapReady && (
                <div className="qr-map-loading">
                  <Loader2 size={28} className="animate-spin" style={{ color: 'var(--blue)' }}/>
                  <p>Loading map…</p>
                </div>
              )}
              <div ref={mapRef} className="qr-map" style={{ opacity: mapReady ? 1 : 0 }} />
            </div>
            <div className={`pin-status ${pinStatus === 'set' ? 'ps-ok' : 'ps-wait'}`}>
              {pinStatus === 'set' ? `✅ Pinned at ${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}` : '🗺️ Pin your classroom on the map'}
            </div>
            <div className="radius-row">
              <span className="radius-label">Allowed radius:</span>
              <div className="radius-chips">
                {RADII.map(r => (
                  <button key={r} type="button" className={`chip ${radius === r ? 'chip-active' : ''}`} onClick={() => setRadius(r)}>{r}m</button>
                ))}
              </div>
            </div>
          </Card>

          {pinStatus === 'set' && (
            <Card style={{ marginTop: 16 }}>
              <div className="step-head">
                <div className="step-num">2</div>
                <div>
                  <p className="step-title">Select Week & Topic</p>
                  <p className="step-sub">Attendance will be saved under this week number</p>
                </div>
              </div>
              <Select label="Week & Topic" value={weekNumber} onChange={e => setWeekNumber(e.target.value)} style={{ marginTop: 12 }}>
                {weeks.map(w => (
                  <option key={w.id} value={w.week_number}>Week {w.week_number} — {w.topic}</option>
                ))}
              </Select>
              {selectedWeek && (
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: 8 }}>
                  Topic: <strong>{selectedWeek.topic}</strong>
                </p>
              )}
              <Button fullWidth loading={loading} onClick={generate} icon={<QrCode size={16}/>} style={{ marginTop: 16 }} size="lg">
                Generate QR Code
              </Button>
            </Card>
          )}
        </div>
      )}

      {step === 'qr' && session && qrUrl && (
        <div className="qr-display-step animate-fade-up">
          <Card className="qr-main-card">
            <div className="qr-top-badges">
              <span className="qr-live-badge"><span className="live-dot"/>Live Session</span>
              <span className="qr-badge-item">📅 Week {session.week_number}</span>
              <span className="qr-badge-item">📚 {session.topic}</span>
              <span className="qr-badge-item">🔑 {session.code}</span>
            </div>
            <div className="qr-frame-big"><img src={qrUrl} alt="Attendance QR" className="qr-img-big"/></div>
            <div className="qr-link-row">
              <input readOnly value={session.attendance_url || ''} className="qr-link-input"/>
              <Button size="sm" onClick={() => navigator.clipboard.writeText(session.attendance_url || '')}>Copy Link</Button>
            </div>
            <div className="qr-actions">
              <Button variant="secondary" icon={<ArrowLeft size={15}/>} onClick={() => setStep('map')} style={{ flex: 1 }}>Back to Map</Button>
              <Button variant="danger" loading={ending} onClick={endSession} style={{ flex: 1 }}>⛔ End Session</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

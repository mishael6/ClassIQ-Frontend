import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from '../../lib/navigation.jsx'
import { classrepApi } from '../../lib/api'
import { L, ensureLeafletIcons } from '../../lib/leafletSetup'
import { Button, Select, Alert, Card, PageHeader } from '../../components/ui'
import { MapPin, QrCode, Navigation, Loader2, Bookmark, Save, Trash2, Search, AlertTriangle, Lightbulb, CheckCircle, Ruler, BookOpen, KeyRound, CircleStop, Crosshair, ChevronDown } from 'lucide-react'
import QRCode from 'qrcode'
import '../../components/ui/components.css'
import './generateqr.css'

const RADII       = [10, 20, 30, 50, 100, 150, 200]

export default function GenerateQRPage() {
  const [step,      setStep]      = useState('map')
  const [lecture,   setLecture]   = useState('')
  const [savedLectures, setSavedLectures] = useState([])
  const [radius,    setRadius]    = useState(100)
  const [pin,       setPin]       = useState(null)
  const [session,   setSession]   = useState(null)
  const [qrUrl,     setQrUrl]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [ending,    setEnding]    = useState(false)
  const [error,     setError]     = useState('')
  const [mapReady,  setMapReady]  = useState(false)
  const [pinStatus, setPinStatus] = useState('idle')

  // Coordinate input states
  const [manualLat,  setManualLat]  = useState('')
  const [manualLng,  setManualLng]  = useState('')
  const [coordError, setCoordError] = useState('')

  // Saved Locations states
  const [savedLocs, setSavedLocs] = useState([])
  const [saving,    setSaving]    = useState(false)
  const [locName,   setLocName]   = useState('')
  const [deleting,  setDeleting]  = useState(null)

  const mapRef    = useRef(null)
  const leaflet   = useRef(null)
  const markerRef = useRef(null)
  const circleRef = useRef(null)
  const radiusRef = useRef(radius)

  useEffect(() => { radiusRef.current = radius }, [radius])

  useEffect(() => {
    classrepApi.getSavedLocations()
      .then(res => setSavedLocs(res.data.locations || []))
      .catch(() => {})
    classrepApi.getSavedLectures()
      .then(res => {
        const list = res.data.lectures || []
        setSavedLectures(list)
        if (list.length) setLecture(list[0].name)
      })
      .catch(() => {})
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
      setManualLat(la.toFixed(6))
      setManualLng(lo.toFixed(6))
      circle.setLatLng([la, lo])
    })

    markerRef.current = marker
    circleRef.current = circle
    setPin({ lat, lng })
    setManualLat(lat.toFixed(6))
    setManualLng(lng.toFixed(6))
    setPinStatus('set')
    map.setView([lat, lng], 18)
  }, [])

  useEffect(() => {
    if (step !== 'map' || !mapRef.current) return

    ensureLeafletIcons()
    setMapReady(false)

    const pinIcon = L.divIcon({
      className: '', html: `<div class="map-pin-icon"></div>`,
      iconSize: [28, 28], iconAnchor: [14, 28],
    })

    const map = L.map(mapRef.current, { zoomControl: true }).setView([6.6884, -1.6244], 16)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap', maxZoom: 19,
    }).addTo(map)

    map.on('click', e => placePin(map, pinIcon, e.latlng.lat, e.latlng.lng))
    leaflet.current = { map, L, pinIcon }

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
  }, [step, placePin])

  useEffect(() => {
    if (circleRef.current) circleRef.current.setRadius(radius)
  }, [radius])

  const placePinOnMap = (lat, lng) => {
    if (!leaflet.current) return
    const { map, pinIcon } = leaflet.current
    placePin(map, pinIcon, lat, lng)
  }

  const autoLocate = () => {
    if (!navigator.geolocation) { setError('GPS not supported.'); return }
    if (!leaflet.current) { setError('Map not ready yet.'); return }
    navigator.geolocation.getCurrentPosition(
      p => placePinOnMap(p.coords.latitude, p.coords.longitude),
      () => setError('Could not get your location. Enter coordinates manually or click the map.'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  // ── New: Apply manually entered coordinates ──
  const applyManualCoords = () => {
    setCoordError('')
    const lat = parseFloat(manualLat)
    const lng = parseFloat(manualLng)

    if (isNaN(lat) || isNaN(lng)) {
      setCoordError('Please enter valid numbers for both latitude and longitude.')
      return
    }
    if (lat < -90 || lat > 90) {
      setCoordError('Latitude must be between -90 and 90.')
      return
    }
    if (lng < -180 || lng > 180) {
      setCoordError('Longitude must be between -180 and 180.')
      return
    }
    if (!leaflet.current) {
      setCoordError('Map not ready yet. Please wait a moment.')
      return
    }

    const { map, pinIcon } = leaflet.current
    placePin(map, pinIcon, lat, lng)
  }

  const applySavedLocation = (id) => {
    const loc = savedLocs.find(l => String(l.id) === String(id))
    if (!loc || !leaflet.current) return
    const lat = parseFloat(loc.lat)
    const lng = parseFloat(loc.lng)
    setRadius(parseInt(loc.radius_m))
    placePin(leaflet.current.map, leaflet.current.pinIcon, lat, lng)
  }

  const savePreset = async () => {
    if (!locName.trim() || !pin) return
    setSaving(true)
    try {
      const res = await classrepApi.saveLocation({ name: locName, lat: pin.lat, lng: pin.lng, radius_m: radius })
      if (res.data.success) {
        setSavedLocs([{ id: res.data.id, name: locName, lat: pin.lat, lng: pin.lng, radius_m: radius }, ...savedLocs])
        setLocName('')
      } else setError(res.data.message || 'Error saving location.')
    } catch {
      setError('Network error saving location.')
    } finally { setSaving(false) }
  }

  const removeSavedLocation = async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this saved location?')) return
    setDeleting(id)
    try {
      await classrepApi.deleteSavedLocation(id)
      setSavedLocs(savedLocs.filter(l => l.id !== id))
    } catch {
      setError('Failed to delete saved location.')
    } finally { setDeleting(null) }
  }

  const generate = async () => {
    if (!pin) { setError('Please drop a pin on the map first.'); return }
    if (!lecture) { setError('Please select a lecture. Add lecture names on your dashboard first.'); return }
    setError(''); setLoading(true)
    try {
      const { data } = await classrepApi.generateQR({
        lecture_name: lecture, lat: pin.lat, lng: pin.lng, radius_m: radius,
      })
      if (data.success) {
        setSession(data.session)
        const url = await QRCode.toDataURL(
          data.attendance_url || data.session?.attendance_url,
          { width: 500, margin: 2, color: { dark: '#000000', light: '#ffffff' } }
        )
        setQrUrl(url)
        setStep('qr')
      } else setError(data.message || 'Failed to generate QR.')
    } catch (err) {
      setError(err?.response?.data?.message || 'Connection error. Please try again.')
    } finally { setLoading(false) }
  }

  const endSession = async () => {
    if (!session) return
    setEnding(true)
    try {
      await classrepApi.endSession({ session_id: session.id })
      setSession(null); setQrUrl(''); setPin(null)
      setManualLat(''); setManualLng('')
      setPinStatus('idle'); setStep('map')
    } catch { setError('Failed to end session.') }
    finally { setEnding(false) }
  }

  return (
    <div className="animate-fade-up qr-page">
      <PageHeader
        title="Generate Attendance QR"
        subtitle={step === 'map'
          ? 'Pin your classroom on the map, select lecture, then generate QR'
          : 'Show this QR code to your students to mark attendance'}
      />

      {error && <Alert variant="error" onClose={() => setError('')} style={{ marginBottom: 16 }}>{error}</Alert>}

      {/* ── MAP STEP ── */}
      {step === 'map' && (
        <div className="qr-map-step">
          <div className="qr-progress" aria-label="QR session setup progress">
            <div className={`qr-progress-step ${pin ? 'is-complete' : 'is-current'}`}>
              <span className="qr-progress-number">{pin ? <CheckCircle size={16}/> : '1'}</span>
              <span><strong>Set classroom</strong><small>Choose where attendance is taken</small></span>
            </div>
            <span className={`qr-progress-line ${pin ? 'is-complete' : ''}`} />
            <div className={`qr-progress-step ${pin ? 'is-current' : ''}`}>
              <span className="qr-progress-number">2</span>
              <span><strong>Choose lecture</strong><small>Then create the QR code</small></span>
            </div>
          </div>

          <div className="qr-setup-grid">
            <Card className="qr-map-card">
              <div className="qr-card-heading">
                <div>
                  <div className="qr-eyebrow">STEP 1</div>
                  <h2>Set the classroom location</h2>
                  <p>Click the map to place the pin. You can drag it to fine-tune the position.</p>
                </div>
                <Button variant="secondary" size="sm" icon={<Navigation size={15}/>} onClick={autoLocate}>
                  Use my location
                </Button>
              </div>

              {savedLocs.length > 0 && (
                <div className="qr-saved-places">
                  <div className="qr-saved-title"><Bookmark size={15}/> Saved classrooms</div>
                  <div className="qr-saved-list">
                    {savedLocs.map(loc => (
                      <div className="qr-saved-place" key={loc.id}>
                        <button type="button" className="qr-saved-select" onClick={() => applySavedLocation(loc.id)}>
                          <span>{loc.name}</span><small>{loc.radius_m}m radius</small>
                        </button>
                        <button
                          type="button"
                          className="qr-saved-delete"
                          aria-label={`Delete ${loc.name}`}
                          title={`Delete ${loc.name}`}
                          disabled={deleting === loc.id}
                          onClick={e => removeSavedLocation(loc.id, e)}
                        ><Trash2 size={14}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="qr-map-wrap">
                {!mapReady && (
                  <div className="qr-map-loading">
                    <Loader2 size={28} className="animate-spin" style={{ color: 'var(--blue)' }}/>
                    <p>Loading map…</p>
                  </div>
                )}
                <div ref={mapRef} className="qr-map" style={{ opacity: mapReady ? 1 : 0 }} />
                <div className="qr-map-tip"><Crosshair size={14}/> Click to set the attendance point</div>
              </div>

              <div className={`pin-status ${pinStatus === 'set' ? 'ps-ok' : 'ps-wait'}`}>
                {pinStatus === 'set'
                  ? <><CheckCircle size={16}/> Classroom pinned <span>{pin.lat.toFixed(5)}, {pin.lng.toFixed(5)}</span></>
                  : <><MapPin size={16}/> Choose the classroom location on the map to continue</>}
              </div>

              <details className="qr-coordinate-details">
                <summary><span><MapPin size={15}/> Enter coordinates manually</span><ChevronDown size={16}/></summary>
                <p>Use coordinates from Google Maps if you need to place the pin precisely.</p>
                <div className="qr-coordinate-fields">
                  <label>Latitude
                    <input type="number" step="any" placeholder="e.g. 6.688400" value={manualLat} onChange={e => setManualLat(e.target.value)}/>
                  </label>
                  <label>Longitude
                    <input type="number" step="any" placeholder="e.g. -1.624400" value={manualLng} onChange={e => setManualLng(e.target.value)}/>
                  </label>
                  <Button size="sm" onClick={applyManualCoords} icon={<Search size={14}/>}>Set pin</Button>
                </div>
                {coordError && <p className="qr-coordinate-error"><AlertTriangle size={15}/> {coordError}</p>}
              </details>
            </Card>

            <div className="qr-settings-column">
              <Card className="qr-settings-card">
                <div className="qr-card-heading compact">
                  <div>
                    <div className="qr-eyebrow">ATTENDANCE AREA</div>
                    <h2>Set allowed distance</h2>
                    <p>Students must be inside this radius to check in.</p>
                  </div>
                  <Ruler size={21} className="qr-heading-icon"/>
                </div>
                <div className="radius-chips">
                  {RADII.map(r => (
                    <button key={r} type="button" className={`chip ${radius === r ? 'chip-active' : ''}`} aria-pressed={radius === r} onClick={() => setRadius(r)}>{r}m</button>
                  ))}
                </div>
                <div className="qr-radius-note"><Lightbulb size={15}/> Choose a radius that covers the classroom without including nearby buildings.</div>

                {pinStatus === 'set' && (
                  <div className="qr-save-location">
                    <label htmlFor="save-location-name">Save this classroom for next time</label>
                    <div className="qr-save-row">
                      <input id="save-location-name" placeholder="e.g. Lecture Hall C" value={locName} onChange={e => setLocName(e.target.value)}/>
                      <Button size="sm" variant="secondary" loading={saving} onClick={savePreset} disabled={!locName.trim()} icon={<Save size={14}/>}>Save</Button>
                    </div>
                  </div>
                )}
              </Card>

              <Card className={`qr-lecture-card ${pinStatus === 'set' ? 'has-pin' : ''}`}>
                <div className="qr-card-heading compact">
                  <div>
                    <div className="qr-eyebrow">STEP 2</div>
                    <h2>Choose a lecture</h2>
                    <p>Select which class this attendance session is for.</p>
                  </div>
                  <BookOpen size={21} className="qr-heading-icon"/>
                </div>

                {pinStatus !== 'set' ? (
                  <div className="qr-next-step"><MapPin size={17}/><span>Pin your classroom on the map to unlock lecture selection.</span></div>
                ) : savedLectures.length === 0 ? (
                  <div className="qr-no-lectures">
                    <p>No saved lectures yet. Add a lecture under <strong>My Lectures</strong> on your{' '}
                      <Link to="/dashboard">dashboard</Link> before generating attendance.</p>
                  </div>
                ) : (
                  <Select label="Lecture name" id="lecture" value={lecture} onChange={e => setLecture(e.target.value)}>
                    <option value="" disabled>Select a lecture…</option>
                    {savedLectures.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                  </Select>
                )}

                <Button fullWidth loading={loading} onClick={generate} icon={<QrCode size={17}/>} style={{ marginTop: 18 }} size="lg" disabled={pinStatus !== 'set' || !lecture || savedLectures.length === 0}>
                  Generate attendance QR
                </Button>
                <p className="qr-generate-footnote">A new live attendance session will start when you generate the code.</p>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ── QR STEP ── */}
      {step === 'qr' && session && qrUrl && (
        <div className="qr-display-step animate-fade-up">
          <Card className="qr-main-card">
            <div className="qr-top-badges">
              <span className="qr-live-badge"><span className="live-dot"/>Live Session</span>
              <span className="qr-badge-item"><BookOpen size={14} /> {session.lecture_name}</span>
              <span className="qr-badge-item"><Ruler size={14} /> {radius}m radius</span>
              <span className="qr-badge-item"><KeyRound size={14} /> {session.code}</span>
            </div>

            <div className="qr-frame-big">
              <img src={qrUrl} alt="Attendance QR Code" className="qr-img-big"/>
            </div>

            <div className="qr-info-strip">
              <div className="qr-info-item">
                <span className="qr-info-label">Location</span>
                <span className="qr-info-value">{pin?.lat.toFixed(5)}, {pin?.lng.toFixed(5)}</span>
              </div>
              <div className="qr-info-divider"/>
              <div className="qr-info-item">
                <span className="qr-info-label">Lecture</span>
                <span className="qr-info-value">{session.lecture_name}</span>
              </div>
              <div className="qr-info-divider"/>
              <div className="qr-info-item">
                <span className="qr-info-label">Code</span>
                <span className="qr-info-value" style={{ fontFamily: 'monospace', letterSpacing: '0.1em' }}>{session.code}</span>
              </div>
            </div>

            <div className="qr-link-row">
              <input readOnly value={session.attendance_url || ''} className="qr-link-input"/>
              <Button size="sm" onClick={() => navigator.clipboard.writeText(session.attendance_url || '')}>
                Copy Link
              </Button>
            </div>

            <p className="qr-hint">
              Show this QR to your students — they must be within <strong>{radius}m</strong> of your pinned location to mark attendance
            </p>

            <div className="qr-actions">
              <Button
                variant="danger"
                loading={ending}
                onClick={endSession}
                fullWidth
              >
                <CircleStop size={16} /> End Session
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

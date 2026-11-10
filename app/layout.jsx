import '../src/index.css'
import 'leaflet/dist/leaflet.css'

export const metadata = {
  title: 'ClassIQ — Smart Attendance',
  description: 'QR and GPS attendance management, student study tools, and class dashboards for higher education.',
  icons: { icon: '/logo.png' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Montserrat:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}

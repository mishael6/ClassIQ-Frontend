import { Suspense } from 'react'
import App from '../../src/App'

function RouteLoading() {
  return <main className="next-route-loading" aria-label="Loading ClassIQ" />
}

export default function Page() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <App />
    </Suspense>
  )
}

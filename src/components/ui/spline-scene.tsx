'use client'

import { Suspense, lazy, Component, type ReactNode } from 'react'

const Spline = lazy(() => import('@splinetool/react-spline'))

// ─── Error boundary ───────────────────────────────────────────────────────────
class SplineErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) return <Loader />
    return this.props.children
  }
}

function Loader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <span className="loader" />
    </div>
  )
}

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  const isReady =
    scene &&
    scene !== 'YOUR_SPLINE_SCENE_URL_HERE' &&
    scene.startsWith('http') &&
    scene.endsWith('.splinecode')

  if (!isReady) {
    return (
      <div className={`w-full h-full flex items-center justify-center ${className ?? ''}`}>
        <span className="loader" />
      </div>
    )
  }

  return (
    <SplineErrorBoundary>
      <Suspense
        fallback={
          <div className={`w-full h-full flex items-center justify-center ${className ?? ''}`}>
            <span className="loader" />
          </div>
        }
      >
        {/* Wrapper ensures Spline canvas always fills its parent on all screen sizes */}
        <div className="w-full h-full relative overflow-hidden">
          <Spline
            scene={scene}
            style={{ width: '100%', height: '100%' }}
            className={className}
          />
        </div>
      </Suspense>
    </SplineErrorBoundary>
  )
}

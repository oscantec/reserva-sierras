import { lazy, Suspense, useRef } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

const SparklesParticles = lazy(() => import('./SparklesParticles'))

// Load the decorative engine only when its section approaches the viewport.
export function SparklesCore(props) {
    const ref = useRef(null)
    const visible = useInView(ref, { margin: '100px', once: true })
    const reducedMotion = useReducedMotion()
    return (
        <div ref={ref} className={props.className} style={{ width: '100%', height: '100%' }} aria-hidden="true">
            {visible && !reducedMotion && (
                <Suspense fallback={null}>
                    <SparklesParticles {...props} />
                </Suspense>
            )}
        </div>
    )
}

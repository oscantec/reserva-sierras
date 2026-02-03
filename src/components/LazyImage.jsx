import { useState, useEffect, useRef } from 'react'

/**
 * LazyImage - Componente optimizado para carga diferida de imágenes
 * 
 * Características:
 * - Lazy loading nativo del navegador
 * - Placeholder con blur effect mientras carga
 * - Soporte para diferentes tamaños (responsive)
 * - Intersection Observer para cargar solo cuando es visible
 * - Manejo de errores con imagen de fallback
 */

export default function LazyImage({
    src,
    alt,
    className = '',
    placeholder,
    sizes = null,
    srcSet = null,
    priority = false, // Si es true, carga inmediatamente (para LCP images)
    onLoad,
    onError,
    fallback = null,
    ...props
}) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isInView, setIsInView] = useState(priority)
    const [hasError, setHasError] = useState(false)
    const imgRef = useRef(null)
    const observerRef = useRef(null)

    // Intersection Observer para lazy loading manual (fallback)
    useEffect(() => {
        if (priority || isInView) return

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true)
                    observerRef.current?.disconnect()
                }
            },
            {
                rootMargin: '50px', // Start loading 50px before visible
                threshold: 0.01
            }
        )

        if (imgRef.current) {
            observerRef.current.observe(imgRef.current)
        }

        return () => observerRef.current?.disconnect()
    }, [priority])

    const handleLoad = () => {
        setIsLoaded(true)
        onLoad?.()
    }

    const handleError = () => {
        setHasError(true)
        onError?.()
    }

    // Si hay error y hay fallback, mostrar fallback
    if (hasError && fallback) {
        return (
            <div className={`relative overflow-hidden ${className}`} {...props}>
                {fallback}
            </div>
        )
    }

    return (
        <div
            ref={imgRef}
            className={`relative overflow-hidden ${className}`}
            style={{
                backgroundColor: '#e5e7eb', // gray-200
            }}
            {...props}
        >
            {/* Placeholder/Blur while loading */}
            {!isLoaded && placeholder && (
                <img
                    src={placeholder}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover blur-xl scale-110"
                    aria-hidden="true"
                />
            )}

            {/* Skeleton placeholder si no hay placeholder */}
            {!isLoaded && !placeholder && (
                <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 animate-pulse" />
            )}

            {/* Imagen principal */}
            {(isInView || priority) && (
                <img
                    src={src}
                    alt={alt}
                    className={`w-full h-full object-cover transition-all duration-500 ease-out ${
                        isLoaded
                            ? 'opacity-100 blur-0 scale-100'
                            : 'opacity-0 blur-md scale-105'
                    }`}
                    loading={priority ? 'eager' : 'lazy'}
                    fetchPriority={priority ? 'high' : 'auto'}
                    decoding={priority ? 'sync' : 'async'}
                    onLoad={handleLoad}
                    onError={handleError}
                    srcSet={srcSet}
                    sizes={sizes}
                />
            )}
        </div>
    )
}

/**
 * Hook personalizado para lazy loading de componentes pesados
 */
export function useLazyComponent(importFn) {
    const [Component, setComponent] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        let isMounted = true

        importFn()
            .then((mod) => {
                if (isMounted) {
                    setComponent(() => mod.default)
                    setIsLoading(false)
                }
            })
            .catch((err) => {
                if (isMounted) {
                    setError(err)
                    setIsLoading(false)
                }
            })

        return () => {
            isMounted = false
        }
    }, [importFn])

    return { Component, isLoading, error }
}

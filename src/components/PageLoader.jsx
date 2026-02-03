/**
 * PageLoader - Componente de carga para Code Splitting
 * Muestra un spinner mientras se cargan las páginas lazy-loaded
 */

export default function PageLoader() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-green-800 font-medium">Cargando...</p>
            </div>
        </div>
    )
}

/**
 * ErrorBoundary para errores de carga de chunks
 */
export function ChunkErrorFallback({ error, resetErrorBoundary }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Error al cargar la página</h2>
                <p className="text-gray-600 mb-6">
                    {error?.message || 'Hubo un problema al cargar esta sección.'}
                </p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Recargar página
                    </button>
                    <button
                        onClick={resetErrorBoundary}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            </div>
        </div>
    )
}

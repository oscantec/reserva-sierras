import { SparklesCore } from '../components/SparklesCore'

export default function TestSparkles() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
            <div className="relative w-full max-w-4xl h-96 bg-gray-900 rounded-xl overflow-hidden">
                {/* Efecto Sparkles - PERMANENTE */}
                <div className="absolute inset-0 opacity-80">
                    <SparklesCore
                        id="test-sparkles"
                        background="transparent"
                        minSize={0.5}
                        maxSize={1.5}
                        particleDensity={120}
                        className="w-full h-full"
                        particleColor="#3db814"
                        speed={1.0}
                    />
                </div>

                <div className="relative z-10 flex items-center justify-center h-full">
                    <h1 className="text-4xl font-bold text-white">
                        ✨ Test Sparkles ✨
                    </h1>
                </div>
            </div>
        </div>
    )
}

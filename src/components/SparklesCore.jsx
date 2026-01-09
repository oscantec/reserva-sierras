import React, { useId, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion, useAnimation } from "framer-motion";

/**
 * SparklesCore - Componente de partículas animadas para efectos visuales
 * Adaptado de shadcn/ui para React con JavaScript
 */
export const SparklesCore = ({
    id,
    className = "",
    background = "transparent",
    minSize = 0.6,
    maxSize = 1.4,
    speed = 1,
    particleColor = "#FFFFFF",
    particleDensity = 100
}) => {
    const [init, setInit] = useState(false);
    const [error, setError] = useState(null);
    const controls = useAnimation();
    const generatedId = useId();

    useEffect(() => {
        console.log('🎨 SparklesCore: Iniciando...', { id: id || generatedId });

        initParticlesEngine(async (engine) => {
            try {
                await loadSlim(engine);
                console.log('✅ SparklesCore: Engine cargado exitosamente');
            } catch (err) {
                console.error('❌ SparklesCore: Error cargando engine:', err);
                setError(err);
            }
        }).then(() => {
            console.log('✅ SparklesCore: Inicialización completa');
            setInit(true);
        }).catch((err) => {
            console.error('❌ SparklesCore: Error en inicialización:', err);
            setError(err);
        });
    }, []);

    const particlesLoaded = async (container) => {
        if (container) {
            console.log('✅ SparklesCore: Partículas cargadas', { id: id || generatedId });
            controls.start({
                opacity: 1,
                transition: {
                    duration: 1,
                },
            });
        }
    };

    if (error) {
        console.error('❌ SparklesCore: Renderizando con error:', error);
        return null;
    }

    if (!init) {
        console.log('⏳ SparklesCore: Esperando inicialización...');
        return null;
    }

    console.log('🎨 SparklesCore: Renderizando partículas', {
        id: id || generatedId,
        particleDensity,
        particleColor,
        speed
    });

    return (
        <motion.div
            animate={controls}
            initial={{ opacity: 0 }}
            className={className}
            style={{ width: '100%', height: '100%' }}
        >
            <Particles
                id={id || generatedId}
                className="h-full w-full"
                particlesLoaded={particlesLoaded}
                options={{
                    background: {
                        color: {
                            value: background,
                        },
                    },
                    fullScreen: {
                        enable: false,
                        zIndex: 1,
                    },
                    fpsLimit: 120,
                    interactivity: {
                        events: {
                            onClick: {
                                enable: true,
                                mode: "push",
                            },
                            onHover: {
                                enable: false,
                                mode: "repulse",
                            },
                            resize: true,
                        },
                        modes: {
                            push: {
                                quantity: 4,
                            },
                            repulse: {
                                distance: 200,
                                duration: 0.4,
                            },
                        },
                    },
                    particles: {
                        color: {
                            value: particleColor,
                        },
                        move: {
                            direction: "none",
                            enable: true,
                            outModes: {
                                default: "out",
                            },
                            random: false,
                            speed: {
                                min: 0.1,
                                max: speed,
                            },
                            straight: false,
                        },
                        number: {
                            density: {
                                enable: true,
                                width: 400,
                                height: 400,
                            },
                            value: particleDensity,
                        },
                        opacity: {
                            value: {
                                min: 0.1,
                                max: 1,
                            },
                            animation: {
                                enable: true,
                                speed: speed || 4,
                                sync: false,
                                mode: "auto",
                                startValue: "random",
                            },
                        },
                        shape: {
                            type: "circle",
                        },
                        size: {
                            value: {
                                min: minSize,
                                max: maxSize,
                            },
                        },
                    },
                    detectRetina: true,
                }}
            />
        </motion.div>
    );
};


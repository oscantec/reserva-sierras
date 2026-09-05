import React, { useId, useEffect, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { motion, useAnimation, useReducedMotion } from "framer-motion";

let enginePromise;
const initializeEngine = () => {
    if (!enginePromise) {
        enginePromise = initParticlesEngine(engine => loadSlim(engine)).catch(error => {
            enginePromise = undefined;
            throw error;
        });
    }
    return enginePromise;
};

/**
 * SparklesCore - Componente de partículas animadas para efectos visuales
 * Adaptado de shadcn/ui para React con JavaScript
 */
export default function SparklesParticles({
    id,
    className = "",
    background = "transparent",
    minSize = 0.6,
    maxSize = 1.4,
    speed = 1,
    particleColor = "#FFFFFF",
    particleDensity = 100
}) {
    const [init, setInit] = useState(false);
    const [error, setError] = useState(null);
    const controls = useAnimation();
    const generatedId = useId();
    const reducedMotion = useReducedMotion();

    useEffect(() => {
        if (reducedMotion) return;
        let active = true;
        initializeEngine()
            .then(() => { if (active) setInit(true); })
            .catch(err => { if (active) setError(err); });
        return () => { active = false; };
    }, [reducedMotion]);

    const particlesLoaded = async (container) => {
        if (container) {
            controls.start({
                opacity: 1,
                transition: {
                    duration: 1,
                },
            });
        }
    };

    if (error || !init || reducedMotion) return null;

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
                    fpsLimit: 40,
                    pauseOnBlur: true,
                    pauseOnOutsideViewport: true,
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

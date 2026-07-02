import React from 'react'

/**
 * PageHeader component to standardize the look of all pages.
 * 
 * @param {string} title - Main title of the page
 * @param {string} subtitle - Subtitle or description
 * @param {number} currentStep - Current step number (optional)
 * @param {number} totalSteps - Total number of steps (optional)
 * @param {string} stepLabel - Label for the current step (optional)
 * @param {number} progress - Progress percentage (0-100) (optional, defaults to calculated if steps provided)
 * @param {string} eyebrow - Optional eyebrow label; activates the premium visual variant
 */
const PageHeader = ({
    title,
    subtitle,
    currentStep,
    totalSteps,
    stepLabel,
    progress,
    eyebrow,
    className = ""
}) => {
    // Calculate progress if steps are provided but progress is not
    const displayProgress = progress !== undefined
        ? progress
        : (currentStep && totalSteps ? (currentStep / totalSteps) * 100 : 100)

    // Visual-only variant: premium design system styles when an eyebrow is provided
    const premium = Boolean(eyebrow)

    return (
        <div className={`flex flex-col gap-3 w-full ${className}`}>
            <div className="flex justify-between items-end">
                <div className="flex-1">
                    {eyebrow && (
                        <p className="eyebrow mb-2">{eyebrow}</p>
                    )}
                    <h1 className={premium
                        ? "font-premium-display text-premium-forest text-3xl md:text-4xl leading-tight tracking-tight mb-2 text-balance"
                        : "text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-2 dark:text-white"}>
                        {title}
                    </h1>
                    <p className={premium
                        ? "font-premium-body text-premium-ink/60 text-base"
                        : "text-text-subtitle dark:text-text-subtitle-dark text-base"}>
                        {subtitle}
                    </p>
                </div>

                {(currentStep || stepLabel) && (
                    <div className="text-right hidden sm:block ml-4">
                        {currentStep && totalSteps && (
                            premium ? (
                                <p className="text-sm text-premium-ink/60">
                                    Paso <span className="font-semibold text-premium-forest">{currentStep}</span> de <span className="font-semibold text-premium-forest">{totalSteps}</span>
                                </p>
                            ) : (
                                <p className="text-sm font-bold text-primary">
                                    Paso {currentStep} de {totalSteps}
                                </p>
                            )
                        )}
                        {stepLabel && (
                            <p className={premium ? "text-xs text-premium-ink/50" : "text-xs text-text-muted dark:text-text-muted"}>
                                {stepLabel}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className={`h-1.5 w-full rounded-full mt-2 relative overflow-hidden ${premium ? "bg-premium-sand" : "bg-gray-100 dark:bg-border-card-dark"}`}>
                <div
                    className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${premium ? "bg-premium-gold ease-premium" : "bg-[#3db814] ease-in-out shadow-[0_0_8px_rgba(61,184,20,0.3)]"}`}
                    style={{ width: `${displayProgress}%` }}
                ></div>
            </div>
        </div>
    )
}

export default PageHeader

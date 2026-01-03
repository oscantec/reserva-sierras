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
 */
const PageHeader = ({
    title,
    subtitle,
    currentStep,
    totalSteps,
    stepLabel,
    progress,
    className = ""
}) => {
    // Calculate progress if steps are provided but progress is not
    const displayProgress = progress !== undefined
        ? progress
        : (currentStep && totalSteps ? (currentStep / totalSteps) * 100 : 100)

    return (
        <div className={`flex flex-col gap-3 w-full ${className}`}>
            <div className="flex justify-between items-end">
                <div className="flex-1">
                    <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-[-0.033em] mb-2 dark:text-white">
                        {title}
                    </h1>
                    <p className="text-text-subtitle dark:text-text-subtitle-dark text-base">
                        {subtitle}
                    </p>
                </div>

                {(currentStep || stepLabel) && (
                    <div className="text-right hidden sm:block ml-4">
                        {currentStep && totalSteps && (
                            <p className="text-sm font-bold text-primary">
                                Paso {currentStep} de {totalSteps}
                            </p>
                        )}
                        {stepLabel && (
                            <p className="text-xs text-text-muted dark:text-text-muted">
                                {stepLabel}
                            </p>
                        )}
                    </div>
                )}
            </div>

            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-border-card-dark mt-2 relative overflow-hidden">
                <div
                    className="absolute top-0 left-0 h-full bg-[#3db814] rounded-full transition-all duration-500 ease-in-out shadow-[0_0_8px_rgba(61,184,20,0.3)]"
                    style={{ width: `${displayProgress}%` }}
                ></div>
            </div>
        </div>
    )
}

export default PageHeader

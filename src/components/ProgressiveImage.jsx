import { useState } from 'react';

export default function ProgressiveImage({
    src,
    placeholder,
    alt,
    className = '',
    style = {},
    loading = 'lazy',
    ...props
}) {
    const [isLoaded, setIsLoaded] = useState(false);

    // If no placeholder is provided, render a standard image
    if (!placeholder) {
        return (
            <img
                src={src}
                alt={alt}
                className={className}
                style={style}
                loading={loading}
                {...props}
            />
        );
    }

    return (
        <div className={`relative overflow-hidden ${className}`} style={style}>
            {/* 
              Placeholder: drives the layout initially? 
              Actually, usually we want the placeholder to be absolute if the main image is the content.
              But to prevent layout shift, something must have dimensions.
              Let's make the placeholder absolute and the main image relative. 
              The main image might be 0x0 until loaded.
              Alternatively, use the placeholder as the relative element to set size.
              But 20x20 scaled up might look weird if aspect ratio differs slightly (which it shouldn't).
            */}

            {/* Placeholder (Lazy blurry version) - Absolute generally works best if we have separate aspect ratio container.
                If not, we can use the placeholder to set the size.
            */}
            <img
                src={placeholder}
                alt={alt || ''}
                aria-hidden="true"
                className="w-full h-full object-cover blur-lg scale-110 absolute inset-0 z-0"
            />

            {/* Main Image - Relative to sit on top (or we make this absolute too if we had a container) 
                Actually, let's keep the main image relative so IT defines the final size if possible. 
                But before load, it has 0 size.
                So we need a container.
                
                Let's go with: Main image is relative. Placeholder is absolute.
                BUT we add min-height or aspect-ratio if we knew it.
                Since we don't, we might experience layout shift unless we use the placeholder to set size.
                
                Let's try: Placeholder is relative. Main image is absolute inset-0.
                When main loads, it fades in.
            */}
            <img
                {...props}
                src={src}
                alt={alt}
                loading={loading}
                onLoad={() => setIsLoaded(true)}
                className={`relative z-10 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
            />
        </div>
    );
}

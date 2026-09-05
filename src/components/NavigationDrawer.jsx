import { useEffect, useId, useRef } from 'react'

// A native modal traps focus and restores it to the opening control on close.
export default function NavigationDrawer({ open, onClose, title = 'Menú', children }) {
    const dialogRef = useRef(null)
    const titleId = useId()

    useEffect(() => {
        const dialog = dialogRef.current
        if (!open) {
            if (dialog.open) dialog.close()
            return
        }
        dialog.showModal()
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = previousOverflow
            if (dialog.open) dialog.close()
        }
    }, [open])

    return (
        <dialog ref={dialogRef} className="navigation-drawer" aria-labelledby={titleId}
            onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
            <div className="navigation-drawer__content">
                <div className="flex items-center justify-between gap-4 mb-6">
                    <h2 id={titleId} className="text-xl font-semibold tracking-tight">{title}</h2>
                    <button type="button" onClick={onClose} className="ui-icon-button" aria-label="Cerrar menú" autoFocus>
                        <span className="material-symbols-outlined" aria-hidden="true">close</span>
                    </button>
                </div>
                {children}
            </div>
        </dialog>
    )
}

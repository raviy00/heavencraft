import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import AuthCard from './AuthCard'

export default function AuthModal({ isOpen, onClose, initialView = 'login' }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!mounted || !isOpen) return null

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-3 md:p-4 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
                style={{ animation: 'fadeIn 0.2s ease-out' }}
            />

            {/* Modal Container */}
            <div className="relative z-10 w-full max-w-4xl flex flex-col items-center my-auto">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute -top-10 right-0 text-white/60 hover:text-white transition-colors p-2"
                    aria-label="Close"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '1.75rem' }}>close</span>
                </button>

                {/* The Auth Card */}
                <AuthCard initialView={initialView} onAuthSuccess={onClose} />
            </div>
        </div>,
        document.body
    )
}

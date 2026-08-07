import React from 'react';
import { Globe } from 'lucide-react';

/**
 * Props for the LanguageSwitcher component.
 */
interface LanguageSwitcherProps {
    /** The current active language code */
    currentLang: 'en' | 'vi';
    /** Label to display next to the icon (e.g., "Language") */
    label: string;
}

/**
 * A client-side component to toggle between English and Vietnamese.
 * Updates the URL and redirects to the new locale path.
 */
export function LanguageSwitcher({ currentLang, label }: LanguageSwitcherProps) {
    const toggleLanguage = () => {
        const pathname = window.location.pathname;
        const searchParams = window.location.search;
        // Split and remove empty strings to handle leading slashes correctly
        const segments = pathname.split('/').filter(Boolean);
        const newLang = currentLang === 'en' ? 'vi' : 'en';

        console.log('[LanguageSwitcher] Toggling from', currentLang, 'to', newLang);
        console.log('[LanguageSwitcher] Current segments:', segments);

        // Check if the first segment is the current language
        if (segments.length > 0 && segments[0] === currentLang) {
            segments[0] = newLang;
            const newPath = `/${segments.join('/')}${searchParams}`;
            console.log('[LanguageSwitcher] New path:', newPath);
            window.location.href = newPath;
        } else if (segments.length === 0 || (segments[0] !== 'en' && segments[0] !== 'vi')) {
            // Root or non-localized path -> prefix with new lang
            const newPath = `/${newLang}${pathname === '/' ? '' : pathname}${searchParams}`;
            console.log('[LanguageSwitcher] New path (prefixing):', newPath);
            window.location.href = newPath;
        } else {
            // Fallback: If first segment is THE OTHER language (mismatch prop?), swap it anyway.
            if (segments[0] === 'en' || segments[0] === 'vi') {
                segments[0] = newLang;
                const newPath = `/${segments.join('/')}${searchParams}`;
                window.location.href = newPath;
            }
        }
    }

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-violet-500/30 transition-all text-sm text-slate-300 font-medium cursor-pointer"
            aria-label={`Switch to ${currentLang === 'en' ? 'Vietnamese' : 'English'}`}
        >
            <Globe className="w-4 h-4 text-violet-400" />
            <span>{label}: <span className="text-white font-bold">{currentLang.toUpperCase()}</span></span>
        </button>
    )
}

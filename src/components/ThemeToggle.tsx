'use client';

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

function setThemeCookie(theme: string) {
    document.cookie = `theme=${theme};path=/;max-age=31536000;Secure;SameSite=Lax`; // 1 year
}

export function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Read initial theme from the HTML attribute (set by server)
        const currentTheme = document.documentElement.getAttribute('data-theme');
        setIsDark(currentTheme === 'gnosisDark');
    }, []);

    const handleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        const theme = isChecked ? 'gnosisDark' : 'gnosis';
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', theme);
        }
        setIsDark(isChecked);
        setThemeCookie(theme);
    };

    return (
        <label className="swap swap-rotate">
            <input 
                type="checkbox" 
                className="theme-controller" 
                value="gnosisDark" 
                checked={isDark}
                onChange={handleToggle}
            />

            <Sun className="swap-off h-5 w-5 fill-current" />
            <Moon className="swap-on h-5 w-5 fill-current" />
        </label>
    );
}


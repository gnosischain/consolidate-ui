import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {

    return (
        <label className="swap swap-rotate">
            <input type="checkbox" className="theme-controller" value="gnosisDark" />

            <Sun className="swap-off h-5 w-5 fill-current" />
            <Moon className="swap-on h-5 w-5 fill-current" />
        </label>
    );
}


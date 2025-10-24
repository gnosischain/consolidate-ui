import { useState } from "react";

export function useViewTransition<T extends string>(initialView: T) {
    const [currentView, setCurrentView] = useState<T>(initialView);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const changeView = (view: T) => {
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentView(view);
            setIsTransitioning(false);
        }, 150);
    };

    const resetView = () => {
        setCurrentView(initialView);
        setIsTransitioning(false);
    };

    return {
        currentView,
        isTransitioning,
        changeView,
        resetView,
    };
}


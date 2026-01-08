import { createContext, useContext, useRef, useState, ReactNode, useCallback, useMemo } from "react";
import { ArrowLeft } from "lucide-react";

interface ModalContextType {
    openModal: (content: ReactNode, options?: { className?: string }) => void;
    closeModal: () => void;
    goBack: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [stack, setStack] = useState<ReactNode[]>([]);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [modalClassName, setModalClassName] = useState<string>('');

    const openModal = useCallback((content: ReactNode, options?: { className?: string }) => {
        setIsTransitioning(true);
        setStack(prev => [...prev, content]);
        setModalClassName(options?.className || '');
        if (dialogRef.current && !dialogRef.current.classList.contains('modal-open')) {
            dialogRef.current.classList.add('modal-open');
        }
        setTimeout(() => setIsTransitioning(false), 100);
    }, []);

    const closeModal = useCallback(() => {
        setStack([]);
        setModalClassName('');
        if (dialogRef.current) {
            dialogRef.current.classList.remove('modal-open');
        }
        setIsTransitioning(false);
    }, []);

    const goBack = useCallback(() => {
        setIsTransitioning(true);
        setStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
        setTimeout(() => setIsTransitioning(false), 100);
    }, []);

    const currentContent = stack[stack.length - 1];
    const showBackButton = stack.length > 1;

    const contextValue = useMemo(() => ({ openModal, closeModal, goBack }), [openModal, closeModal, goBack]);

    return (
        <ModalContext.Provider value={contextValue}>
            {children}
            <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
                <div className={`modal-box ${modalClassName}`}>
                    {showBackButton && (
                        <button
                            onClick={goBack}
                            className="btn btn-ghost btn-sm"
                        >
                            <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                    )}
                    <div
                        key={stack.length}
                        className={`transition-all duration-100 ease-in-out ${isTransitioning ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'}`}>
                        {currentContent}
                    </div>
                </div>
                <div className="modal-backdrop" onClick={closeModal}>
                </div>
            </dialog>
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
}


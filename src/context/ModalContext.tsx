import { createContext, useContext, useRef, useState, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

interface ModalContextType {
    openModal: (content: ReactNode) => void;
    closeModal: () => void;
    goBack: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [stack, setStack] = useState<ReactNode[]>([]);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const openModal = (content: ReactNode) => {
        setIsTransitioning(true);
        setStack(prev => [...prev, content]);
        if (dialogRef.current && !dialogRef.current.classList.contains('modal-open')) {
            dialogRef.current.classList.add('modal-open');
        }
        setTimeout(() => setIsTransitioning(false), 100);
    };

    const closeModal = () => {
        setStack([]);
        if (dialogRef.current) {
            dialogRef.current.classList.remove('modal-open');
        }
        setIsTransitioning(false);
    };

    const goBack = () => {
        setIsTransitioning(true);
        setStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
        setTimeout(() => setIsTransitioning(false), 100);
    };

    const currentContent = stack[stack.length - 1];
    const showBackButton = stack.length > 1;

    return (
        <ModalContext.Provider value={{ openModal, closeModal, goBack }}>
            {children}
            <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
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


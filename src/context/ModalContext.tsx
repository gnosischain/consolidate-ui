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

    const openModal = (content: ReactNode) => {
        setStack(prev => [...prev, content]);
        if (!dialogRef.current?.open) {
            dialogRef.current?.showModal();
        }
    };

    const closeModal = () => {
        setStack([]);
        dialogRef.current?.close();
    };

    const goBack = () => {
        setStack(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
    };

    const currentContent = stack[stack.length - 1];
    const showBackButton = stack.length > 1;

    return (
        <ModalContext.Provider value={{ openModal, closeModal, goBack }}>
            {children}
            <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle" onClose={() => setStack([])}>
                <div className="modal-box">
                    {showBackButton && (
                        <button
                            onClick={goBack}
                            className="btn btn-ghost btn-sm btn-circle absolute left-2 top-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                    )}
                    {currentContent}
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
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


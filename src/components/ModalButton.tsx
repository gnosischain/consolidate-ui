import { useRef } from "react";

interface ModalButtonProps {
    title?: string;
    trigger?: (openModal: () => void) => React.ReactNode;
    children: React.ReactNode;
}

export default function ModalButton({ title, trigger, children }: ModalButtonProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    const openModal = () => {
        dialogRef.current?.showModal();
    };

    return (
        <>
            {trigger ? (
                trigger(openModal)
            ) : (
                <button
                    className="btn btn-primary"
                    onClick={openModal}
                >{title}
                </button>
            )}
            <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
                <div className="modal-box">
                    {children}
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </>
    );
}
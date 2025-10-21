import { useRef } from "react";

interface ModalButtonProps {
    title: string;
    children: React.ReactNode;
}

export default function ModalButton({ title, children }: ModalButtonProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    return (
        <>
            <button
                className="btn btn-primary"
                onClick={() => dialogRef.current?.showModal()}
            >{title}
            </button>
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
import { Check, Copy } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };
    return (
        <button
            onClick={handleCopy}
            className="btn btn-xs btn-ghost btn-circle opacity-30"
            title="Copy address"
        >
            {copied ? (
                <Check className="w-4 h-4" />
            ) : (
                <Copy className="w-4 h-4" />
            )}
        </button>
    );
}
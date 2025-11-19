import { useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";

const CopyCodeButton = ({ code }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error("Failed to copy code:", err);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 rounded bg-[var(--color-hover-bg)] border border-[var(--color-active-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent-primary)] hover:border-[var(--color-accent-primary)] transition-all duration-200 opacity-0 group-hover:opacity-100"
            aria-label="Copy code to clipboard"
            type="button"
        >
            {copied ? (
                <FiCheck className="w-4 h-4 text-[var(--color-syntax-string)]" />
            ) : (
                <FiCopy className="w-4 h-4" />
            )}
        </button>
    );
};

export default CopyCodeButton;

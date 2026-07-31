import type { LucideIcon } from 'lucide-react';

interface DialogIconProps {
    icon: LucideIcon;
    variant?: 'default' | 'destructive';
}

export function DialogIcon({ icon: Icon, variant = 'default' }: DialogIconProps) {
    return (
        <span
            className={`flex size-10 items-center justify-center rounded-md border ${
                variant === 'destructive' ? 'text-destructive' : ''
            }`}
        >
            <Icon className="size-5" />
        </span>
    );
}

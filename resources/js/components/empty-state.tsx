import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description?: string;
    bordered?: boolean;
    className?: string;
}

export function EmptyState({ icon: Icon, title, description, bordered = true, className }: EmptyStateProps) {
    return (
        <div
            className={cn(
                'mx-auto flex max-w-4xl flex-col items-center justify-center gap-2 rounded-md py-16 text-center',
                bordered && 'border border-dashed',
                className,
            )}
        >
            <Icon className="text-muted-foreground/50 size-8" />
            <p className="text-muted-foreground text-sm">{title}</p>
            {description && <p className="text-muted-foreground text-xs">{description}</p>}
        </div>
    );
}

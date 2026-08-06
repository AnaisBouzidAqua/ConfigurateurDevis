import { cn } from '@/lib/utils';

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <h2 className={cn('text-foreground text-[16px] font-bold leading-[140%] tracking-normal', className)}>
            {children}
        </h2>
    );
}


export function SubSectionTitle({ children }: { children: React.ReactNode }) {
    return <h3 className="text-label text-[14px] font-bold leading-[20px] tracking-normal">{children}</h3>;
}

import { usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import type { AppVariant } from '@/types';

type Props = {
    children: ReactNode;
    variant?: AppVariant;
};

export function AppShell({ children, variant = 'sidebar' }: Props) {
    const { props, url } = usePage();
    const isOpen = props.sidebarOpen;
    const isFranchise = url.startsWith('/devis') || url.startsWith('/parametres');

    if (variant === 'header') {
        return (
            <div className="flex min-h-screen w-full flex-col">{children}</div>
        );
    }

    return (
        <SidebarProvider
            defaultOpen={isOpen}
            style={
                !isFranchise
                    ? ({
                          '--color-sidebar': 'var(--muted-foreground)',
                          '--color-sidebar-accent': 'var(--label)',
                      } as React.CSSProperties)
                    : undefined
            }
        >
            {children}
        </SidebarProvider>
    );
}

import { Link } from '@inertiajs/react';
import {Euro, Folder, Settings} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { useIsFranchise } from '@/hooks/use-is-franchise';
import type { NavItem } from '@/types';

const adminNavItems: NavItem[] = [
    {
        title: 'Scénarios',
        href: '/admin/scenarios',
        icon: Euro,
    },
];

const franchiseNavItems: NavItem[] = [
    { title: 'Configurateur', href: '/devis/create', icon: Euro },
    { title: 'Historique des chiffrages', href: '/devis', icon: Folder},
    { title: 'Paramètres', href: '/parametres', icon: Settings },
];

export function AppSidebar() {
    const isFranchise = useIsFranchise();
    const mainNavItems = isFranchise ? franchiseNavItems : adminNavItems;
    const homeHref = isFranchise ? '/devis/create' : '/admin/scenarios';

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            style={
                !isFranchise
                    ? ({
                          '--color-sidebar': 'var(--muted-foreground)',
                          '--color-sidebar-accent': 'var(--label)',
                      } as React.CSSProperties)
                    : undefined
            }
        >
            <SidebarHeader className="flex-row items-center justify-between pr-0">
                <SidebarMenu className="group-data-[collapsible=icon]:hidden">
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={homeHref} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                <SidebarTrigger />
            </SidebarHeader>

            <SidebarContent className="mt-16">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}

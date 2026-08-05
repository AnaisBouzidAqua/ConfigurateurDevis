import { Link, usePage } from '@inertiajs/react';
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
import type { NavItem } from '@/types';

const adminNavItems: NavItem[] = [
    {
        title: 'Scénarios',
        href: '/admin/scenarios',
        icon: Euro,
    },
];

// "Historique des chiffrages" et "Paramètres" pointent vers /devis/create
// en attendant que ces écrans existent — à corriger une fois construits.
const franchiseNavItems: NavItem[] = [
    { title: 'Configurateur', href: '/devis/create', icon: Euro },
    { title: 'Historique des chiffrages', href: '/devis/create', icon: Folder},
    { title: 'Paramètres', href: '/devis/create', icon: Settings },
];

export function AppSidebar() {
    const { url } = usePage();
    const isFranchise = url.startsWith('/devis');
    const mainNavItems = isFranchise ? franchiseNavItems : adminNavItems;
    const homeHref = isFranchise ? '/devis/create' : '/admin/scenarios';

    return (
        <Sidebar collapsible="icon" variant="inset">
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

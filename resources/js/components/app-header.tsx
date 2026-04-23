import { Link, usePage } from '@inertiajs/react';
import {
    Bell,
    Briefcase,
    Calendar,
    ChevronDown,
    ClipboardList,
    Hammer,
    Home,
    List,
    LogIn,
    Menu,
    MessageSquare,
    Plus,
    UserPlus,
    Wallet,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/components/ui/sheet';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { dashboard, find, home } from '@/routes';
import type { BreadcrumbItem, NavItem, User } from '@/types';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const publicNavItems: NavItem[] = [
    { title: 'Home', href: home(), icon: Home },
    { title: 'Vind klusjes', href: find(), icon: List },
];

interface MyZakenItem {
    title: string;
    href: string;
    icon: typeof Hammer;
    description: string;
}

const myZakenItems: MyZakenItem[] = [
    {
        title: 'Mijn klusjes',
        href: '/my/klusjes',
        icon: Hammer,
        description: 'Klusjes die jij hebt geplaatst',
    },
    {
        title: 'Mijn biedingen',
        href: '/my/offers',
        icon: ClipboardList,
        description: 'Klusjes waar jij je op aanmeldde',
    },
];

const activeItemStyles = 'text-orange-600 font-semibold';

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth, unreadConversationsCount, unreadNotificationsCount, userBalance } =
        page.props as unknown as {
            auth: { user: User | null };
            unreadConversationsCount: number;
            unreadNotificationsCount: number;
            userBalance: string | null;
        };
    const getInitials = useInitials();
    const { isCurrentUrl, whenCurrentUrl } = useCurrentUrl();

    const authedNavItems: NavItem[] = [
        { title: 'Dashboard', href: dashboard(), icon: Calendar },
        { title: 'Vind klusjes', href: find(), icon: List },
        { title: 'Berichten', href: '/conversations', icon: MessageSquare },
    ];

    const mainNavItems: NavItem[] = auth?.user ? authedNavItems : publicNavItems;
    const logoHref = auth?.user ? dashboard() : home();
    const myZakenActive = myZakenItems.some((i) => isCurrentUrl(i.href));

    return (
        <>
            <div className="sticky top-0 z-40 border-b border-sidebar-border/80 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="mr-2 h-[34px] w-[34px] hover:text-orange-600"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent
                                side="left"
                                className="flex h-full w-72 flex-col items-stretch bg-white"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation Menu
                                </SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="h-8 w-8 fill-current text-orange-500" />
                                </SheetHeader>
                                <div className="mt-2 flex flex-1 flex-col gap-1 p-2">
                                    {mainNavItems.map((item) => (
                                        <MobileNavLink
                                            key={item.title}
                                            item={item}
                                            active={isCurrentUrl(item.href)}
                                            badgeCount={
                                                item.title === 'Berichten'
                                                    ? unreadConversationsCount
                                                    : undefined
                                            }
                                        />
                                    ))}
                                    {auth?.user && (
                                        <>
                                            <div className="mt-3 px-3 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                                                Mijn zaken
                                            </div>
                                            {myZakenItems.map((item) => (
                                                <MobileNavLink
                                                    key={item.title}
                                                    item={{
                                                        title: item.title,
                                                        href: item.href,
                                                        icon: item.icon,
                                                    }}
                                                    active={isCurrentUrl(item.href)}
                                                />
                                            ))}
                                        </>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Logo */}
                    <Link
                        href={logoHref}
                        prefetch
                        className="flex items-center space-x-2 transition-transform hover:scale-105"
                    >
                        <AppLogo />
                    </Link>

                    {/* Desktop nav */}
                    <div className="ml-8 hidden h-full items-center lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch gap-1">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                whenCurrentUrl(item.href, activeItemStyles),
                                                'h-10 cursor-pointer rounded-full bg-transparent px-4 text-neutral-600 transition-colors hover:bg-orange-50 hover:text-orange-600',
                                            )}
                                        >
                                            {item.icon && (
                                                <item.icon className="mr-2 h-4 w-4" />
                                            )}
                                            {item.title}
                                            {item.title === 'Berichten' &&
                                                unreadConversationsCount > 0 && (
                                                    <Badge className="ml-2 rounded-full bg-orange-500 px-1.5 py-0 text-[10px] text-white hover:bg-orange-600">
                                                        {unreadConversationsCount}
                                                    </Badge>
                                                )}
                                        </Link>
                                        {isCurrentUrl(item.href) && (
                                            <div className="absolute bottom-0 left-2 right-2 h-[3px] rounded-t-md bg-orange-500" />
                                        )}
                                    </NavigationMenuItem>
                                ))}

                                {auth?.user && (
                                    <NavigationMenuItem className="relative flex h-full items-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    className={cn(
                                                        'h-10 cursor-pointer rounded-full bg-transparent px-4 text-sm font-medium text-neutral-600 transition-colors hover:bg-orange-50 hover:text-orange-600',
                                                        myZakenActive && activeItemStyles,
                                                    )}
                                                >
                                                    <Briefcase className="mr-2 h-4 w-4" />
                                                    Mijn zaken
                                                    <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-70" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent
                                                align="start"
                                                className="w-64 rounded-2xl p-2"
                                            >
                                                {myZakenItems.map((item) => (
                                                    <DropdownMenuItem
                                                        key={item.title}
                                                        asChild
                                                        className="cursor-pointer rounded-xl focus:bg-orange-50 focus:text-orange-700"
                                                    >
                                                        <Link href={item.href} className="flex items-start gap-3 p-2">
                                                            <div className="mt-0.5 rounded-lg bg-orange-50 p-1.5 text-orange-600">
                                                                <item.icon className="h-4 w-4" />
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-semibold">{item.title}</div>
                                                                <div className="text-xs text-neutral-500">{item.description}</div>
                                                            </div>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        {myZakenActive && (
                                            <div className="absolute bottom-0 left-2 right-2 h-[3px] rounded-t-md bg-orange-500" />
                                        )}
                                    </NavigationMenuItem>
                                )}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    {/* Right side */}
                    <div className="ml-auto flex items-center gap-2">
                        {auth?.user && (
                            <Button
                                className="hidden rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-5 font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-orange-700 active:scale-95 lg:inline-flex"
                                asChild
                            >
                                <Link href="/create">
                                    Post klusje
                                    <Plus className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        )}

                        {auth?.user && userBalance !== null && (
                            <Link
                                href="/my/balance"
                                className="hidden items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-neutral-700 shadow-sm transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700 lg:inline-flex"
                            >
                                <Wallet className="h-4 w-4 text-orange-500" />
                                €{userBalance}
                            </Link>
                        )}

                        {auth?.user && (
                            <Link
                                href="/notifications"
                                className="relative inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-orange-50 hover:text-orange-600"
                                aria-label="Meldingen"
                            >
                                <Bell className="h-5 w-5" />
                                {unreadNotificationsCount > 0 && (
                                    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                                        {unreadNotificationsCount}
                                    </span>
                                )}
                            </Link>
                        )}

                        {auth?.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="size-10 rounded-full p-1 transition-transform hover:scale-105 hover:ring-2 hover:ring-orange-200"
                                    >
                                        <Avatar className="size-8 overflow-hidden rounded-full border border-neutral-200">
                                            <AvatarImage
                                                src={
                                                    auth.user.profile_photo_path
                                                        ? `/storage/${auth.user.profile_photo_path}`
                                                        : auth.user.avatar
                                                }
                                                alt={auth.user.name}
                                            />
                                            <AvatarFallback className="bg-orange-100 font-bold text-orange-700">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 rounded-2xl" align="end">
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="ml-2 rounded-full border-neutral-200 font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-orange-600"
                                    >
                                        Account
                                        <ChevronDown className="ml-1 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44 rounded-2xl">
                                    <DropdownMenuItem
                                        asChild
                                        className="cursor-pointer rounded-xl focus:bg-orange-50 focus:text-orange-700"
                                    >
                                        <Link href="/login">
                                            <LogIn className="mr-2 h-4 w-4" />
                                            Inloggen
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        asChild
                                        className="cursor-pointer rounded-xl focus:bg-orange-50 focus:text-orange-700"
                                    >
                                        <Link href="/register">
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Aanmelden
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            </div>

            {breadcrumbs.length > 1 && (
                <div className="flex w-full border-b border-sidebar-border/50 bg-neutral-50/50">
                    <div className="mx-auto flex h-10 w-full items-center justify-start px-4 text-xs font-medium text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}

function MobileNavLink({
    item,
    active,
    badgeCount,
}: {
    item: NavItem;
    active: boolean;
    badgeCount?: number;
}) {
    return (
        <Link
            href={item.href}
            className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                active
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-orange-600',
            )}
        >
            {item.icon && <item.icon className="h-5 w-5" />}
            <span className="flex-1">{item.title}</span>
            {badgeCount !== undefined && badgeCount > 0 && (
                <Badge className="rounded-full bg-orange-500 px-1.5 py-0 text-[10px] text-white">
                    {badgeCount}
                </Badge>
            )}
        </Link>
    );
}

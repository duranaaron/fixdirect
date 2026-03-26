import { Link, usePage } from '@inertiajs/react';
import {
    Calendar,
    ChevronDown,
    LogIn,
    Menu,
    Home,
    List,
    MessageSquare,
    Plus,
    UserPlus,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useInitials } from '@/hooks/use-initials';
import { cn, toUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { dashboard, find, home } from '@/routes';
import type { BreadcrumbItem, NavItem } from '@/types';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

type Props = {
    breadcrumbs?: BreadcrumbItem[];
};

const rightNavItems: NavItem[] = [];

const activeItemStyles = 'text-orange-600 font-bold';

export function AppHeader({ breadcrumbs = [] }: Props) {
    const page = usePage();
    const { auth, unreadConversationsCount } = page.props;
    const getInitials = useInitials();
    const { isCurrentUrl, whenCurrentUrl } = useCurrentUrl();

    const navItems: NavItem[] = auth?.user
        ? [
              {
                  title: 'Mijn dashboard',
                  href: dashboard(),
                  icon: Home,
              },
              {
                  title: 'Vind klusjes',
                  href: find(),
                  icon: List,
              },
              {
                  title: 'Berichten',
                  href: '/conversations',
                  icon: MessageSquare,
              },
          ]
        : [
              {
                  title: 'Home',
                  href: home(),
                  icon: Home,
              },
              {
                  title: 'Vind klusjes',
                  href: find(),
                  icon: List,
              },
          ];

    return (
        <>
            <div className="sticky top-0 z-50 border-b border-sidebar-border/80 bg-white/80 backdrop-blur-md">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
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
                                className="flex h-full w-64 flex-col items-stretch justify-between bg-white"
                            >
                                <SheetTitle className="sr-only">
                                    Navigation Menu
                                </SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="h-8 w-8 fill-current text-orange-500" />
                                </SheetHeader>
                                <div className="mt-4 flex h-full flex-1 flex-col space-y-4 p-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-2">
                                            {navItems.map((item) => (
                                                <Link
                                                    key={item.title}
                                                    href={item.href}
                                                    className={cn(
                                                        'flex items-center space-x-3 rounded-xl px-3 py-2.5 font-medium transition-colors hover:bg-orange-50 hover:text-orange-600',
                                                        isCurrentUrl(item.href)
                                                            ? 'bg-orange-50 text-orange-600'
                                                            : 'text-neutral-600',
                                                    )}
                                                >
                                                    {item.icon && (
                                                        <item.icon className="h-5 w-5" />
                                                    )}
                                                    <span>{item.title}</span>
                                                    {item.title ===
                                                        'Berichten' &&
                                                        unreadConversationsCount >
                                                            0 && (
                                                            <Badge className="ml-auto rounded-full bg-orange-500 px-2 py-0.5 text-xs text-white">
                                                                {
                                                                    unreadConversationsCount
                                                                }
                                                            </Badge>
                                                        )}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link
                        href={dashboard()}
                        prefetch
                        className="flex items-center space-x-2 transition-transform hover:scale-105"
                    >
                        <AppLogo />
                    </Link>

                    <div className="ml-8 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-1">
                                {navItems.map((item, index) => (
                                    <NavigationMenuItem
                                        key={index}
                                        className="relative flex h-full items-center"
                                    >
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                whenCurrentUrl(
                                                    item.href,
                                                    activeItemStyles,
                                                ),
                                                'h-10 cursor-pointer rounded-full px-4 text-neutral-600 transition-colors hover:bg-orange-50 hover:text-orange-600',
                                            )}
                                        >
                                            {item.icon && (
                                                <item.icon className="mr-2 h-4 w-4" />
                                            )}
                                            {item.title}
                                            {item.title === 'Berichten' &&
                                                unreadConversationsCount >
                                                    0 && (
                                                    <Badge className="ml-2 rounded-full bg-orange-500 px-1.5 py-0 text-[10px] text-white hover:bg-orange-600">
                                                        {
                                                            unreadConversationsCount
                                                        }
                                                    </Badge>
                                                )}
                                        </Link>
                                        {isCurrentUrl(item.href) && (
                                            <div className="absolute bottom-0 left-0 h-[3px] w-full rounded-t-md bg-orange-500"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    <div className="ml-auto flex items-center space-x-3">
                        <div className="relative flex items-center space-x-1">
                            <div className="ml-1 hidden gap-3 lg:flex">
                                <Button
                                    className="rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-5 font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:from-orange-600 hover:to-orange-700 active:scale-95"
                                    asChild
                                >
                                    <Link href="/create">
                                        Post klusje
                                        <Plus className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        {auth?.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="size-10 rounded-full p-1 transition-transform hover:scale-105 hover:ring-2 hover:ring-orange-200"
                                    >
                                        <Avatar className="size-8 overflow-hidden rounded-full border border-neutral-200">
                                            <AvatarImage
                                                src={auth.user.avatar}
                                                alt={auth.user.name}
                                            />
                                            <AvatarFallback className="bg-orange-100 font-bold text-orange-700">
                                                {getInitials(auth.user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    className="w-56 rounded-2xl"
                                    align="end"
                                >
                                    <UserMenuContent user={auth.user} />
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="ml-2 rounded-full border-neutral-200 font-bold text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-orange-600"
                                    >
                                        Account
                                        <ChevronDown className="ml-1 h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-44 rounded-2xl"
                                >
                                    <DropdownMenuItem
                                        asChild
                                        className="cursor-pointer rounded-xl hover:text-orange-600"
                                    >
                                        <Link href="/login">
                                            <LogIn className="mr-2 h-4 w-4" />
                                            Inloggen
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        asChild
                                        className="cursor-pointer rounded-xl hover:text-orange-600"
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

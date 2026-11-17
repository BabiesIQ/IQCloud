import { Link } from 'react-router-dom';
import { useAuth } from '@/layouts/RootLayout';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

 






export default function UserMenu({ user: userProp, initials: initialsProp, displayName: displayNameProp, logout: logoutProp }) {
  const auth = useAuth();
  const user = userProp ?? auth.user;
  const logout = logoutProp ?? auth.logout;
  const displayName =
    displayNameProp ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.emailAddress ||
    'Account';
  const initials =
    initialsProp ||
    displayName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() ||
    'U';
  const profileLabel = String(user?.profile ?? '').replace(/_c$/, '');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full outline-none ring-ring focus-visible:ring-2"
          aria-label="Account menu"
        >
          <Avatar className="size-9">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>
          <p className="text-sm font-medium text-foreground">{displayName}</p>
          {user?.emailAddress && <p className="text-xs text-muted-foreground">{user.emailAddress}</p>}
          {profileLabel && <p className="text-xs text-muted-foreground">{profileLabel}</p>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/change-password">Change password</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>Sign out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

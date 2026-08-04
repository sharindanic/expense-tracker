import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import {
  LayoutDashboard, ChartColumn, Receipt, Wallet,
  Search, Plus, ChevronsLeft, ChevronsRight, ChevronsUp,
  Settings, LogOut, Sun, Moon, CircleUser, Minus, X, Menu,
} from 'lucide-react';
import { categories } from '@/lib/categories';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'budgets', label: 'Budgets', icon: Wallet },
  { id: 'analytics', label: 'Analytics', icon: ChartColumn },
];

// One colour per category, echoing the chain badges in the reference nav.
const CATEGORY_COLORS = {
  food: '#f97316',
  housing: '#8b5cf6',
  utilities: '#0ea5e9',
  transport: '#22c55e',
  entertainment: '#ec4899',
  salary: '#eab308',
  other: '#64748b',
};

const money = (n) => `$${n.toFixed(2)}`;

function Sidebar({
  view,
  onViewChange,
  search,
  onSearchChange,
  category,
  onCategoryChange,
  transactions,
  userEmail,
  onChangePassword,
  onLogout,
  collapsed,
  onCollapsedChange,
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const setCollapsed = onCollapsedChange;
  const [panelOpen, setPanelOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('sidebar:collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  // "/" focuses search, Escape leaves it — same shortcut as the reference.
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        if (searchRef.current) {
          // Already expanded — focus now so the next keystroke isn't dropped.
          searchRef.current.focus();
        } else {
          // Collapsed: the input mounts only once expanded, so wait a frame.
          setCollapsed(false);
          requestAnimationFrame(() => searchRef.current?.focus());
        }
      }
      if (e.key === 'Escape' && document.activeElement === searchRef.current) {
        searchRef.current.blur();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setCollapsed]);

  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + parseFloat(t.amount), 0);

  // Spend per category drives the little amounts beside each colour dot.
  const spendByCategory = transactions.reduce((acc, t) => {
    if (t.type !== 'expense') return acc;
    acc[t.category] = (acc[t.category] || 0) + parseFloat(t.amount);
    return acc;
  }, {});

  const go = (id) => {
    onViewChange(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile trigger — the rail is off-canvas below md */}
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-50 rounded-lg border border-sidebar-border bg-sidebar p-2 text-sidebar-foreground shadow-sm md:hidden"
      >
        <Menu className="size-5" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        data-testid="sidebar"
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width,transform] duration-200',
          collapsed ? 'w-16' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-4',
            collapsed && 'flex-col gap-3 px-0 py-3'
          )}
        >
          <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Wallet className="size-4" />
          </div>
          <h1 className={cn('flex-1 truncate text-sm font-bold tracking-wide', collapsed && 'sr-only')}>
            Spendly
          </h1>
          <button
            type="button"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed(!collapsed)}
            className="hidden rounded p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:block"
          >
            {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          </button>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="rounded p-1 text-muted-foreground hover:bg-sidebar-accent md:hidden"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Search */}
        {!collapsed && (
          <div className="px-3 pb-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => onSearchChange(e.target.value)}
                onFocus={() => view !== 'analytics' && onViewChange('transactions')}
                placeholder="Search"
                aria-label="Search transactions"
                className="h-9 w-full rounded-lg border border-sidebar-border bg-background pl-8 pr-8 text-sm outline-none placeholder:text-muted-foreground focus:border-ring"
              />
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-sidebar-border px-1.5 text-[11px] text-muted-foreground">
                /
              </kbd>
            </div>
          </div>
        )}

        {/* Primary action */}
        <div className={cn('px-3 pb-3', collapsed && 'px-2')}>
          <button
            type="button"
            onClick={() => go('transactions')}
            className={cn(
              'flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-sidebar-accent text-sm font-semibold text-sidebar-accent-foreground hover:brightness-95 dark:hover:brightness-125',
              collapsed && 'px-0'
            )}
            title="New transaction"
          >
            <Plus className="size-4" />
            {!collapsed && 'New Transaction'}
          </button>
        </div>

        {/* Scrollable nav region */}
        <nav className="flex-1 overflow-y-auto overscroll-contain">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
            const active = view === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                aria-current={active ? 'page' : undefined}
                title={collapsed ? label : undefined}
                className={cn(
                  'relative flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                  collapsed && 'justify-center px-0',
                  active
                    ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                )}
              >
                {active && (
                  <span className="absolute inset-y-0 left-0 w-0.5 bg-sidebar-primary dark:bg-sidebar-foreground" />
                )}
                <Icon className="size-[18px] shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </button>
            );
          })}

          <div className="mx-4 my-3 border-t border-sidebar-border" />

          {!collapsed && (
            <p className="px-4 pb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </p>
          )}

          <button
            type="button"
            onClick={() => { onCategoryChange('all'); go('transactions'); }}
            title={collapsed ? 'All categories' : undefined}
            className={cn(
              'relative flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors',
              collapsed && 'justify-center px-0',
              category === 'all'
                ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
            )}
          >
            <span className="size-2.5 shrink-0 rounded-full border border-muted-foreground" />
            {!collapsed && <span className="flex-1 text-left">All</span>}
          </button>

          {categories.map(cat => {
            const active = category === cat;
            const spent = spendByCategory[cat] || 0;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => { onCategoryChange(cat); go('transactions'); }}
                title={collapsed ? cat : undefined}
                className={cn(
                  'relative flex w-full items-center gap-3 px-4 py-2 text-sm capitalize transition-colors',
                  collapsed && 'justify-center px-0',
                  active
                    ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
                )}
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                />
                {!collapsed && (
                  <>
                    <span className="flex-1 truncate text-left">{cat}</span>
                    {spent > 0 && (
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {money(spent)}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {/* Pinned balance panel — the reference keeps a watchlist docked here */}
        {!collapsed && (
          <div className="border-t border-sidebar-border">
            <div className="flex items-center gap-2 px-4 py-2">
              <Wallet className="size-3.5" />
              <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider">
                Balance
              </span>
              <button
                type="button"
                aria-label={panelOpen ? 'Collapse balance panel' : 'Expand balance panel'}
                onClick={() => setPanelOpen(o => !o)}
                className="rounded p-0.5 text-muted-foreground hover:bg-sidebar-accent"
              >
                {panelOpen ? <Minus className="size-3.5" /> : <ChevronsUp className="size-3.5" />}
              </button>
            </div>
            {panelOpen && (
              <dl className="space-y-1 px-4 pb-3 text-xs">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Income</dt>
                  <dd className="tabular-nums text-green-600 dark:text-green-500">{money(income)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Expenses</dt>
                  <dd className="tabular-nums text-red-600 dark:text-red-500">{money(expenses)}</dd>
                </div>
                <div className="flex justify-between border-t border-sidebar-border pt-1 font-medium">
                  <dt>Balance</dt>
                  <dd className="tabular-nums">{money(income - expenses)}</dd>
                </div>
              </dl>
            )}
          </div>
        )}

        {/* Account row */}
        <div
          className={cn(
            'flex items-center gap-2 border-t border-sidebar-border px-3 py-2',
            collapsed && 'justify-center px-0'
          )}
        >
          <CircleUser className="size-5 shrink-0 text-muted-foreground" />
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-xs" title={userEmail}>
                {userEmail || 'Signed in'}
              </span>
              <button
                type="button"
                aria-label="Change password"
                onClick={onChangePassword}
                className="rounded p-1 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Settings className="size-4" />
              </button>
            </>
          )}
        </div>

        {/* Footer utilities */}
        <div
          className={cn(
            'flex items-center gap-1 border-t border-sidebar-border px-3 py-2',
            collapsed && 'flex-col justify-center px-0'
          )}
        >
          <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="rounded p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {resolvedTheme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </button>
          {collapsed && (
            <button
              type="button"
              aria-label="Change password"
              onClick={onChangePassword}
              className="rounded p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              <Settings className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onLogout}
            title="Logout"
            className={cn(
              'ml-auto flex items-center gap-1.5 rounded-lg bg-zinc-500 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-600 dark:bg-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-500',
              collapsed && 'ml-0 px-1.5'
            )}
          >
            <LogOut className="size-4" />
            <span className={cn(collapsed && 'sr-only')}>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;

import { useEffect, useState, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Search, Menu } from 'lucide-react';

const DROPDOWN_CLOSE_DELAY_MS = 220;

interface NavItem {
  label: string;
  to: string;
  children?: { label: string; to: string }[];
}

const navItems: NavItem[] = [
  {
    label: 'About',
    to: '/about',
    children: [
      { label: 'Vision', to: '/about' },
      { label: 'Inspirations', to: '/inspirations' },
      { label: 'Invested Actors', to: '/invested-actors' },
      { label: 'Timeline', to: '/timeline' },
    ],
  },
  {
    label: 'Pathways',
    to: '/pathways',
    children: [
      { label: 'Pathway objectives', to: '/pathways' },
      { label: 'Pathway storylines', to: '/pathway-storylines' },
    ],
  },
  { label: 'Events', to: '/events' },
  { label: 'News', to: '/news' },
  { label: 'Insights', to: '/insights' },
  { label: 'Contact', to: '/contact' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const { pathname } = useLocation();

  const cancelClose = useCallback(() => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(
    (label?: string) => {
      cancelClose();
      closeTimerRef.current = window.setTimeout(() => {
        setOpenDropdown((current) => {
          if (label && current !== label) return current;
          return null;
        });
        closeTimerRef.current = null;
      }, DROPDOWN_CLOSE_DELAY_MS);
    },
    [cancelClose]
  );

  const openMenu = useCallback(
    (label: string) => {
      cancelClose();
      setOpenDropdown(label);
    },
    [cancelClose]
  );

  useEffect(() => {
    return () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
        setOpenDropdown(null);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    cancelClose();
  }, [pathname, cancelClose]);

  const isActive = (item: NavItem) =>
    pathname === item.to ||
    (item.children?.some((c) => c.to === pathname) ?? false);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          height: scrolled ? '64px' : '76px',
          backgroundColor: 'rgba(250, 250, 247, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid #E5E2D9',
          transition: 'height 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          className="h-full flex items-center justify-between"
          style={{ maxWidth: '1440px', margin: '0 auto', padding: '0 48px' }}
        >
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center"
            style={{
              textDecoration: 'none',
              gap: 14,
              flexShrink: 0,
            }}
            aria-label="Resilience Frontiers — home"
          >
            <img
              src="/rf/logo.svg"
              alt="Resilience Frontiers"
              style={{
                height: scrolled ? '30px' : '38px',
                width: 'auto',
                transition: 'height 200ms ease',
                display: 'block',
              }}
            />
            <span
              className="hidden xl:inline"
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '10px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#6B7280',
                whiteSpace: 'nowrap',
                paddingLeft: 14,
                marginLeft: 2,
                borderLeft: '1px solid #6B7280',
              }}
            >
              where.the.future.is.Now.
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-7">
            {navItems.map((item) => {
              const hasChildren = !!item.children;
              const isOpen = openDropdown === item.label;
              return (
                <div
                  key={item.label}
                  style={{ position: 'relative' }}
                  onMouseEnter={() => hasChildren && openMenu(item.label)}
                  onMouseLeave={() =>
                    hasChildren && scheduleClose(item.label)
                  }
                  onFocusCapture={() => hasChildren && openMenu(item.label)}
                  onBlurCapture={(e) => {
                    if (!hasChildren) return;
                    // Only close if focus is leaving this entire wrapper
                    const next = e.relatedTarget as Node | null;
                    if (!next || !e.currentTarget.contains(next)) {
                      scheduleClose(item.label);
                    }
                  }}
                >
                  <Link
                    to={item.to}
                    aria-haspopup={hasChildren ? 'menu' : undefined}
                    aria-expanded={hasChildren ? isOpen : undefined}
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '13px',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: '#0A1628',
                      textDecoration: 'none',
                      paddingBottom: '4px',
                      borderBottom:
                        isActive(item) || isOpen
                          ? '1px solid #97B73B'
                          : '1px solid transparent',
                      transition: 'border-color 200ms ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    {item.label}
                    {hasChildren && (
                      <span
                        aria-hidden="true"
                        style={{
                          fontSize: 9,
                          color: '#6B7280',
                          transform: isOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 180ms ease',
                          display: 'inline-block',
                        }}
                      >
                        ▾
                      </span>
                    )}
                  </Link>

                  {hasChildren && isOpen && (
                    <div
                      role="menu"
                      // Padding-top creates an invisible bridge that connects
                      // the trigger to the menu body so the cursor never
                      // leaves the wrapper while traversing the gap.
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: -16,
                        paddingTop: 14,
                        zIndex: 40,
                      }}
                      onMouseEnter={cancelClose}
                      onMouseLeave={() => scheduleClose(item.label)}
                    >
                      <div
                        style={{
                          backgroundColor: '#FAFAF7',
                          border: '1px solid #E5E2D9',
                          padding: '10px 0',
                          minWidth: 240,
                          boxShadow:
                            '0 14px 36px rgba(10,22,40,0.08), 0 1px 0 rgba(10,22,40,0.04)',
                          animation:
                            'rfDropdownIn 180ms cubic-bezier(0.16, 1, 0.3, 1)',
                          transformOrigin: 'top left',
                        }}
                      >
                        {item.children!.map((child) => {
                          const isCurrent = pathname === child.to;
                          return (
                            <Link
                              key={child.label}
                              to={child.to}
                              role="menuitem"
                              style={{
                                display: 'block',
                                padding: '10px 22px',
                                fontFamily: 'Inter, sans-serif',
                                fontSize: 14,
                                color: isCurrent ? '#333184' : '#0A1628',
                                textDecoration: 'none',
                                backgroundColor: isCurrent
                                  ? '#F1EFE6'
                                  : 'transparent',
                                borderLeft: isCurrent
                                  ? '2px solid #97B73B'
                                  : '2px solid transparent',
                                transition:
                                  'background-color 150ms ease, color 150ms ease, border-color 150ms ease',
                              }}
                              onMouseEnter={(e) => {
                                const el = e.currentTarget as HTMLAnchorElement;
                                el.style.backgroundColor = '#F1EFE6';
                                el.style.color = '#333184';
                                el.style.borderLeftColor = '#97B73B';
                              }}
                              onMouseLeave={(e) => {
                                if (!isCurrent) {
                                  const el =
                                    e.currentTarget as HTMLAnchorElement;
                                  el.style.backgroundColor = 'transparent';
                                  el.style.color = '#0A1628';
                                  el.style.borderLeftColor = 'transparent';
                                }
                              }}
                            >
                              {child.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={() => setSearchOpen(true)}
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: '13px',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: '#6B7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'color 200ms ease',
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color = '#333184')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.color = '#6B7280')
              }
              aria-label="Open search"
            >
              <Search size={14} />
              Search
            </button>
          </nav>

          {/* Mobile menu icon */}
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#0A1628',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#FAFAF7',
          zIndex: 90,
          transform: mobileOpen ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 320ms cubic-bezier(0.16, 1, 0.3, 1)',
          padding: '88px 24px 32px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          overflowY: 'auto',
        }}
        className="lg:hidden"
      >
        {navItems.map((item) => (
          <div key={item.label} style={{ borderTop: '1px solid #E5E2D9' }}>
            <Link
              to={item.to}
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'block',
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: 28,
                color: '#0A1628',
                padding: '20px 0 12px',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
            {item.children && (
              <div style={{ paddingBottom: 16, paddingLeft: 4 }}>
                {item.children.map((c) => (
                  <Link
                    key={c.label}
                    to={c.to}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      display: 'block',
                      padding: '6px 0',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 12,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: '#6B7280',
                      textDecoration: 'none',
                    }}
                  >
                    — {c.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}

        <button
          onClick={() => {
            setMobileOpen(false);
            setSearchOpen(true);
          }}
          style={{
            marginTop: 24,
            alignSelf: 'flex-start',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: '#0A1628',
            background: 'none',
            border: '1px solid #0A1628',
            padding: '12px 18px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Search size={14} /> Search the site
        </button>
      </div>

      {/* Search overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '420px',
          maxWidth: '100vw',
          backgroundColor: '#FAFAF7',
          borderLeft: '1px solid #E5E2D9',
          zIndex: 100,
          transform: searchOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 400ms cubic-bezier(0.16, 1, 0.3, 1)',
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="flex items-center justify-between mb-8">
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '13px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#6B7280',
            }}
          >
            Search
          </span>
          <button
            onClick={() => setSearchOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#0A1628',
            }}
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>
        <form
          action="https://resiliencefrontiers.org"
          method="get"
          style={{ display: 'block' }}
        >
          <input
            ref={searchRef}
            type="text"
            name="s"
            placeholder="Search pathways, insights, news…"
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: '20px',
              color: '#0A1628',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: '1px solid #E5E2D9',
              outline: 'none',
              padding: '8px 0',
              width: '100%',
            }}
          />
          <p
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: '#6B7280',
              marginTop: 12,
            }}
          >
            Press Enter to search resiliencefrontiers.org
          </p>
        </form>
      </div>

      {searchOpen && (
        <div
          onClick={() => setSearchOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(10, 22, 40, 0.3)',
            zIndex: 99,
          }}
        />
      )}
    </>
  );
}

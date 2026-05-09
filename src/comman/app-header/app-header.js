import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ── Nav structure ─────────────────────────────────────────────────────────────
const NAV = [
  {
    label: "Home",
    path: "/home",
  },
  {
    label: "Product Management",
    children: [
      {
        group: "🌸 Upload Products",
        items: [
          { label: "Flowers Upload", path: "/upload/flowers" },
          { label: "Cakes Upload",   path: "/upload/cakes"   },
          { label: "Plants Upload",  path: "/upload/plants"  },
        ],
      },
      {
        group: "✏️ Edit Products",
        items: [
          { label: "Flowers Edit",   path: "/edit/flowers" },
          { label: "Cakes Edit",     path: "/edit/cakes"   },
          { label: "Plants Edit",    path: "/edit/plants"  },
        ],
      },
      {
        group: "⬇ Export Products",
        items: [
          { label: "Flowers Export", path: "/export/flowers" },
          { label: "Cakes Export",   path: "/export/cakes"   },
          { label: "Plants Export",  path: "/export/plants"  },
        ],
      },
    ],
  },
  {
    label: "Tools",
    children: [
      {
        group: "Media & Content",
        items: [
          { label: "Image Upload",  path: "/imageUpload"  },
          { label: "Add-On Upload", path: "/addonUpload"  },
          { label: "Page Content",  path: "/pageContent"  },
        ],
      },
      {
        group: "Legacy Upload",
        items: [
          { label: "Add Product (CSV)",  path: "/addProduct"   },
          { label: "Edit Product (CSV)", path: "/editProduct"  },
          { label: "Delete Products",    path: "/deleteProduct" },
        ],
      },
    ],
  },
  { label: "Questions",  path: "/questions"  },
  { label: "City Pages", path: "/city-pages" },
  { label: "Orders",     path: "/orders"     },
];

// ── Dropdown component ────────────────────────────────────────────────────────
function Dropdown({ item, onNavigate }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors"
      >
        {item.label}
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white rounded-xl shadow-xl border border-gray-200 p-3 min-w-max"
          style={{ minWidth: "520px" }}>
          <div className="grid grid-cols-3 gap-4">
            {item.children.map(group => (
              <div key={group.group}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">{group.group}</p>
                {group.items.map(sub => (
                  <button key={sub.path}
                    onClick={() => { onNavigate(sub.path); setOpen(false); }}
                    className="block w-full text-left px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors">
                    {sub.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Header ────────────────────────────────────────────────────────────────────
const Header = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [mobileGroup, setMobileGroup] = useState(null);

  const handleLogout = () => { localStorage.clear(); navigate("/login"); };
  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-15 py-3">
          {/* Logo */}
          <button onClick={() => navigate("/home")} className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xs">RH</span>
            </div>
            <span className="text-lg font-bold text-red-600 group-hover:text-red-700">Red Heart Admin</span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV.map(item =>
              item.children ? (
                <Dropdown key={item.label} item={item} onNavigate={navigate} />
              ) : (
                <button key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                    ${isActive(item.path) ? "text-red-600 bg-red-50" : "text-gray-700 hover:text-red-600 hover:bg-red-50"}`}>
                  {item.label}
                </button>
              )
            )}
            <button onClick={handleLogout}
              className="ml-2 px-3 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors">
              Logout
            </button>
          </nav>

          {/* Mobile hamburger */}
          <button className="lg:hidden p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50"
            onClick={() => setMobileOpen(v => !v)}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 pb-4 px-4 space-y-1 max-h-screen overflow-y-auto">
          {NAV.map(item =>
            item.children ? (
              <div key={item.label}>
                <button
                  onClick={() => setMobileGroup(mobileGroup === item.label ? null : item.label)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-semibold text-gray-700 hover:bg-red-50">
                  {item.label}
                  <svg className={`w-4 h-4 transition-transform ${mobileGroup === item.label ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {mobileGroup === item.label && (
                  <div className="ml-4 mt-1 space-y-3 pb-2">
                    {item.children.map(group => (
                      <div key={group.group}>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-1">{group.group}</p>
                        {group.items.map(sub => (
                          <button key={sub.path}
                            onClick={() => { navigate(sub.path); setMobileOpen(false); }}
                            className="block w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-red-50 hover:text-red-700">
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <button key={item.label}
                onClick={() => { navigate(item.path); setMobileOpen(false); }}
                className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium
                  ${isActive(item.path) ? "text-red-600 bg-red-50" : "text-gray-700 hover:bg-red-50"}`}>
                {item.label}
              </button>
            )
          )}
          <button onClick={handleLogout}
            className="block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50">
            Logout
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;

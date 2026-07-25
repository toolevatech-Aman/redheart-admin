import React, { useEffect, useMemo, useState } from "react";
import {
  Search, Phone, Mail, MapPin, ChevronDown, ChevronUp, ShoppingCart,
  Package, IndianRupee, MessageCircle, User as UserIcon, RefreshCw, Home, Zap,
} from "lucide-react";
import { Get } from "../../service/axiosService";

const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

const waLink = (phone) => {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, "");
  const full = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${full}`;
};

const fmtDate = (d) => {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date)) return "—";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const STATUS_STYLES = {
  Pending:           "bg-amber-50 text-amber-700",
  Accepted:          "bg-blue-50 text-blue-700",
  InTransit:         "bg-indigo-50 text-indigo-700",
  "Out Of Delivery": "bg-purple-50 text-purple-700",
  Delivered:         "bg-green-50 text-green-700",
  Cancelled:         "bg-red-50 text-red-600",
};

const PAGE_SIZE = 20;

const UsersPage = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [expanded, setExpanded] = useState([]);

  const [search, setSearch]     = useState("");
  const [filter, setFilter]     = useState("all"); // all | ordered | not_ordered | cart | address
  const [visible, setVisible]   = useState(PAGE_SIZE);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await Get("/user/admin/all");
      setUsers(res.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggle = (id) =>
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const matches = users.filter((u) => {
      if (filter === "ordered" && !(u.orderCount > 0)) return false;
      if (filter === "not_ordered" && u.orderCount > 0) return false;
      if (filter === "cart" && !(u.cartItems?.length > 0)) return false;
      if (filter === "buy_now" && !u.buyNowItem) return false;
      if (filter === "address" && !(u.addresses?.length > 0)) return false;
      if (!q) return true;
      const hay = [
        u.name, u.email, u.phone,
        ...(u.addresses || []).map((a) => `${a.city} ${a.street}`),
        ...(u.cartItems || []).map((c) => c.name),
        u.buyNowItem?.name,
      ].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });

    // Active cart/buy-now intent floats to the top regardless of join date —
    // that's the signal worth acting on, and it shouldn't hide behind
    // pagination just because the account isn't recent.
    const hasIntent = (u) => (u.cartItems?.length > 0 || u.buyNowItem) ? 0 : 1;
    return [...matches].sort((a, b) => hasIntent(a) - hasIntent(b));
  }, [users, search, filter]);

  const stats = useMemo(() => ({
    total: users.length,
    ordered: users.filter((u) => u.orderCount > 0).length,
    notOrdered: users.filter((u) => u.orderCount === 0).length,
    withCart: users.filter((u) => u.cartItems?.length > 0).length,
    withBuyNow: users.filter((u) => u.buyNowItem).length,
    cartValue: users.reduce((sum, u) => sum + (u.cartValue || 0), 0),
  }), [users]);

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-500">
        <RefreshCw className="w-8 h-8 animate-spin mb-3 text-red-500" />
        Loading users…
      </div>
    );

  if (error)
    return (
      <div className="max-w-lg mx-auto mt-16 p-6 bg-red-50 border border-red-200 rounded-xl text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <button onClick={fetchUsers} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm">Retry</button>
      </div>
    );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold text-gray-800">Users</h2>
        <button
          onClick={fetchUsers}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Total Users",    value: stats.total,       icon: UserIcon,     color: "text-gray-700",   onClick: () => setFilter("all") },
          { label: "Ordered",        value: stats.ordered,     icon: Package,      color: "text-green-600",  onClick: () => setFilter("ordered") },
          { label: "Never Ordered",  value: stats.notOrdered,  icon: Package,      color: "text-orange-500", onClick: () => setFilter("not_ordered") },
          { label: "Active Carts",   value: stats.withCart,    icon: ShoppingCart, color: "text-blue-600",   onClick: () => setFilter("cart") },
          { label: "Buy Now Intent", value: stats.withBuyNow,  icon: Zap,          color: "text-amber-500",  onClick: () => setFilter("buy_now") },
          { label: "Cart Value",     value: inr(stats.cartValue), icon: IndianRupee, color: "text-emerald-600", onClick: () => setFilter("cart") },
        ].map(({ label, value, icon: Icon, color, onClick }) => (
          <button key={label} onClick={onClick}
            className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm text-left hover:border-gray-300 transition">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Icon className={`w-3.5 h-3.5 ${color}`} /> {label}
            </div>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col md:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisible(PAGE_SIZE); }}
            placeholder="Search name, email, phone, city, cart item…"
            className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-red-400"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setVisible(PAGE_SIZE); }}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm bg-white"
        >
          <option value="all">All Users</option>
          <option value="ordered">Ordered</option>
          <option value="not_ordered">Never Ordered</option>
          <option value="cart">Has Items in Cart</option>
          <option value="buy_now">Has Buy Now Intent</option>
          <option value="address">Has Saved Address</option>
        </select>
      </div>

      <p className="text-xs text-gray-400 mb-3">{filtered.length} user{filtered.length !== 1 && "s"}</p>

      {/* User cards */}
      {filtered.length === 0 ? (
        <p className="text-center py-16 text-gray-400">No users match.</p>
      ) : (
        filtered.slice(0, visible).map((u) => {
          const isExpanded = expanded.includes(u._id);
          const hasCart = u.cartItems?.length > 0;
          const hasBuyNow = !!u.buyNowItem;
          const hasAddr = u.addresses?.length > 0;

          return (
            <div key={u._id} className="bg-white border border-gray-200 rounded-xl mb-3 shadow-sm overflow-hidden">
              <div className="p-4 flex flex-wrap items-center gap-4">
                {u.avatar
                  ? <img src={u.avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                  : <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-semibold shrink-0">
                      {(u.name || u.email || "?")[0].toUpperCase()}
                    </div>
                }

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{u.name || <span className="text-gray-400 italic font-normal">No name</span>}</p>
                    {u.role === "admin" && (
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase bg-red-100 text-red-600 rounded-full">Admin</span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-0.5">
                    {u.phone && (
                      <a href={`tel:${u.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline">
                        <Phone className="w-3 h-3" /> {u.phone}
                      </a>
                    )}
                    {u.phone && (
                      <a href={waLink(u.phone)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-green-600 hover:underline">
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </a>
                    )}
                    {u.email && (
                      <a href={`mailto:${u.email}`} className="flex items-center gap-1 hover:underline">
                        <Mail className="w-3 h-3" /> {u.email}
                      </a>
                    )}
                    <span>Joined {fmtDate(u.createdAt)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.orderCount > 0 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"}`}>
                    {u.orderCount > 0 ? `${u.orderCount} order${u.orderCount > 1 ? "s" : ""}` : "No orders"}
                  </span>
                  {hasCart && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                      <ShoppingCart className="w-3 h-3" /> {u.cartItems.length} in cart
                    </span>
                  )}
                  {hasBuyNow && (
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                      <Zap className="w-3 h-3" /> Buy Now
                    </span>
                  )}
                  {u.totalSpent > 0 && (
                    <span className="text-sm font-bold text-gray-900">{inr(u.totalSpent)}</span>
                  )}
                  <button onClick={() => toggle(u._id)} className="text-gray-400 hover:text-gray-700">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50/60 p-4 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                  {/* Cart */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                      <ShoppingCart className="w-4 h-4 text-blue-500" /> Cart
                      {hasCart && <span className="text-xs font-normal text-gray-400">· updated {fmtDate(u.cartUpdatedAt)}</span>}
                    </h4>
                    {!hasCart ? (
                      <p className="text-gray-400 italic">Cart is empty</p>
                    ) : (
                      <div className="space-y-2">
                        {u.cartItems.map((item, i) => (
                          <div key={item._id || i} className="flex items-center gap-3">
                            <a href={item.product_url || item.image_url} target="_blank" rel="noopener noreferrer">
                              <img src={item.image_url} alt={item.name}
                                className="w-11 h-11 rounded-lg object-cover border border-gray-200 hover:opacity-80" />
                            </a>
                            <div className="min-w-0 flex-1">
                              {item.product_url ? (
                                <a href={item.product_url} target="_blank" rel="noopener noreferrer"
                                  className="font-medium text-gray-900 hover:text-red-600 hover:underline truncate block">
                                  {item.name}
                                </a>
                              ) : (
                                <p className="font-medium text-gray-900 truncate">{item.name}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                {item.variant_name ? `${item.variant_name} · ` : ""}Qty {item.quantity} · {inr(item.selling_price)}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div className="flex justify-between pt-2 border-t border-gray-200 font-semibold text-gray-800">
                          <span>Cart value</span><span>{inr(u.cartValue)}</span>
                        </div>
                      </div>
                    )}

                    {hasBuyNow && (
                      <>
                        <h4 className="font-semibold text-gray-800 mt-4 mb-2 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-amber-500" /> Buy Now Selection
                        </h4>
                        <div className="flex items-center gap-3">
                          <a href={u.buyNowItem.product_url || u.buyNowItem.image_url} target="_blank" rel="noopener noreferrer">
                            <img src={u.buyNowItem.image_url} alt={u.buyNowItem.name}
                              className="w-11 h-11 rounded-lg object-cover border border-gray-200 hover:opacity-80" />
                          </a>
                          <div className="min-w-0 flex-1">
                            {u.buyNowItem.product_url ? (
                              <a href={u.buyNowItem.product_url} target="_blank" rel="noopener noreferrer"
                                className="font-medium text-gray-900 hover:text-red-600 hover:underline truncate block">
                                {u.buyNowItem.name}
                              </a>
                            ) : (
                              <p className="font-medium text-gray-900 truncate">{u.buyNowItem.name}</p>
                            )}
                            <p className="text-xs text-gray-500">
                              {u.buyNowItem.variant_name ? `${u.buyNowItem.variant_name} · ` : ""}{inr(u.buyNowItem.selling_price)}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {u.lastOrder && (
                      <>
                        <h4 className="font-semibold text-gray-800 mt-4 mb-1.5 flex items-center gap-1.5">
                          <Package className="w-4 h-4 text-gray-400" /> Last Order
                        </h4>
                        <p className="text-gray-600 flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs">{u.lastOrder.orderId}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${STATUS_STYLES[u.lastOrder.status] || "bg-gray-100 text-gray-600"}`}>
                            {u.lastOrder.status}
                          </span>
                          <span className="text-xs text-gray-400">{fmtDate(u.lastOrder.date)}</span>
                        </p>
                      </>
                    )}
                  </div>

                  {/* Addresses */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                      <Home className="w-4 h-4 text-gray-400" /> Saved Addresses
                    </h4>
                    {!hasAddr ? (
                      <p className="text-gray-400 italic">No saved address</p>
                    ) : (
                      <div className="space-y-2.5">
                        {u.addresses.map((a, i) => (
                          <div key={i} className="border border-gray-200 rounded-lg p-2.5 bg-white">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold uppercase text-gray-500">{a.label || "home"}</span>
                              {a.isDefault && <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full">Default</span>}
                            </div>
                            <p className="text-gray-700">{a.firstName} {a.lastName}</p>
                            <p className="text-gray-500 flex items-start gap-1 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                              {a.street}, {a.city}, {a.state} {a.postalCode}, {a.country}
                            </p>
                            {a.phone && <p className="text-gray-500 mt-0.5">{a.phone}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}

      {visible < filtered.length && (
        <div className="text-center mt-2 mb-8">
          <button onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            Load more ({filtered.length - visible} remaining)
          </button>
        </div>
      )}
    </div>
  );
};

export default UsersPage;

import React, { useEffect, useState } from "react";
import { Get } from "../../service/axiosService";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | ordered | not_ordered

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await Get("/user/admin/all");
        const data = res.data?.data || [];
        setUsers(data);
        setFiltered(data);
      } catch (err) {
        console.error("Failed to fetch users", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    let result = [...users];
    if (filter === "ordered") result = result.filter(u => u.orderCount > 0);
    if (filter === "not_ordered") result = result.filter(u => u.orderCount === 0);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(u =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").includes(q)
      );
    }
    setFiltered(result);
  }, [search, filter, users]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading users...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Users ({filtered.length})</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name, email or phone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-red-400"
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <option value="all">All Users</option>
          <option value="ordered">Ordered</option>
          <option value="not_ordered">Never Ordered</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{users.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Users</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{users.filter(u => u.orderCount > 0).length}</p>
          <p className="text-sm text-gray-500 mt-1">Ordered</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">{users.filter(u => u.orderCount === 0).length}</p>
          <p className="text-sm text-gray-500 mt-1">Never Ordered</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Phone</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Orders</th>
              <th className="px-5 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">No users found</td></tr>
            ) : filtered.map(user => (
              <tr key={user._id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {user.avatar
                      ? <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      : <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-semibold text-sm">
                          {(user.name || user.email || "?")[0].toUpperCase()}
                        </div>
                    }
                    <div>
                      <p className="font-medium text-gray-800">{user.name || <span className="text-gray-400 italic">No name</span>}</p>
                      <p className="text-xs text-gray-400">{user.email || <span className="italic">No email</span>}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-600">{user.phone || "-"}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.role === "admin" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.orderCount > 0 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-600"}`}>
                    {user.orderCount > 0 ? `${user.orderCount} order${user.orderCount > 1 ? "s" : ""}` : "No orders"}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;

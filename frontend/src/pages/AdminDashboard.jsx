import { useState } from "react";
import { FaClipboardList, FaSeedling, FaUsers } from "react-icons/fa";
import AdminProducts from "./admin/AdminProducts";
import AdminOrders from "./admin/AdminOrders";
import AdminUsers from "./admin/AdminUsers";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const [tab, setTab] = useState("orders");
  const { user } = useAuth();

  const tabs = [
    { id: "orders", label: "Orders", icon: <FaClipboardList /> },
    { id: "products", label: "Products", icon: <FaSeedling /> },
    { id: "users", label: "Users", icon: <FaUsers /> },
  ];

  return (
    <div className="page ad">
      <div className="ad-head">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {user?.name}. Manage your orders, terrariums and customers.</p>
        </div>
      </div>

      <div className="ad-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? "ad-tab on" : "ad-tab"}
            onClick={() => setTab(t.id)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "orders" && <AdminOrders />}
      {tab === "products" && <AdminProducts />}
      {tab === "users" && <AdminUsers />}
    </div>
  );
}
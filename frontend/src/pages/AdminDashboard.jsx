import { useState } from "react";
import AdminProducts from "./admin/AdminProducts";
import AdminOrders from "./admin/AdminOrders";
import AdminUsers from "./admin/AdminUsers";

export default function AdminDashboard() {
  const [tab, setTab] = useState("orders");

  return (
    <div className="page">
      <h1>Admin Dashboard</h1>

      <div className="tabs">
        <button className={tab === "orders" ? "active" : ""} onClick={() => setTab("orders")}>Orders & Payments</button>
        <button className={tab === "products" ? "active" : ""} onClick={() => setTab("products")}>Products</button>
        <button className={tab === "users" ? "active" : ""} onClick={() => setTab("users")}>Users</button>
      </div>

      {tab === "orders" && <AdminOrders />}
      {tab === "products" && <AdminProducts />}
      {tab === "users" && <AdminUsers />}
    </div>
  );
}
import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import api from "../../api";

// Digits only, for the wa.me link. Works only if the number has a country code.
const waLink = (phone, name) => {
  const p = String(phone || "").replace(/[\s\-()]/g, "");
  if (!/^\+[1-9]\d{7,14}$/.test(p)) return null;
  const text = encodeURIComponent(`Hello ${name}, this is The Moss Jar.`);
  return `https://wa.me/${p.slice(1)}?text=${text}`;
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    api
      .get("/auth/users")
      .then(({ data }) => setUsers(data))
      .catch(() => setError("Could not load users"));
  }, []);

  const q = search.trim().toLowerCase();
  const shown = users.filter(
    (u) =>
      !q ||
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      String(u.phone).includes(q)
  );

  return (
    <div className="summary">
      <h3>Registered customers ({users.length})</h3>
      {error && <p className="error">{error}</p>}

      <input
        className="user-search"
        placeholder="Search by name, email or WhatsApp number"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>WhatsApp</th>
              <th>Address</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((u) => {
              const link = waLink(u.phone, u.name);
              return (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    {link ? (
                      <a href={link} target="_blank" rel="noopener noreferrer" className="wa-chip">
                        <FaWhatsapp /> {u.phone}
                      </a>
                    ) : (
                      <span title="Saved without a country code">{u.phone}</span>
                    )}
                  </td>
                  <td>{u.address}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              );
            })}
            {shown.length === 0 && (
              <tr><td colSpan="5">No customers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
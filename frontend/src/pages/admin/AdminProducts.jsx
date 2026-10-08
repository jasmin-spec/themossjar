import { useEffect, useState } from "react";
import api from "../../api";

const emptyForm = { name: "", description: "", price: "", stock: "", customisable: false };

// One row in the product list (edit price, stock, type, or delete)
function ProductRow({ product, onDone, onError }) {
  const [price, setPrice] = useState(product.price);
  const [stock, setStock] = useState(product.stock);
  const [customisable, setCustomisable] = useState(!!product.customisable);

  const save = async () => {
    try {
      await api.put(`/products/${product._id}`, { price, stock, customisable });
      onDone("Saved ✅");
    } catch (err) {
      onError(err.response?.data?.message || "Could not save");
    }
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${product.name}"?`)) return;
    try {
      await api.delete(`/products/${product._id}`);
      onDone("Deleted ✅");
    } catch (err) {
      onError(err.response?.data?.message || "Could not delete");
    }
  };

  return (
    <div className="admin-row">
      <img src={product.image?.url || "https://placehold.co/60x60"} alt={product.name} />
      <div className="grow">
        <b>{product.name}</b>
        <br />
        <small>{product.customisable ? "🎨 Customisable" : "📦 Ready-made"}</small>
      </div>
      <label>Price
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
      </label>
      <label>Stock
        <input type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
      </label>
      <label className="check">
        <input type="checkbox" checked={customisable} onChange={(e) => setCustomisable(e.target.checked)} />
        Customisable
      </label>
      <button onClick={save}>Save</button>
      <button className="danger" onClick={remove}>Delete</button>
    </div>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => api.get("/products").then(({ data }) => setProducts(data));
  useEffect(() => { load(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    const formEl = e.target;
    setError("");
    setMsg("");
    if (!image) return setError("Please choose an image");

    // Files must be sent as FormData (not plain JSON)
    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    data.append("image", image);

    setSaving(true);
    try {
      await api.post("/products", data);
      setMsg("Terrarium added ✅");
      setForm(emptyForm);
      setImage(null);
      formEl.reset();
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not add product");
    } finally {
      setSaving(false);
    }
  };

  const afterChange = (message) => { setError(""); setMsg(message); load(); };
  const afterError = (message) => { setMsg(""); setError(message); };

  return (
    <div>
      {msg && <p className="success">{msg}</p>}
      {error && <p className="error">{error}</p>}

      <div className="summary">
        <h3>Add a new terrarium</h3>
        <form onSubmit={handleAdd} className="admin-form">
          <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
          <input name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
          <input name="price" type="number" min="0" placeholder="Price (AED)" value={form.price} onChange={handleChange} required />
          <input name="stock" type="number" min="0" placeholder="Stock" value={form.stock} onChange={handleChange} required />
          <label className="check">
            <input
              type="checkbox"
              checked={form.customisable}
              onChange={(e) => setForm({ ...form, customisable: e.target.checked })}
            />
            Customisable (customer can choose size, plants, theme, miniatures...)
          </label>
          <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required />
          <button type="submit" disabled={saving}>{saving ? "Uploading..." : "Add Terrarium"}</button>
        </form>
      </div>

      <div className="summary">
        <h3>All terrariums ({products.length})</h3>
        {products.map((p) => (
          <ProductRow key={p._id} product={p} onDone={afterChange} onError={afterError} />
        ))}
      </div>
    </div>
  );
}
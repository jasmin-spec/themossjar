import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [options, setOptions] = useState(null);
  const [error, setError] = useState("");
  const [customising, setCustomising] = useState(false);

  // The customer's choices
  const [size, setSize] = useState("small");
  const [container, setContainer] = useState("glass jar");
  const [plants, setPlants] = useState([]);
  const [theme, setTheme] = useState("none");
  const [miniatures, setMiniatures] = useState([]);
  const [sculptures, setSculptures] = useState([]);
  const [message, setMessage] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    Promise.all([api.get(`/products/${id}`), api.get("/orders/options")])
      .then(([p, o]) => {
        setProduct(p.data);
        setOptions(o.data);
      })
      .catch(() => setError("Terrarium not found"));
  }, [id]);

  if (error) return <div className="page"><p className="error">{error}</p></div>;
  if (!product || !options) return <div className="page"><p>Loading...</p></div>;

  const toggle = (list, setList, name, max) => {
    if (list.includes(name)) return setList(list.filter((x) => x !== name));
    if (max && list.length >= max) return;
    setList([...list, name]);
  };

  const sumOf = (list, prices) => list.reduce((sum, n) => sum + prices[n], 0);

  // Price preview (the server recalculates it when the order is placed)
  const unitPrice = !customising
    ? product.price
    : product.price +
      options.sizes[size] +
      options.containers[container] +
      plants.length * options.plantPrice +
      options.themes[theme] +
      sumOf(miniatures, options.miniatures) +
      sumOf(sculptures, options.sculptures);

  const handleBuy = () => {
    if (!user) return navigate("/login");
    navigate("/checkout", {
      state: {
        product,
        quantity,
        unitPrice,
        deliveryFees: options.deliveryFee,
        customisation: customising
          ? { size, container, plants, theme, miniatures, sculptures, message }
          : {
              size: "ready-made",
              container: "as shown in photo",
              plants: [],
              theme: "none",
              miniatures: [],
              sculptures: [],
              message,
            },
      },
    });
  };

  const outOfStock = product.stock === 0;

  return (
    <div className="page">
      <Link to="/">← Back to all terrariums</Link>

      <div className="details">
        <img
          src={product.image?.url || "https://placehold.co/400x300?text=No+Image"}
          alt={product.name}
        />

        <div>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <p className="price big">AED {product.price}</p>
          <p>
            {outOfStock
              ? <span className="out">Out of stock</span>
              : `In stock: ${product.stock}`}
          </p>

          {!outOfStock && (
            <>
              {/* Customise button (outside the box) */}
              <button
                className={customising ? "customise-btn open" : "customise-btn"}
                onClick={() => setCustomising(!customising)}
              >
                {customising ? "✖ Cancel customisation" : "🎨 Customise this terrarium"}
              </button>

              <div className="custom-box">
                {customising ? (
                  <>
                    <h3>Customise your terrarium</h3>

                    <label>Size</label>
                    <select value={size} onChange={(e) => setSize(e.target.value)}>
                      {Object.entries(options.sizes).map(([name, extra]) => (
                        <option key={name} value={name}>
                          {name} {extra > 0 ? `(+AED ${extra})` : ""}
                        </option>
                      ))}
                    </select>

                    <label>Container</label>
                    <select value={container} onChange={(e) => setContainer(e.target.value)}>
                      {Object.entries(options.containers).map(([name, extra]) => (
                        <option key={name} value={name}>
                          {name} {extra > 0 ? `(+AED ${extra})` : ""}
                        </option>
                      ))}
                    </select>

                    <label>Plants (AED {options.plantPrice} each)</label>
                    <div className="plants">
                      {options.plants.map((name) => (
                        <label key={name} className="check">
                          <input
                            type="checkbox"
                            checked={plants.includes(name)}
                            onChange={() => toggle(plants, setPlants, name)}
                          />
                          {name}
                        </label>
                      ))}
                    </div>

                    <label>Theme (choose one)</label>
                    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
                      {Object.entries(options.themes).map(([name, extra]) => (
                        <option key={name} value={name}>
                          {name === "none" ? "No theme" : name} {extra > 0 ? `(+AED ${extra})` : ""}
                        </option>
                      ))}
                    </select>

                    <label>
                      Miniatures ({miniatures.length}/{options.maxMiniatures} chosen)
                    </label>
                    <div className="plants">
                      {Object.entries(options.miniatures).map(([name, price]) => (
                        <label key={name} className="check">
                          <input
                            type="checkbox"
                            checked={miniatures.includes(name)}
                            disabled={!miniatures.includes(name) && miniatures.length >= options.maxMiniatures}
                            onChange={() => toggle(miniatures, setMiniatures, name, options.maxMiniatures)}
                          />
                          {name} <span className="opt-price">+{price}</span>
                        </label>
                      ))}
                    </div>

                    <label>
                      Sculptures ({sculptures.length}/{options.maxSculptures} chosen)
                    </label>
                    <div className="plants">
                      {Object.entries(options.sculptures).map(([name, price]) => (
                        <label key={name} className="check">
                          <input
                            type="checkbox"
                            checked={sculptures.includes(name)}
                            disabled={!sculptures.includes(name) && sculptures.length >= options.maxSculptures}
                            onChange={() => toggle(sculptures, setSculptures, name, options.maxSculptures)}
                          />
                          {name} <span className="opt-price">+{price}</span>
                        </label>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    <h3>Ready-made terrarium</h3>
                    <p className="note">Sold exactly as shown in the photo.</p>
                  </>
                )}

                {/* Same for both: message, quantity, total, buy */}
                <label>Gift message (optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Happy Birthday!"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />

                <label>Quantity</label>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Math.min(product.stock, Number(e.target.value) || 1)))
                  }
                />

                <p className="price big">Total: AED {unitPrice * quantity}</p>
                <button onClick={handleBuy}>Buy Now</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaTruck, FaLeaf, FaGift, FaWhatsapp, FaPalette, FaMinus, FaPlus } from "react-icons/fa";
import api from "../api";
import { useAuth } from "../context/AuthContext";

// Pick several (plants, miniatures, sculptures)
function MultiChips({ items, selected, onToggle, max, prices }) {
  return (
    <div className="pd-chips">
      {items.map((name) => {
        const on = selected.includes(name);
        const locked = !on && max && selected.length >= max;
        return (
          <button
            type="button"
            key={name}
            className={on ? "chip on" : "chip"}
            disabled={locked}
            onClick={() => onToggle(name)}
          >
            {name}
            {prices && <em>+{prices[name]}</em>}
          </button>
        );
      })}
    </div>
  );
}

// Pick exactly one (size, container, theme)
function SingleChips({ entries, value, onChange, labelFor }) {
  return (
    <div className="pd-chips">
      {entries.map(([name, extra]) => (
        <button
          type="button"
          key={name}
          className={value === name ? "chip on" : "chip"}
          onClick={() => onChange(name)}
        >
          {labelFor ? labelFor(name) : name}
          {extra > 0 && <em>+{extra}</em>}
        </button>
      ))}
    </div>
  );
}

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [options, setOptions] = useState(null);
  const [error, setError] = useState("");
  const [customising, setCustomising] = useState(false);

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

  const canCustomise = product.customisable === true;
  const isCustom = canCustomise && customising;
  const outOfStock = product.stock === 0;

  const toggle = (list, setList, name, max) => {
    if (list.includes(name)) return setList(list.filter((x) => x !== name));
    if (max && list.length >= max) return;
    setList([...list, name]);
  };

  const sumOf = (list, prices) => list.reduce((sum, n) => sum + prices[n], 0);

  // Price breakdown shown to the customer (the server recalculates it on order)
  const lines = [{ label: "Base price", amount: product.price }];
  if (isCustom) {
    if (options.sizes[size] > 0) lines.push({ label: `Size: ${size}`, amount: options.sizes[size] });
    if (options.containers[container] > 0)
      lines.push({ label: `Container: ${container}`, amount: options.containers[container] });
    if (plants.length > 0)
      lines.push({ label: `Plants (${plants.length})`, amount: plants.length * options.plantPrice });
    if (options.themes[theme] > 0) lines.push({ label: `Theme: ${theme}`, amount: options.themes[theme] });
    if (miniatures.length > 0)
      lines.push({ label: `Miniatures (${miniatures.length})`, amount: sumOf(miniatures, options.miniatures) });
    if (sculptures.length > 0)
      lines.push({ label: `Sculptures (${sculptures.length})`, amount: sumOf(sculptures, options.sculptures) });
  }
  const unitPrice = lines.reduce((sum, l) => sum + l.amount, 0);

  const handleBuy = () => {
    if (!user) return navigate("/login");
    navigate("/checkout", {
      state: {
        product,
        quantity,
        unitPrice,
        deliveryFees: options.deliveryFee,
        customisation: isCustom
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

  const changeQty = (n) =>
    setQuantity(Math.max(1, Math.min(product.stock, n)));

  return (
    <div className="page pd">
      <nav className="pd-crumbs">
        <Link to="/">Home</Link> / <Link to="/#terrariums">Terrariums</Link> / <span>{product.name}</span>
      </nav>

      <div className="pd-grid">
        {/* LEFT: photo */}
        <div className="pd-gallery">
          <div className="pd-imgwrap">
            <img
              src={product.image?.url || "https://placehold.co/600x700?text=No+Image"}
              alt={product.name}
            />
            <span className={canCustomise ? "pd-badge custom" : "pd-badge ready"}>
              {canCustomise ? "Customisable" : "Ready-made"}
            </span>
          </div>
        </div>

        {/* RIGHT: details */}
        <div className="pd-info">
          <h1>{product.name}</h1>

          <div className="pd-pricerow">
            <span className="pd-price">
              {canCustomise ? "From " : ""}AED {product.price}
            </span>
            {outOfStock ? (
              <span className="pd-stock out">Out of stock</span>
            ) : (
              <span className="pd-stock in">
                {product.stock <= 3 ? `Only ${product.stock} left` : `In stock: ${product.stock}`}
              </span>
            )}
          </div>

          <p className="pd-desc">{product.description}</p>

          <div className="pd-trust">
            <div><FaLeaf /><span>Handcrafted</span></div>
            <div><FaTruck /><span>Delivery or pickup</span></div>
            <div><FaGift /><span>Gift message</span></div>
            <div><FaWhatsapp /><span>Order on WhatsApp</span></div>
          </div>

          {!outOfStock && (
            <>
              {canCustomise && (
                <button
                  type="button"
                  className={customising ? "pd-custom-btn open" : "pd-custom-btn"}
                  onClick={() => setCustomising(!customising)}
                >
                  <FaPalette /> {customising ? "Cancel customisation" : "Customise this terrarium"}
                </button>
              )}

              <div className="pd-panel">
                {isCustom ? (
                  <>
                    <h3 className="pd-panel-title">Design your terrarium</h3>

                    <div className="pd-group">
                      <label>Size</label>
                      <SingleChips
                        entries={Object.entries(options.sizes)}
                        value={size}
                        onChange={setSize}
                      />
                    </div>

                    <div className="pd-group">
                      <label>Container</label>
                      <SingleChips
                        entries={Object.entries(options.containers)}
                        value={container}
                        onChange={setContainer}
                      />
                    </div>

                    <div className="pd-group">
                      <label>
                        Plants <small>AED {options.plantPrice} each</small>
                      </label>
                      <MultiChips
                        items={options.plants}
                        selected={plants}
                        onToggle={(n) => toggle(plants, setPlants, n)}
                      />
                    </div>

                    <div className="pd-group">
                      <label>Theme <small>choose one</small></label>
                      <SingleChips
                        entries={Object.entries(options.themes)}
                        value={theme}
                        onChange={setTheme}
                        labelFor={(n) => (n === "none" ? "No theme" : n)}
                      />
                    </div>

                    <div className="pd-group">
                      <label>
                        Miniatures{" "}
                        <small>{miniatures.length}/{options.maxMiniatures} chosen</small>
                      </label>
                      <MultiChips
                        items={Object.keys(options.miniatures)}
                        selected={miniatures}
                        max={options.maxMiniatures}
                        prices={options.miniatures}
                        onToggle={(n) => toggle(miniatures, setMiniatures, n, options.maxMiniatures)}
                      />
                    </div>

                    <div className="pd-group">
                      <label>
                        Sculptures{" "}
                        <small>{sculptures.length}/{options.maxSculptures} chosen</small>
                      </label>
                      <MultiChips
                        items={Object.keys(options.sculptures)}
                        selected={sculptures}
                        max={options.maxSculptures}
                        prices={options.sculptures}
                        onToggle={(n) => toggle(sculptures, setSculptures, n, options.maxSculptures)}
                      />
                    </div>
                  </>
                ) : (
                  <p className="pd-note">
                    {canCustomise
                      ? "Order it exactly as shown, or press Customise above to make it your own."
                      : "Sold exactly as shown in the photo."}
                  </p>
                )}

                <div className="pd-group">
                  <label>Gift message <small>optional</small></label>
                  <input
                    type="text"
                    className="pd-input"
                    placeholder="e.g. Happy Birthday!"
                    maxLength={200}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <div className="pd-group pd-qtyrow">
                  <label>Quantity</label>
                  <div className="qty">
                    <button type="button" onClick={() => changeQty(quantity - 1)} aria-label="Less">
                      <FaMinus size={11} />
                    </button>
                    <span>{quantity}</span>
                    <button type="button" onClick={() => changeQty(quantity + 1)} aria-label="More">
                      <FaPlus size={11} />
                    </button>
                  </div>
                </div>

                <div className="pd-lines">
                  {lines.map((l) => (
                    <div className="pd-line" key={l.label}>
                      <span>{l.label}</span>
                      <span>AED {l.amount}</span>
                    </div>
                  ))}
                  {quantity > 1 && (
                    <div className="pd-line">
                      <span>Quantity</span>
                      <span>x {quantity}</span>
                    </div>
                  )}
                </div>

                <div className="pd-total">
                  <span>Total</span>
                  <span>AED {unitPrice * quantity}</span>
                </div>

                <button type="button" className="pd-buy" onClick={handleBuy}>
                  Buy Now
                </button>
                <p className="pd-fine">
                  You confirm your order on WhatsApp and pay on delivery or pickup.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
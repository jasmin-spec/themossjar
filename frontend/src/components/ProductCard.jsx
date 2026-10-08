import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  const imageUrl =
    product.image?.url || "https://placehold.co/400x300?text=No+Image";

  return (
    <div className="card">
      <div className="card-img">
        <img src={imageUrl} alt={product.name} />
        <span className={product.customisable ? "tag custom" : "tag ready"}>
          {product.customisable ? "🎨 Customisable" : "📦 Ready-made"}
        </span>
      </div>
      <div className="card-body">
        <h3>{product.name}</h3>
        <p className="price">
          {product.customisable ? "From AED " : "AED "}
          {product.price}
        </p>
        {product.stock === 0 && <p className="out">Out of stock</p>}
        <Link to={`/product/${product._id}`} className="btn-link">
          {product.customisable ? "Customise" : "View Details"}
        </Link>
      </div>
    </div>
  );
}
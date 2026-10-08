import { useEffect, useState } from "react";
import api from "../api";
import HeroSlider from "../components/HeroSlider";
import ProductCard from "../components/ProductCard";
import TestimonialCarousel from "../components/TestimonialCarousel";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/products")
      .then(({ data }) => setProducts(data))
      .catch(() => setError("Could not load terrariums"))
      .finally(() => setLoading(false));
  }, []);

  // The hero photo uses your newest terrarium image
  //const heroImage = products[0]?.image?.url;

  return (
    <>
      {/* 1. HERO */}
            {/* 1. HERO SLIDER */}
      <HeroSlider products={products} />

      {/* 2. HIGHLIGHTS */}
      <section className="features">
        <div><span>🪴</span><b>Handcrafted</b><small>Made fresh for every order</small></div>
        <div><span>🎨</span><b>Fully Customisable</b><small>Size, container and plants</small></div>
        <div><span>🚚</span><b>Delivery or Pickup</b><small>Whichever suits you</small></div>
        <div><span>🔒</span><b>Secure Payment</b><small>Card or Cash on Delivery</small></div>
      </section>

      {/* 3. PRODUCTS */}
      <div className="page" id="terrariums">
        <div className="section-head">
          <h2>Our Terrariums</h2>
          <p>Pick your favourite, then make it your own.</p>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && products.length === 0 && <p>No terrariums yet.</p>}

        <div className="grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>

      {/* 4. HOW IT WORKS */}
      <section className="how" id="how">
        <div className="section-head">
          <h2>How It Works</h2>
          <p>Three simple steps to your own mini garden.</p>
        </div>
        <div className="steps">
          <div className="step">
            <span className="step-no">1</span>
            <h3>Choose</h3>
            <p>Browse our terrariums and pick the one you love.</p>
          </div>
          <div className="step">
            <span className="step-no">2</span>
            <h3>Customise</h3>
            <p>Select the size, container, plants and add a gift message.</p>
          </div>
          <div className="step">
            <span className="step-no">3</span>
            <h3>Receive</h3>
            <p>Pay by card or cash, and get it delivered or collect it.</p>
          </div>
        </div>
      </section>

      {/* 5. CUSTOMER FEEDBACK */}
      <section className="reviews">
        <div className="section-head">
          <h2>What Our Customers Say</h2>
          <p>Happy plant parents, one jar at a time.</p>
        </div>
        <TestimonialCarousel />
      </section>

      {/* 6. FINAL CALL TO ACTION */}
      <section className="cta">
        <h2>Ready to create your own terrarium?</h2>
        <p>Start with a base design and make it truly yours.</p>
        <a href="#terrariums" className="btn-link light">Start Shopping</a>
      </section>
    </>
  );
}
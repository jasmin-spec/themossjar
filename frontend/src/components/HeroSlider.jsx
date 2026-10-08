import { useEffect, useState } from "react";

const slides = [
  {
    badge: "🌿 Handcrafted in small batches",
    title: "Bring a little forest home with The Moss Jar",
    text: "Beautiful living terrariums, made with moss, stones and love.",
    cta: "Shop Terrariums",
    link: "#terrariums",
  },
  {
    badge: "🎨 Made your way",
    title: "Design your own terrarium",
    text: "Choose the size, container, plants, theme, miniatures and sculptures.",
    cta: "Start Customising",
    link: "#terrariums",
  },
  {
    badge: "🎁 The perfect gift",
    title: "Gift a tiny green world",
    text: "Add a personal gift message and we will pack it with care.",
    cta: "Browse Gifts",
    link: "#terrariums",
  },
  {
    badge: "🚚 Easy ordering",
    title: "Delivered to your door",
    text: "Pay by card or Cash on Delivery, or collect it from our store for free.",
    cta: "How It Works",
    link: "#how",
  },
];

export default function HeroSlider({ products = [] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Photos from your products (only those that have an image)
  const photos = products.map((p) => p.image?.url).filter(Boolean);

  // Auto slide every 6 seconds (not while the mouse is over it)
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [paused]);

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <section
      className="hs"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => {
        const photo = photos.length ? photos[i % photos.length] : null;
        return (
          <div
            key={s.title}
            className={i === index ? "hs-slide active" : "hs-slide"}
            style={photo ? { backgroundImage: `url(${photo})` } : undefined}
          >
            <div className="hs-overlay" />
            <div className="hs-content">
              <span className="hs-badge">{s.badge}</span>
              <h1>{s.title}</h1>
              <p>{s.text}</p>
              <div className="hs-buttons">
                <a href={s.link} className="hs-btn solid">{s.cta}</a>
                <a href="#how" className="hs-btn outline">How it works</a>
              </div>
            </div>
          </div>
        );
      })}

      <button className="hs-arrow left" onClick={prev} aria-label="Previous slide">‹</button>
      <button className="hs-arrow right" onClick={next} aria-label="Next slide">›</button>

      <div className="hs-dots">
        {slides.map((s, i) => (
          <span
            key={s.title}
            className={i === index ? "hs-dot active" : "hs-dot"}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
import { useEffect, useState } from "react";

const slides = [
  {
    badge: "Handcrafted in small batches",
    title: "Bring a little forest home with The Moss Jar",
    accent: "forest",
    text: "Beautiful living terrariums, made with moss, stones and love.",
    cta: "Shop Terrariums",
    link: "#terrariums",
  },
  {
    badge: "Made your way",
    title: "Design your own terrarium",
    accent: "own",
    text: "Choose the size, container, plants, theme, miniatures and sculptures.",
    cta: "Start Customising",
    link: "#terrariums",
  },
  {
    badge: "The perfect gift",
    title: "Gift a tiny green world",
    accent: "tiny green world",
    text: "Add a personal gift message and we will pack it with care.",
    cta: "Browse Gifts",
    link: "#terrariums",
  },
  {
    badge: "Easy ordering",
    title: "Delivered to your door",
    accent: "your door",
    text: "Order on WhatsApp, pay on delivery, or collect it from our store for free.",
    cta: "How It Works",
    link: "#how",
  },
];

// Puts one word of the headline in italic
const renderTitle = (s) => {
  if (!s.accent || !s.title.includes(s.accent)) return s.title;
  const [before, after] = s.title.split(s.accent);
  return (
    <>
      {before}
      <em>{s.accent}</em>
      {after}
    </>
  );
};

const two = (n) => String(n).padStart(2, "0");

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
      className="hx"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, i) => {
        const photo = photos.length ? photos[i % photos.length] : null;
        return (
          <div key={s.title} className={i === index ? "hx-slide active" : "hx-slide"}>
            <div className="hx-media">
              {photo && <img src={photo} alt="" />}
            </div>
            <div className="hx-shade" />

            <div className="hx-inner">
              <div className="hx-copy">
                <span className="hx-eyebrow">{s.badge}</span>
                <h1>{renderTitle(s)}</h1>
                <p>{s.text}</p>
                <div className="hx-buttons">
                  <a href={s.link} className="hx-btn solid">{s.cta}</a>
                  <a href="#how" className="hx-btn ghost">How it works</a>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div className="hx-controls">
        <span className="hx-count">
          <b>{two(index + 1)}</b>
          <i />
          {two(slides.length)}
        </span>

        <div className="hx-dots">
          {slides.map((s, i) => (
            <span
              key={s.title}
              className={i === index ? "hx-dot active" : "hx-dot"}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>

        <div className="hx-arrows">
          <button type="button" onClick={prev} aria-label="Previous slide">‹</button>
          <button type="button" onClick={next} aria-label="Next slide">›</button>
        </div>
      </div>
    </section>
  );
}
import { useEffect, useState } from "react";

// SAMPLE reviews. Replace them with real feedback from your customers.
const reviews = [
  {
    name: "Aysha Eza.",
    place: "Abu Dhabi",
    text: "I ordered a medium terrarium as a birthday gift and my sister loved it. The gift message was a lovely touch, and it arrived perfectly packed.",
  },
  {
    name: "Laira Hezlin",
    place: "Abudhabi",
    text: "Being able to choose the container and plants myself made it feel truly personal. It looks beautiful on my office desk.",
  },
  {
    name: "Yuaan Erhan",
    place: "Sharjah",
    text: "Easy ordering, quick delivery, and the moss has stayed fresh for weeks. I'm already planning my second one.",
  },
  {
    name: "Amina Nashmiya",
    place: "Al Ain",
    text: "Great quality and very neat work. The geometric glass option is stunning. Highly recommended!",
  },
];

export default function TestimonialCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Slide to the next review every 5 seconds (unless the mouse is over it)
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % reviews.length),
      5000
    );
    return () => clearInterval(timer); // cleanup when the page closes
  }, [paused]);

  const prev = () => setIndex((i) => (i - 1 + reviews.length) % reviews.length);
  const next = () => setIndex((i) => (i + 1) % reviews.length);

  return (
    <div
      className="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button className="car-btn left" onClick={prev} aria-label="Previous review">‹</button>

      <div className="car-window">
        {/* The track holds all slides side by side and slides left/right */}
        <div className="car-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {reviews.map((r) => (
            <div className="car-slide" key={r.name}>
              <div className="review-card">
                <div className="stars">★★★★★</div>
                <p className="review-text">“{r.text}”</p>
                <div className="review-author">
                  <span className="avatar">{r.name[0]}</span>
                  <div>
                    <b>{r.name}</b>
                    <small>{r.place}</small>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button className="car-btn right" onClick={next} aria-label="Next review">›</button>

      <div className="dots">
        {reviews.map((r, i) => (
          <span
            key={r.name}
            className={i === index ? "dot active" : "dot"}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
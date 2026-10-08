// Extra cost (AED) added to the base product price
const SIZE_EXTRA = { small: 0, medium: 30, large: 60 };

const CONTAINER_EXTRA = { "glass jar": 0, "round bowl": 15, "geometric glass": 35 };

const PLANT_OPTIONS = ["succulent", "cactus", "moss", "fern", "air plant"];
const PLANT_PRICE = 8; // each plant selected

// One theme per terrarium (sets the scene: sand, stones, colours)
const THEME_EXTRA = {
  none: 0,
  "fairy garden": 20,
  "japanese zen": 20,
  "beach": 15,
  "desert": 15,
  "jurassic": 20,
  "enchanted forest": 25,
};

// Small figures and items (price each, max 5)
const MINIATURE_PRICES = {
  "fairy house": 18,
  "stone lantern": 12,
  "mini bridge": 15,
  "garden gnome": 14,
  "tiny bench": 10,
  "mushroom set": 12,
  "mini animals": 16,
  "tiny dinosaur": 16,
};

// Larger decorative pieces (price each, max 2)
const SCULPTURE_PRICES = {
  "resin buddha": 35,
  "dragon sculpture": 40,
  "mini tree sculpture": 30,
  "stone owl": 28,
  "driftwood arch": 25,
};

const MAX_MINIATURES = 5;
const MAX_SCULPTURES = 2;

const DELIVERY_FEE = { delivery: 15, pickup: 0 };

module.exports = {
  SIZE_EXTRA, CONTAINER_EXTRA, PLANT_OPTIONS, PLANT_PRICE,
  THEME_EXTRA, MINIATURE_PRICES, SCULPTURE_PRICES,
  MAX_MINIATURES, MAX_SCULPTURES, DELIVERY_FEE,
};
// Extra cost (AED) added to the base product price
const SIZE_EXTRA = { small: 0, medium: 30, large: 60 };

const CONTAINER_EXTRA = { "glass jar": 0, "round bowl": 15, "geometric glass": 35 };

const PLANT_OPTIONS = ["succulent", "cactus", "moss", "fern", "air plant"];
const PLANT_PRICE = 8; // each plant selected

const DELIVERY_FEE = { delivery: 15, pickup: 0 };

module.exports = { SIZE_EXTRA, CONTAINER_EXTRA, PLANT_OPTIONS, PLANT_PRICE, DELIVERY_FEE };
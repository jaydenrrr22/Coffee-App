export const ROASTS = [
  {
    key: "light",
    label: "Light Roast",
    route: "/roasts/light",
    flavorNotes: ["Floral", "Citrus", "Berry", "Tea-like"],
    brewing: [
      "Pour-over (V60, Kalita) at 200–205°F to highlight acidity",
      "AeroPress with a short steep for a bright, clean cup",
      "Use a slightly finer grind than usual; light beans are dense",
    ],
    description:
      'Light roasts are removed from the roaster immediately after the first crack when the internal temperature reaches approximately 350°F–400°F. These beans are light brown with a matte, dry surface because they have not been heated long enough for internal oils to break through the surface. This roast is celebrated for preserving the "origin flavors" or terroir of the bean, resulting in a vibrant, highly acidic cup with delicate floral, citrus, or fruity notes.',
  },
  {
    key: "medium",
    label: "Medium Roast",
    route: "/roasts/medium",
    flavorNotes: ["Caramel", "Milk chocolate", "Nutty", "Balanced"],
    brewing: [
      "Drip machine or Chemex for an everyday, well-rounded cup",
      "French press for more body and sweetness",
      "Works well as a single-origin espresso",
    ],
    description:
      "Medium roasts are characterized by a richer brown color and reach temperatures between 410°F–428°F, typically ending just before the second crack begins. They strike a harmonious balance between the beans natural characteristics and the sweetness developed during roasting, such as caramel and chocolate undertones. This level is often the most popular due to its smooth, well-rounded body and moderate acidity, making it highly versatile for various brewing methods.",
  },
  {
    key: "medium-dark",
    label: "Medium Dark Roast",
    route: "/roasts/medium-dark",
    flavorNotes: ["Bittersweet", "Spice", "Dark chocolate", "Heavy body"],
    brewing: [
      "Espresso and milk drinks (latte, cortado)",
      "Moka pot for a strong stovetop brew",
      "Brew slightly cooler (195–200°F) to avoid bitterness",
    ],
    description:
      'Medium-dark roasts, often called "Full City," are roasted until the second crack is heard, reaching temperatures around 420°F–432°F. The beans exhibit a deep, rich brown color with small droplets of oil beginning to appear on the surface. This roast offers a heavier body and a spicy or bittersweet aftertaste, with the original acidity of the bean significantly reduced in favor of a bolder, "roastier" profile.',
  },
  {
    key: "dark",
    label: "Dark Roast",
    route: "/roasts/dark",
    flavorNotes: ["Smoky", "Roasted nuts", "Low acidity", "Bold"],
    brewing: [
      "Espresso, especially for milk-based drinks",
      "Cold brew for a smooth, low-acid result",
      "Use a coarser grind and lower temperature to tame bitterness",
    ],
    description:
      "Dark roasts are roasted well past the second crack, reaching high temperatures of 430°F–450°F, which causes the beans to become nearly black and very oily. The roasting process almost entirely replaces the beans original flavors with intense, smoky, and charred notes similar to dark chocolate or toasted nuts. These roasts are preferred for their robust, full-bodied texture and low acidity, making them ideal for espresso and milk-based drinks.",
  },
];

export const ORIGINS = [
  "Ethiopia",
  "Kenya",
  "Colombia",
  "Brazil",
  "Guatemala",
  "Costa Rica",
  "Sumatra",
  "Blend",
];

export const BREW_METHODS = [
  "Espresso",
  "Pour-over",
  "Drip",
  "French press",
  "Cold brew",
  "AeroPress",
];

export const getRoast = (key) => ROASTS.find((roast) => roast.key === key);

export const roastLabel = (key) => getRoast(key)?.label ?? key;

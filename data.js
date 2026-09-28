// Data layer: the UI only calls CoffeeData. To go live, replace getShops() with a fetch to your backend
// (which calls Google Places API server-side). The shop object shape stays the same.
window.CoffeeData = {
  mode: () => window.COFFEE_DATA_MODE || "demo",
  async getShops() { return window.SHOPS || []; }
};

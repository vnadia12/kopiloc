// DEMO DATA. Not real ratings, hours or addresses. Unknown values are null (never invented).
window.COFFEE_DATA_MODE = "demo";
window.SHOPS = [
  { id: 1, name: "Sample Roasters", area: "Central", address: "Jl. Contoh No. 1", lat: -6.2000, lng: 106.8166,
    rating: { value: 4.6, count: 120, source: "Demo" }, priceLevel: 2,
    hours: { open: "08:00", close: "22:00" }, phone: null, website: null, instagram: null, photos: [],
    categories: ["Specialty coffee", "Café"], amenities: ["wifi", "outlet"],
    menu: [{ item: "Espresso", price: "18k" }, { item: "Flat white", price: "32k" }],
    sources: [{ name: "Demo data", url: null }] },
  { id: 2, name: "Sample Corner Cafe", area: "North", address: "Jl. Contoh No. 2", lat: -6.1900, lng: 106.8300,
    rating: { value: 4.3, count: 58, source: "Demo" }, priceLevel: 1,
    hours: { open: "07:00", close: "18:00" }, phone: null, website: null, instagram: null, photos: [],
    categories: ["Café"], amenities: ["wifi"],
    menu: [{ item: "Kopi susu", price: "22k" }],
    sources: [{ name: "Demo data", url: null }] },
  { id: 3, name: "Sample Late Night Coffee", area: "South", address: "Jl. Contoh No. 3", lat: -6.2200, lng: 106.8000,
    rating: null, priceLevel: 2,
    hours: { open: "16:00", close: "02:00" }, phone: null, website: null, instagram: null, photos: [],
    categories: ["Espresso"], amenities: [],
    menu: [{ item: "Americano", price: "20k" }],
    sources: [{ name: "Demo data", url: null }] }
];

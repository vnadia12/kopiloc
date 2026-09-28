// Sample data. Replace with your real shops (later: load from your backend/database).
// hours: 24h "HH:MM". photo: image URL or local path (optional).
window.SHOPS = [
  {
    id: 1,
    name: "Sample Roasters",
    area: "Central",
    address: "Jl. Contoh No. 1",
    lat: -6.2000, lng: 106.8166,
    rating: 4.6,
    hours: { open: "08:00", close: "22:00" },
    wifi: true, outlet: true,
    photo: "",
    menu: [
      { item: "Espresso", price: "18k" },
      { item: "Flat white", price: "32k" },
      { item: "Manual brew V60", price: "38k" }
    ]
  },
  {
    id: 2,
    name: "Sample Corner Cafe",
    area: "North",
    address: "Jl. Contoh No. 2",
    lat: -6.1900, lng: 106.8300,
    rating: 4.3,
    hours: { open: "07:00", close: "18:00" },
    wifi: true, outlet: false,
    photo: "",
    menu: [
      { item: "Kopi susu", price: "22k" },
      { item: "Cold brew", price: "30k" }
    ]
  },
  {
    id: 3,
    name: "Sample Late Night Coffee",
    area: "South",
    address: "Jl. Contoh No. 3",
    lat: -6.2200, lng: 106.8000,
    rating: 4.1,
    hours: { open: "16:00", close: "02:00" },
    wifi: false, outlet: false,
    photo: "",
    menu: [
      { item: "Americano", price: "20k" },
      { item: "Caramel latte", price: "34k" }
    ]
  }
];

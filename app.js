(async function () {
  const $ = (id) => document.getElementById(id);
  const state = { q: "", wifi: false, outlet: false, open: false, sort: "default", pos: null, activeId: null, savedOnly: false };
  const KEY = "coffeenearby.saved";
  let saved = new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
  const markers = {};
  let shops = [];

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const isOpen = (s) => {
    if (!s.hours) return null;
    const n = new Date(), cur = n.getHours() * 60 + n.getMinutes(), o = toMin(s.hours.open), c = toMin(s.hours.close);
    return o <= c ? cur >= o && cur < c : cur >= o || cur < c;
  };
  const km = (a, b) => {
    const r = Math.PI / 180, dl = (b.lat - a.lat) * r, dg = (b.lng - a.lng) * r;
    const h = Math.sin(dl / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dg / 2) ** 2;
    return 12742 * Math.asin(Math.sqrt(h));
  };
  const toast = (msg) => { const t = $("toast"); t.textContent = msg; t.classList.add("show"); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 2200); };
  const rating = (s) => s.rating
    ? `<span class="rating">★ ${esc(s.rating.value)}</span> <span class="src">${esc(s.rating.count)} reviews · ${esc(s.rating.source)}</span>`
    : `<span class="src">No rating available</span>`;
  const dirUrl = (s) => `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`;

  $("list").innerHTML = '<p class="empty">Loading coffee shops…</p>';
  try { shops = await CoffeeData.getShops(); }
  catch (e) { $("list").innerHTML = '<p class="empty">Could not load coffee shops. Check your connection and reload.</p>'; return; }
  if (CoffeeData.mode() === "demo") $("demoBanner").hidden = false;

  const map = L.map("map").setView([shops[0]?.lat || 0, shops[0]?.lng || 0], 12);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "&copy; OpenStreetMap contributors" }).addTo(map);
  const layer = L.layerGroup().addTo(map);

  function visible() {
    const q = state.q.trim().toLowerCase();
    let out = shops.filter((s) =>
      (!q || (s.name + " " + s.area + " " + s.address + " " + (s.categories || []).join(" ")).toLowerCase().includes(q)) &&
      (!state.wifi || s.amenities.includes("wifi")) && (!state.outlet || s.amenities.includes("outlet")) &&
      (!state.open || isOpen(s)) && (!state.savedOnly || saved.has(s.id)));
    out = out.map((s) => ({ ...s, dist: state.pos ? km(state.pos, s) : null }));
    const by = { nearest: (a, b) => (a.dist ?? 1e9) - (b.dist ?? 1e9), rating: (a, b) => (b.rating?.value ?? -1) - (a.rating?.value ?? -1),
      reviews: (a, b) => (b.rating?.count ?? -1) - (a.rating?.count ?? -1), open: (a, b) => (isOpen(b) ? 1 : 0) - (isOpen(a) ? 1 : 0) };
    if (by[state.sort]) out.sort(by[state.sort]);
    return out;
  }

  function select(id, fly) {
    state.activeId = id;
    document.querySelectorAll(".card").forEach((c) => c.classList.toggle("active", +c.dataset.id === id));
    Object.entries(markers).forEach(([k, m]) => m._icon && m._icon.classList.toggle("sel", +k === id));
    const s = shops.find((x) => x.id === id);
    if (fly && s) map.flyTo([s.lat, s.lng], Math.max(map.getZoom(), 15));
    const card = document.querySelector(`.card[data-id="${id}"]`);
    if (card && !fly) card.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  function render() {
    const items = visible();
    $("count").textContent = items.length + (items.length === 1 ? " place" : " places");
    $("savedCount").textContent = saved.size;
    layer.clearLayers();
    Object.keys(markers).forEach((k) => delete markers[k]);
    const list = $("list");
    list.innerHTML = items.length ? "" : `<p class="empty">${state.savedOnly ? "You haven't saved any coffee shops yet." : "No coffee shops match. Try removing a filter or searching another area."}</p>`;

    items.forEach((s) => {
      const m = L.marker([s.lat, s.lng]).addTo(layer);
      m.bindTooltip(s.name);
      m.on("click", () => select(s.id, false));
      markers[s.id] = m;

      const open = isOpen(s);
      const card = document.createElement("div");
      card.className = "card"; card.dataset.id = s.id;
      card.innerHTML =
        `<div class="thumb"></div><div class="main"><h3>${esc(s.name)}</h3>` +
        `<p>${rating(s)}</p><p>${esc(s.categories.join(" · "))}</p>` +
        `<p>${esc(s.area)}${s.dist != null ? " · " + s.dist.toFixed(1) + " km away" : ""}</p>` +
        (open === null ? "" : `<span class="tag">${open ? "Open now · closes " + esc(s.hours.close) : "Closed · opens " + esc(s.hours.open)}</span>`) +
        (s.amenities.includes("wifi") ? '<span class="tag">Wifi</span>' : "") + (s.amenities.includes("outlet") ? '<span class="tag">Outlets</span>' : "") +
        `</div><div class="actions"><button type="button" data-a="details">View details</button>` +
        `<a href="${dirUrl(s)}" target="_blank" rel="noopener">Get directions</a>` +
        `<button type="button" data-a="save" class="${saved.has(s.id) ? "saved" : ""}">${saved.has(s.id) ? "Saved" : "Save"}</button></div>`;
      card.querySelector(".main").addEventListener("click", () => select(s.id, true));
      card.querySelector('[data-a="details"]').addEventListener("click", () => openDetail(s));
      card.querySelector('[data-a="save"]').addEventListener("click", () => toggleSave(s));
      list.appendChild(card);
    });
    if (state.activeId) select(state.activeId, false);
  }

  function toggleSave(s) {
    if (saved.has(s.id)) { saved.delete(s.id); toast("Removed from saved"); } else { saved.add(s.id); toast("Saved " + s.name); }
    localStorage.setItem(KEY, JSON.stringify([...saved]));
    render();
    if ($("detail").open) openDetail(s);
  }

  function openDetail(s) {
    const open = isOpen(s), row = (k, v) => `<dt>${k}</dt><dd>${v || '<span class="src">Not available</span>'}</dd>`;
    const link = (u) => (u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a>` : "");
    $("detailBody").innerHTML =
      `<div class="hero-img"></div><div class="body"><h2>${esc(s.name)}</h2><p>${rating(s)}</p>` +
      `<dl>${row("Address", esc(s.address) + ", " + esc(s.area))}${row("Hours", s.hours ? esc(s.hours.open) + "–" + esc(s.hours.close) + (open ? " (open now)" : " (closed)") : "")}` +
      `${row("Price", s.priceLevel ? "$".repeat(s.priceLevel) : "")}${row("Phone", esc(s.phone))}${row("Website", link(s.website))}` +
      `${row("Instagram", s.instagram ? link("https://instagram.com/" + s.instagram) : "")}${row("Amenities", esc(s.amenities.join(", ")))}` +
      `${row("Sources", esc(s.sources.map((x) => x.name).join(", ")))}</dl>` +
      `<h4>Menu</h4><ul>${s.menu.map((m) => `<li><span>${esc(m.item)}</span><span>${esc(m.price)}</span></li>`).join("")}</ul>` +
      `<div class="links"><a href="${dirUrl(s)}" target="_blank" rel="noopener">Get directions</a>` +
      `<button class="btn" id="dSave" type="button">${saved.has(s.id) ? "Remove from saved" : "Save"}</button></div></div>`;
    $("dSave").addEventListener("click", () => toggleSave(s));
    if (!$("detail").open) $("detail").showModal();
  }

  $("closeDetail").addEventListener("click", () => $("detail").close());
  $("detail").addEventListener("click", (e) => { if (e.target === $("detail")) $("detail").close(); });
  $("search").addEventListener("input", (e) => { state.q = e.target.value; render(); fit(); });
  $("sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });
  [["fWifi", "wifi"], ["fOutlet", "outlet"], ["fOpen", "open"]].forEach(([id, k]) => $(id).addEventListener("change", (e) => { state[k] = e.target.checked; render(); fit(); }));
  $("savedNav").addEventListener("click", (e) => { e.preventDefault(); state.savedOnly = !state.savedOnly; toast(state.savedOnly ? "Showing saved only" : "Showing all"); render(); fit(); });
  document.querySelectorAll(".views button").forEach((b) => b.addEventListener("click", () => {
    $("layout").dataset.view = b.dataset.view;
    document.querySelectorAll(".views button").forEach((x) => x.setAttribute("aria-pressed", x === b));
    setTimeout(() => map.invalidateSize(), 50);
  }));

  $("nearBtn").addEventListener("click", () => {
    if (!navigator.geolocation) return toast("Location is not supported in this browser.");
    navigator.geolocation.getCurrentPosition((p) => {
      state.pos = { lat: p.coords.latitude, lng: p.coords.longitude };
      if (state.sort === "default") { state.sort = "nearest"; $("sort").value = "nearest"; }
      L.circleMarker([state.pos.lat, state.pos.lng], { radius: 8 }).addTo(map).bindTooltip("You are here");
      map.setView([state.pos.lat, state.pos.lng], 14); render(); toast("Using your location");
    }, () => toast("Location blocked. Allow location access in your browser, or search by area."));
  });

  function fit() {
    const pts = visible().map((s) => [s.lat, s.lng]);
    if (pts.length) map.fitBounds(pts, { padding: [40, 40], maxZoom: 15 });
  }
  render(); fit();
})();

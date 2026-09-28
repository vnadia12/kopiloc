(function () {
  const shops = window.SHOPS || [];
  const $ = (id) => document.getElementById(id);
  const state = { q: "", wifi: false, outlet: false, open: false, pos: null, activeId: null };

  const map = L.map("map").setView([shops[0]?.lat || 0, shops[0]?.lng || 0], 12);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);
  const markers = L.layerGroup().addTo(map);

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function km(a, b) {
    const r = Math.PI / 180, R = 6371;
    const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function toMin(t) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
  function isOpen(s) {
    if (!s.hours) return false;
    const now = new Date(), cur = now.getHours() * 60 + now.getMinutes();
    const o = toMin(s.hours.open), c = toMin(s.hours.close);
    return o <= c ? cur >= o && cur < c : cur >= o || cur < c; // handles past-midnight
  }

  function visible() {
    const q = state.q.trim().toLowerCase();
    let out = shops.filter((s) =>
      (!q || (s.name + " " + s.area + " " + s.address).toLowerCase().includes(q)) &&
      (!state.wifi || s.wifi) && (!state.outlet || s.outlet) && (!state.open || isOpen(s)));
    if (state.pos) {
      out = out.map((s) => ({ ...s, dist: km(state.pos, s) })).sort((a, b) => a.dist - b.dist);
    }
    return out;
  }

  function render() {
    const items = visible();
    $("count").textContent = items.length + (items.length === 1 ? " place" : " places");
    markers.clearLayers();
    const list = $("list");
    list.innerHTML = items.length ? "" : '<p class="empty">No coffee shops match. Try removing a filter.</p>';

    items.forEach((s) => {
      const m = L.marker([s.lat, s.lng]).addTo(markers);
      m.bindTooltip(s.name);
      m.on("click", () => openDetail(s));

      const card = document.createElement("button");
      card.type = "button";
      card.className = "card" + (s.id === state.activeId ? " active" : "");
      const bg = s.photo ? ` style="background-image:url('${esc(s.photo)}')"` : "";
      card.innerHTML =
        `<div class="thumb"${bg}></div><div><h3>${esc(s.name)}</h3>` +
        `<p>${esc(s.area)}${s.dist != null ? " · " + s.dist.toFixed(1) + " km" : ""} · ★ ${esc(s.rating)}</p>` +
        `<span class="tag">${isOpen(s) ? "Open now" : "Closed"}</span>` +
        (s.wifi ? '<span class="tag">Wifi</span>' : "") +
        (s.outlet ? '<span class="tag">Outlets</span>' : "") + "</div>";
      card.addEventListener("click", () => { map.flyTo([s.lat, s.lng], 16); openDetail(s); });
      list.appendChild(card);
    });

    if (items.length && !state.pos) {
      map.fitBounds(items.map((s) => [s.lat, s.lng]), { padding: [40, 40], maxZoom: 15 });
    }
  }

  function openDetail(s) {
    state.activeId = s.id;
    const gmaps = `https://www.google.com/maps/search/?api=1&query=${s.lat},${s.lng}`;
    const bg = s.photo ? ` style="background-image:url('${esc(s.photo)}')"` : "";
    $("detailBody").innerHTML =
      `<div class="hero"${bg}></div><div class="body">` +
      `<h2>${esc(s.name)}</h2><p>${esc(s.address)}, ${esc(s.area)}</p>` +
      `<p>★ ${esc(s.rating)} · ${esc(s.hours.open)}–${esc(s.hours.close)} · ${isOpen(s) ? "Open now" : "Closed"}</p>` +
      `<h4>Menu</h4><ul>${(s.menu || []).map((m) => `<li><span>${esc(m.item)}</span><span>${esc(m.price)}</span></li>`).join("")}</ul>` +
      `<div class="links"><a href="${gmaps}" target="_blank" rel="noopener">Open in Google Maps</a></div></div>`;
    $("detail").showModal();
    render();
  }

  $("closeDetail").addEventListener("click", () => $("detail").close());
  $("detail").addEventListener("click", (e) => { if (e.target === $("detail")) $("detail").close(); });
  $("search").addEventListener("input", (e) => { state.q = e.target.value; render(); });
  [["fWifi", "wifi"], ["fOutlet", "outlet"], ["fOpen", "open"]].forEach(([id, key]) =>
    $(id).addEventListener("change", (e) => { state[key] = e.target.checked; render(); }));

  $("nearBtn").addEventListener("click", () => {
    const btn = $("nearBtn");
    if (state.pos) { state.pos = null; btn.setAttribute("aria-pressed", "false"); return render(); }
    if (!navigator.geolocation) return alert("Location is not supported in this browser.");
    navigator.geolocation.getCurrentPosition((p) => {
      state.pos = { lat: p.coords.latitude, lng: p.coords.longitude };
      btn.setAttribute("aria-pressed", "true");
      L.circleMarker([state.pos.lat, state.pos.lng], { radius: 8 }).addTo(map).bindTooltip("You are here");
      render();
      map.setView([state.pos.lat, state.pos.lng], 14);
    }, () => alert("Could not get your location. Allow location access and try again."));
  });

  render();
})();

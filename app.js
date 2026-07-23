const $ = (s) => document.querySelector(s);

// ── Helpers ──
const fmtCurrency = (v) => !v && v !== 0 ? "--" : new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(v);
const fmtNumber = (v) => !v && v !== 0 ? "--" : new Intl.NumberFormat("es-CO").format(v);
const fmtShort = (v) => {
  if (!v && v !== 0) return "--";
  return `$ ${fmtNumber(v)}`;
};

// ── Lightbox ──
let lbImages = [], lbIdx = 0;

function lbOpen(i) {
  lbIdx = i; lbUpdate(); lbRenderThumbs();
  $("#lightbox").classList.remove("hidden"); $("#lightbox").classList.add("flex");
  document.body.style.overflow = "hidden";
}
function lbClose() {
  $("#lightbox").classList.add("hidden"); $("#lightbox").classList.remove("flex");
  document.body.style.overflow = "";
}
function lbUpdate() {
  if (!lbImages.length) return;
  $("#lb-img").src = lbImages[lbIdx];
  $("#lb-counter").textContent = `${lbIdx + 1} / ${lbImages.length}`;
  const thumbs = document.querySelectorAll("#lb-thumbs > div");
  thumbs.forEach((t, idx) => {
    t.classList.toggle("ring-2", idx === lbIdx);
    t.classList.toggle("ring-white", idx === lbIdx);
    t.classList.toggle("opacity-40", idx !== lbIdx);
    t.classList.toggle("opacity-100", idx === lbIdx);
  });
  const active = document.querySelector(`#lb-thumbs > div:nth-child(${lbIdx + 1})`);
  if (active) active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
}
function lbNav(dir) { lbIdx = (lbIdx + dir + lbImages.length) % lbImages.length; lbUpdate(); }
function lbRenderThumbs() {
  const c = $("#lb-thumbs"); c.innerHTML = "";
  lbImages.forEach((src, i) => {
    const div = document.createElement("div");
    div.className = `flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden cursor-pointer transition-all ${i === lbIdx ? "ring-2 ring-white opacity-100" : "opacity-40 hover:opacity-70"}`;
    div.innerHTML = `<img src="${src}" alt="" class="w-full h-full object-cover"/>`;
    div.onclick = () => { lbIdx = i; lbUpdate(); };
    c.appendChild(div);
  });
}
function initLightbox() {
  $("#lb-close").onclick = lbClose;
  $("#lb-prev").onclick = () => lbNav(-1);
  $("#lb-next").onclick = () => lbNav(1);
  $("#lightbox").onclick = (e) => { if (e.target === $("#lightbox")) lbClose(); };
  document.addEventListener("keydown", (e) => {
    if ($("#lightbox").classList.contains("hidden")) return;
    if (e.key === "Escape") lbClose();
    if (e.key === "ArrowRight") lbNav(1);
    if (e.key === "ArrowLeft") lbNav(-1);
  });
  let touchStartX = 0;
  const img = $("#lb-img");
  img.addEventListener("touchstart", (e) => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  img.addEventListener("touchend", (e) => {
    const diff = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(diff) > 50) { diff < 0 ? lbNav(1) : lbNav(-1); }
  }, { passive: true });
}

// ── Gallery ──
function renderGallery(images, ui) {
  const grid = $("#gallery-grid");
  const thumbs = $("#gallery-thumbs");
  const mobileTrack = $("#gallery-mobile-track");
  const mobileCounter = $("#gallery-mobile-counter");
  const seeAllBtn = $("#gallery-see-all");
  const seeAllText = $("#gallery-see-all-text");
  const hero = $("#hero-image");

  const imgs = images.length ? images.map((f) => f.startsWith("http") ? f : `images/${f}`) : [];
  lbImages = imgs;

  if (hero && imgs.length) hero.src = imgs[0];
  if (!imgs.length) { grid.innerHTML = `<div class="g-main bg-border-light flex items-center justify-center text-on-surface-muted rounded-2xl">${ui.sin_imagenes}</div>`; return; }

  // Desktop Grid
  grid.innerHTML = "";
  const slots = Math.min(5, imgs.length);
  for (let i = 0; i < slots; i++) {
    const div = document.createElement("div");
    div.className = i === 0 ? "g-main relative cursor-pointer overflow-hidden" : "g-secondary relative cursor-pointer overflow-hidden";
    div.innerHTML = `<img src="${imgs[i]}" alt=""/>`;
    if (i === slots - 1 && imgs.length > 5) {
      div.innerHTML += `<div class="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-black/60 transition-colors"><div class="text-center text-white"><span class="material-symbols-outlined text-3xl">grid_view</span><p class="font-bold mt-1">+${imgs.length - 5} ${ui.galeria_fotos}</p></div></div>`;
    }
    if (i === 0) {
      div.innerHTML += `<div class="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5"><span class="material-symbols-outlined text-[14px]">photo_library</span>${imgs.length} ${ui.galeria_fotos}</div>`;
    }
    div.onclick = () => lbOpen(i === slots - 1 && imgs.length > 5 ? 4 : i);
    grid.appendChild(div);
  }

  // Mobile
  mobileTrack.innerHTML = "";
  imgs.forEach((src, i) => {
    const div = document.createElement("div");
    div.innerHTML = `<img src="${src}" alt=""/>`;
    div.onclick = () => lbOpen(i);
    mobileTrack.appendChild(div);
  });
  if (mobileCounter) {
    mobileCounter.textContent = `1 / ${imgs.length}`;
    mobileTrack.addEventListener("scroll", () => {
      const idx = Math.round(mobileTrack.scrollLeft / mobileTrack.offsetWidth) + 1;
      mobileCounter.textContent = `${idx} / ${imgs.length}`;
    });
  }

  // Desliza label
  const deslizaEl = $("#gallery-desliza-label");
  if (deslizaEl) deslizaEl.textContent = `· ${ui.galeria_desliza}`;

  // Thumbs (remaining images, fill width)
  thumbs.innerHTML = "";
  const thumbStart = Math.min(5, imgs.length);
  const remaining = imgs.length - thumbStart;
  if (remaining > 0) {
    thumbs.style.display = "grid";
    thumbs.style.gridTemplateColumns = `repeat(${remaining}, 1fr)`;
    thumbs.style.gap = "6px";
    for (let i = thumbStart; i < imgs.length; i++) {
      const t = document.createElement("div");
      t.className = "aspect-square rounded-lg overflow-hidden cursor-pointer border-2 border-transparent hover:border-brand/40 transition-all";
      t.innerHTML = `<img src="${imgs[i]}" alt="" class="w-full h-full object-cover"/>`;
      t.onclick = () => lbOpen(i);
      thumbs.appendChild(t);
    }
  }

  // See all
  if (seeAllText) seeAllText.textContent = ui.galeria_ver_todas.replace("{n}", imgs.length);
  if (seeAllBtn) seeAllBtn.onclick = () => lbOpen(0);
}

// ── Hero badges ──
function renderHeroBadges(p, ui) {
  const c = $("#hero-badges"); c.innerHTML = "";
  const labels = ui.ficha_labels || {};
  const items = [];
  if (p.area_privada) items.push({ icon: "square_foot", text: `${fmtNumber(p.area_privada)} m²` });
  if (p.habitaciones) items.push({ icon: "king_bed", text: `${p.habitaciones} ${labels.habitaciones || ""}` });
  if (p.banos) items.push({ icon: "bathtub", text: `${p.banos} ${labels.banos || ""}` });
  if (p.piso) items.push({ icon: "stairs", text: `${labels.piso || ""} ${p.piso}` });
  if (p.parqueaderos === 0) items.push({ icon: "no_crash", text: `${labels.parqueadero || ""}: ${ui.parqueadero_no}` });

  items.forEach(({ icon, text }) => {
    const div = document.createElement("div");
    div.className = "flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10";
    div.innerHTML = `<span class="material-symbols-outlined text-white text-[18px]">${icon}</span><span class="text-white font-semibold text-sm">${text}</span>`;
    c.appendChild(div);
  });
}

// ── Section titles ──
function renderSectionTitles(ui) {
  const set = (id, icon, text) => { const el = $(id); if (el) el.innerHTML = `<span class="material-symbols-outlined text-brand text-[22px]">${icon}</span>${text}`; };
  set("#sec-descripcion-title", "notes", ui.seccion_descripcion);
  set("#sec-destacados-title", "star", ui.seccion_destacados);
  set("#sec-ficha-title", "info", ui.seccion_ficha);
  set("#sec-gastos-title", "payments", ui.seccion_gastos);
  set("#sec-ubicacion-title-desktop", "location_on", ui.seccion_ubicacion);
  set("#sec-ubicacion-title-mobile", "location_on", ui.seccion_ubicacion);
  const setBtn = (id, text) => { const el = $(id); if (el) el.textContent = text; };
  setBtn("#map-btn-text-desktop", ui.mapa_boton);
  setBtn("#map-btn-text-mobile", ui.mapa_boton);
}

// ── Destacados ──
function renderHighlights(destacados, ui) {
  const c = $("#property-highlights"); c.innerHTML = "";
  if (!destacados || !destacados.length) { c.innerHTML = `<p class="text-on-surface-secondary text-sm">${ui.sin_destacados}</p>`; return; }
  destacados.forEach((d) => {
    const div = document.createElement("div");
    div.className = "flex gap-3 items-start p-3 rounded-xl bg-brand-surface border border-brand/10";
    div.innerHTML = `<span class="material-symbols-outlined text-brand shrink-0 text-[20px]">${d.icono}</span><div><p class="font-semibold text-on-surface text-sm">${d.titulo}</p><p class="text-on-surface-secondary text-xs mt-0.5">${d.detalle}</p></div>`;
    c.appendChild(div);
  });
}

// ── Ficha Técnica ──
function renderFicha(p, ui) {
  const c = $("#property-ficha"); c.innerHTML = "";
  const labels = ui.ficha_labels || {};
  const rows = [
    [labels.area, p.area_privada ? `${fmtNumber(p.area_privada)} m²` : null],
    [labels.habitaciones, p.habitaciones],
    [labels.banos, p.banos],
    [labels.estrato, p.estrato],
    [labels.piso, p.piso],
    [labels.parqueadero, p.parqueaderos === 0 ? ui.parqueadero_no : p.parqueaderos],
  ];
  rows.filter(([k, v]) => k && v != null).forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "flex justify-between py-2.5 border-b border-border-light last:border-b-0";
    row.innerHTML = `<span class="text-on-surface-secondary text-sm">${label}</span><span class="text-on-surface font-bold text-sm">${value}</span>`;
    c.appendChild(row);
  });
}

// ── Gastos ──
function renderGastos(servicios, ui) {
  const c = $("#property-gastos"); c.innerHTML = "";
  if (!servicios || !servicios.length) { c.innerHTML = `<p class="text-on-surface-secondary text-sm">${ui.sin_servicios}</p>`; return; }
  const names = ui.servicios_nombres || {};
  servicios.forEach((s) => {
    const div = document.createElement("div");
    div.className = "flex justify-between items-center bg-surface px-4 py-2.5 rounded-xl mb-2 last:mb-0";
    div.innerHTML = `<span class="text-on-surface-secondary text-sm">${names[s.servicio] || s.servicio}</span><span class="text-on-surface font-bold text-sm">${fmtShort(s.valor)}</span>`;
    c.appendChild(div);
  });
}

// ── Price ──
function renderPrice(p, ui) {
  const priceHtml = `<p class="text-on-surface text-[26px] font-display font-bold">${fmtCurrency(p.precio)}</p>${p.precio_anterior && p.precio_anterior > p.precio ? `<p class="text-on-surface-muted text-sm line-through mt-1">${fmtCurrency(p.precio_anterior)}</p><div class="mt-2 inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold"><span class="material-symbols-outlined text-[16px]">trending_down</span>${ui.descuento_label}</div>` : ""}`;
  const sidebar = $("#sidebar-price-card");
  if (sidebar) sidebar.innerHTML = `<p class="text-on-surface-muted text-xs uppercase tracking-widest mb-1">${ui.precio_label}</p>${priceHtml}`;
  const mobile = $("#price-mobile");
  if (mobile) mobile.innerHTML = priceHtml;
}

// ── Tour (desktop sidebar) ──
function renderSidebarTour(url360, ui) {
  const c = $("#sidebar-tour");
  if (!url360 || !c) return;
  c.classList.add("lg:block");
  c.innerHTML = `<div class="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center mx-auto mb-3"><span class="material-symbols-outlined text-brand text-[24px]">360</span></div><p class="font-display font-bold text-on-surface text-sm mb-0.5">${ui.tour_titulo}</p><p class="text-on-surface-secondary text-xs mb-4">${ui.tour_subtitulo}</p><a href="${url360}" target="_blank" rel="noopener" class="block w-full bg-brand text-white py-3 rounded-xl font-semibold text-sm hover:bg-brand-light transition-colors">${ui.tour_boton}</a>`;
}

// ── Tour mobile ──
function renderTourMobile(url360, ui) {
  const c = $("#tour-mobile");
  if (!url360 || !c) { if (c) c.style.display = "none"; return; }
  c.innerHTML = `<div class="flex items-center justify-center gap-3 mb-3"><div class="w-10 h-10 bg-brand/10 rounded-full flex items-center justify-center"><span class="material-symbols-outlined text-brand text-[22px]">360</span></div><div class="text-left"><p class="font-display font-bold text-on-surface text-sm">${ui.tour_titulo}</p><p class="text-on-surface-secondary text-xs">${ui.tour_subtitulo}</p></div></div><a href="${url360}" target="_blank" rel="noopener" class="block w-full bg-brand text-white py-3 rounded-xl font-semibold text-sm hover:bg-brand-light transition-colors">${ui.tour_boton}</a>`;
}

// ── Contact ──
function renderContact(p, ui) {
  const c = $("#sidebar-contact"); if (!c) return;
  const phone = p.telefono || "";
  const email = p.correo || "";
  const waHref = phone ? `https://wa.me/57${phone.replace(/\D/g, "")}` : "#";
  c.innerHTML = `<h3 class="text-base font-display font-bold mb-4 text-center">${ui.contacto_titulo}</h3><div class="flex flex-col gap-2.5"><a href="${phone ? 'tel:' + phone : '#'}" class="flex items-center justify-center gap-2 w-full py-3 bg-brand hover:bg-brand-light text-white rounded-xl font-semibold text-sm transition-colors"><span class="material-symbols-outlined text-[20px]">call</span>${phone ? ui.contacto_llamar + ' ' + phone : ui.contacto_llamar}</a><a href="${email ? 'mailto:' + email : '#'}" class="flex items-center justify-center gap-2 w-full py-3 bg-surface border border-border hover:bg-border-light text-on-surface rounded-xl font-semibold text-sm transition-colors"><span class="material-symbols-outlined text-[20px]">mail</span>${ui.contacto_correo}</a><a href="${waHref}" target="_blank" rel="noopener" class="flex items-center justify-center gap-2 w-full py-3 bg-whatsapp hover:bg-whatsapp/90 text-white rounded-xl font-semibold text-sm transition-colors"><span class="material-symbols-outlined text-[20px]">chat</span>${ui.contacto_whatsapp}</a></div>`;
}

// ── Map (Leaflet + CartoDB Positron) ──
function renderMap(p, ui) {
  const address = [p.direccion, p.conjunto ? `Conjunto ${p.conjunto}` : null, p.barrio, p.ciudad].filter(Boolean).join(", ");
  const coords = p.latitud && p.longitud ? { lat: p.latitud, lon: p.longitud } : null;
  const mapUrl = coords
    ? `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lon}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  ["desktop", "mobile"].forEach((v) => {
    const addrEl = $(`#map-address-${v}`);
    const linkEl = $(`#map-link-${v}`);
    const previewEl = $(`#map-preview-${v}`);
    if (addrEl) addrEl.textContent = address || "";
    if (linkEl) linkEl.href = mapUrl;
    if (previewEl) {
      if (coords) {
        previewEl.innerHTML = "";
        previewEl.id = `map-preview-${v}`;
        const map = L.map(previewEl, { scrollWheelZoom: false, zoomControl: false, attributionControl: false }).setView([coords.lat, coords.lon], 16);
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          maxZoom: 19
        }).addTo(map);
        // Custom marker with brand color + pulse animation
        const markerIcon = L.divIcon({
          className: "",
          html: `<div style="position:relative;width:20px;height:20px;"><div style="position:absolute;inset:0;background:#0051d5;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);z-index:2;"></div><div style="position:absolute;inset:-8px;background:#0051d5;border-radius:50%;opacity:0.3;animation:pulse-marker 2s ease-out infinite;"></div></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });
        L.marker([coords.lat, coords.lon], { icon: markerIcon }).addTo(map);
        // Add zoom control top-right
        L.control.zoom({ position: "topright" }).addTo(map);
      } else {
        previewEl.innerHTML = `<p class="flex items-center justify-center h-full text-on-surface-muted text-sm">${ui.ubicacion_no_disponible}</p>`;
      }
    }
  });
}

// ── Normalize ──
function normalize(raw) {
  const prop = raw?.property || raw?.data?.property || raw;
  const det = prop?.detalles_propiedad || {};
  const images = Array.isArray(prop?.images)
    ? prop.images.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).map((i) => i.url || i)
    : [];
  return {
    titulo: prop?.titulo,
    descripcion: prop?.descripcion,
    url_360: prop?.url_360,
    images,
    servicios: prop?.servicios || [],
    destacados: prop?.destacados || [],
    estrato: det?.estrato || prop?.estrato,
    conjunto: det?.conjunto || det?.conjunto_edificio || prop?.conjunto,
    direccion: det?.direccion || prop?.direccion,
    barrio: det?.barriocomun || prop?.barrio,
    ciudad: det?.ciudad || prop?.ciudad,
    precio: det?.precio_venta ?? prop?.precio,
    precio_anterior: det?.precio_anterior ?? prop?.precio_anterior,
    area_privada: det?.area ?? prop?.area_privada,
    habitaciones: det?.num_habitaciones ?? prop?.habitaciones,
    banos: det?.baños ?? det?.banos ?? prop?.banos,
    parqueaderos: det?.parqueaderos ?? prop?.parqueaderos,
    piso: det?.num_piso ?? prop?.piso,
    telefono: det?.telefono || det?.contacto_zona || prop?.telefono,
    correo: det?.correo || prop?.correo,
    latitud: det?.latitud ?? prop?.latitud,
    longitud: det?.longitud ?? prop?.longitud,
  };
}

// ── Populate ──
function populate(data) {
  const raw = data?.data || data;
  const ui = raw?.ui || {};
  const p = normalize(data);

  $("#hero-title").textContent = p.titulo || "";
  $("#hero-location").textContent = [p.barrio, p.ciudad].filter(Boolean).join(", ");
  const heroBadgeLabel = $("#hero-badge-label");
  if (heroBadgeLabel && ui.hero_badge) heroBadgeLabel.textContent = ui.hero_badge;

  // Page title
  const pageTitle = $("#page-title");
  if (pageTitle) pageTitle.textContent = p.titulo || "";

  // Lightbox hint
  const lbHint = $("#lb-hint");
  if (lbHint && ui.lightbox_hint) lbHint.textContent = ui.lightbox_hint;

  renderHeroBadges(p, ui);
  renderSectionTitles(ui);
  renderPrice(p, ui);
  renderGallery(p.images, ui);
  $("#property-description").innerHTML = p.descripcion || "";
  renderHighlights(p.destacados, ui);
  renderFicha(p, ui);
  renderGastos(p.servicios, ui);
  renderTourMobile(p.url_360, ui);
  renderSidebarTour(p.url_360, ui);
  renderContact(p, ui);
  renderMap(p, ui);

  $("#footer-copy").textContent = ui.footer ? ui.footer.replace("{year}", new Date().getFullYear()) : "";
}

// ── Init ──
async function init() {
  initLightbox();
  if (window.PROPERTY_DATA) { populate(window.PROPERTY_DATA); return; }
  try {
    const res = await fetch("./property-5157395.json");
    if (!res.ok) throw new Error(res.status);
    populate(await res.json());
  } catch (e) {
    // Can't show error text from JSON since JSON failed to load
    $("#hero-title").textContent = "";
  }
}

init();

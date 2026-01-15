const $ = (selector) => document.querySelector(selector);

// Lightbox state
let lightboxImages = [];
let lightboxCurrentIndex = 0;
let lightboxThumbPage = 0;
const LIGHTBOX_THUMBS_PER_PAGE = 8;

// Gallery state
let galleryImages = [];
let galleryCurrentIndex = 0;
let galleryThumbPage = 0;
let galleryThumbsPerPage = 8; // Will be adjusted for mobile

const formatCurrency = (value) => {
  if (!value && value !== 0) return "--";
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatNumber = (value) => {
  if (!value && value !== 0) return "--";
  return new Intl.NumberFormat("es-CO").format(value);
};

// ============ PAGINATION HELPERS ============

const getThumbsPerPage = () => {
  return window.innerWidth < 768 ? 4 : 8;
};

const getTotalPages = (totalItems, perPage) => {
  return Math.ceil(totalItems / perPage);
};

const renderPaginationDots = (container, currentPage, totalPages, onPageClick, isLight = false) => {
  container.innerHTML = "";
  if (totalPages <= 1) return;
  
  for (let i = 0; i < totalPages; i++) {
    const dot = document.createElement("button");
    const activeClass = isLight 
      ? (i === currentPage ? "bg-white" : "bg-white/40 hover:bg-white/60")
      : (i === currentPage ? "bg-primary" : "bg-slate-300 dark:bg-slate-600 hover:bg-slate-400");
    dot.className = `w-2.5 h-2.5 rounded-full transition-colors ${activeClass}`;
    dot.addEventListener("click", () => onPageClick(i));
    container.appendChild(dot);
  }
};

// ============ LIGHTBOX FUNCTIONS ============

const openLightbox = (index) => {
  const lightbox = $("#lightbox");
  lightboxCurrentIndex = index;
  // Calculate which page this image is on
  lightboxThumbPage = Math.floor(index / LIGHTBOX_THUMBS_PER_PAGE);
  updateLightboxImage();
  renderLightboxThumbnails();
  lightbox.classList.remove("hidden");
  lightbox.classList.add("flex");
  document.body.style.overflow = "hidden";
};

const closeLightbox = () => {
  const lightbox = $("#lightbox");
  lightbox.classList.add("hidden");
  lightbox.classList.remove("flex");
  document.body.style.overflow = "";
};

const updateLightboxImage = () => {
  const lightboxImage = $("#lightbox-image");
  const lightboxCounter = $("#lightbox-counter");
  
  if (lightboxImages.length > 0) {
    lightboxImage.src = lightboxImages[lightboxCurrentIndex];
    lightboxImage.alt = `Imagen ${lightboxCurrentIndex + 1}`;
    lightboxCounter.textContent = `${lightboxCurrentIndex + 1} / ${lightboxImages.length}`;
  }
  
  // Update thumbnail highlights
  updateLightboxThumbHighlights();
};

const updateLightboxThumbHighlights = () => {
  const thumbs = document.querySelectorAll("#lightbox-thumbnails .lightbox-thumb");
  const startIndex = lightboxThumbPage * LIGHTBOX_THUMBS_PER_PAGE;
  
  thumbs.forEach((thumb, i) => {
    const actualIndex = startIndex + i;
    const isActive = actualIndex === lightboxCurrentIndex;
    thumb.classList.toggle("ring-2", isActive);
    thumb.classList.toggle("ring-white", isActive);
    thumb.classList.toggle("opacity-50", !isActive);
  });
};

const renderLightboxThumbnails = () => {
  const container = $("#lightbox-thumbnails");
  const paginationContainer = $("#lightbox-pagination");
  const prevBtn = $("#lightbox-thumb-prev");
  const nextBtn = $("#lightbox-thumb-next");
  
  container.innerHTML = "";
  
  const totalPages = getTotalPages(lightboxImages.length, LIGHTBOX_THUMBS_PER_PAGE);
  const startIndex = lightboxThumbPage * LIGHTBOX_THUMBS_PER_PAGE;
  const endIndex = Math.min(startIndex + LIGHTBOX_THUMBS_PER_PAGE, lightboxImages.length);
  
  for (let i = startIndex; i < endIndex; i++) {
    const src = lightboxImages[i];
    const thumb = document.createElement("div");
    const isActive = i === lightboxCurrentIndex;
    thumb.className = `lightbox-thumb w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden cursor-pointer transition-all flex-shrink-0 ${isActive ? "ring-2 ring-white" : "opacity-50 hover:opacity-80"}`;
    const img = document.createElement("img");
    img.src = src;
    img.alt = `Miniatura ${i + 1}`;
    img.className = "w-full h-full object-cover";
    thumb.appendChild(img);
    thumb.addEventListener("click", () => {
      lightboxCurrentIndex = i;
      updateLightboxImage();
    });
    container.appendChild(thumb);
  }
  
  // Update navigation buttons
  if (prevBtn) prevBtn.disabled = lightboxThumbPage === 0;
  if (nextBtn) nextBtn.disabled = lightboxThumbPage >= totalPages - 1;
  
  // Render pagination dots
  if (paginationContainer) {
    renderPaginationDots(paginationContainer, lightboxThumbPage, totalPages, (page) => {
      lightboxThumbPage = page;
      renderLightboxThumbnails();
    }, true);
  }
};

const lightboxNext = () => {
  lightboxCurrentIndex = (lightboxCurrentIndex + 1) % lightboxImages.length;
  // Auto-advance page if needed
  const newPage = Math.floor(lightboxCurrentIndex / LIGHTBOX_THUMBS_PER_PAGE);
  if (newPage !== lightboxThumbPage) {
    lightboxThumbPage = newPage;
    renderLightboxThumbnails();
  } else {
    updateLightboxImage();
  }
};

const lightboxPrev = () => {
  lightboxCurrentIndex = (lightboxCurrentIndex - 1 + lightboxImages.length) % lightboxImages.length;
  // Auto-advance page if needed
  const newPage = Math.floor(lightboxCurrentIndex / LIGHTBOX_THUMBS_PER_PAGE);
  if (newPage !== lightboxThumbPage) {
    lightboxThumbPage = newPage;
    renderLightboxThumbnails();
  } else {
    updateLightboxImage();
  }
};

const lightboxThumbNextPage = () => {
  const totalPages = getTotalPages(lightboxImages.length, LIGHTBOX_THUMBS_PER_PAGE);
  if (lightboxThumbPage < totalPages - 1) {
    lightboxThumbPage++;
    renderLightboxThumbnails();
  }
};

const lightboxThumbPrevPage = () => {
  if (lightboxThumbPage > 0) {
    lightboxThumbPage--;
    renderLightboxThumbnails();
  }
};

const initLightbox = () => {
  const lightbox = $("#lightbox");
  const closeBtn = $("#lightbox-close");
  const prevBtn = $("#lightbox-prev");
  const nextBtn = $("#lightbox-next");
  const thumbPrevBtn = $("#lightbox-thumb-prev");
  const thumbNextBtn = $("#lightbox-thumb-next");
  
  if (!lightbox) return;
  
  closeBtn?.addEventListener("click", closeLightbox);
  prevBtn?.addEventListener("click", lightboxPrev);
  nextBtn?.addEventListener("click", lightboxNext);
  thumbPrevBtn?.addEventListener("click", lightboxThumbPrevPage);
  thumbNextBtn?.addEventListener("click", lightboxThumbNextPage);
  
  // Close on backdrop click
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  
  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (lightbox.classList.contains("hidden")) return;
    
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowRight") lightboxNext();
    if (e.key === "ArrowLeft") lightboxPrev();
  });
};

// ============ BADGE FUNCTIONS ============

const buildBadge = (text) => {
  const badge = document.createElement("span");
  badge.className = "px-4 py-1.5 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-md";
  badge.textContent = text;
  return badge;
};

const renderBadges = (property) => {
  const container = $("#property-badges");
  container.innerHTML = "";

  const badges = [];
  if (property.tipo_inmueble) badges.push(property.tipo_inmueble);
  if (property.area_privada) badges.push(`${formatNumber(property.area_privada)} m²`);
  if (property.estrato) badges.push(`Estrato ${property.estrato}`);
  if (property.estado) badges.push(property.estado);
  if (property.ciudad) badges.push(property.ciudad);

  badges.forEach((text) => container.appendChild(buildBadge(text)));
};

const renderGallery = (images) => {
  const mainImage = $("#gallery-main-image");
  const thumbContainer = $("#gallery-thumbnails");
  const photoCount = $("#photo-count");
  const paginationContainer = $("#thumb-pagination");
  const prevBtn = $("#thumb-prev");
  const nextBtn = $("#thumb-next");
  const mainPrevBtn = $("#gallery-main-prev");
  const mainNextBtn = $("#gallery-main-next");

  const resolvedImages = images.length
    ? images.map((img) => (img.startsWith("http") ? img : `images/${img}`))
    : ["https://via.placeholder.com/1200x750?text=Sin+imagen"];

  // Store images for lightbox and gallery
  lightboxImages = resolvedImages;
  galleryImages = resolvedImages;
  galleryThumbsPerPage = getThumbsPerPage();

  // Update photo count
  if (photoCount) {
    photoCount.textContent = resolvedImages.length;
  }

  const setActive = (index) => {
    galleryCurrentIndex = index;
    mainImage.src = resolvedImages[index];
    mainImage.alt = `Imagen ${index + 1}`;
    updateGalleryThumbHighlights();
  };

  const updateGalleryThumbHighlights = () => {
    const thumbs = thumbContainer.querySelectorAll(".thumbnail-item");
    const startIndex = galleryThumbPage * galleryThumbsPerPage;
    
    thumbs.forEach((thumb, i) => {
      const actualIndex = startIndex + i;
      const isActive = actualIndex === galleryCurrentIndex;
      thumb.classList.toggle("ring-2", isActive);
      thumb.classList.toggle("ring-primary", isActive);
      thumb.classList.toggle("opacity-80", !isActive);
      thumb.classList.toggle("opacity-100", isActive);
    });
  };

  const renderThumbnails = () => {
    thumbContainer.innerHTML = "";
    galleryThumbsPerPage = getThumbsPerPage();
    
    const totalPages = getTotalPages(resolvedImages.length, galleryThumbsPerPage);
    const startIndex = galleryThumbPage * galleryThumbsPerPage;
    const endIndex = Math.min(startIndex + galleryThumbsPerPage, resolvedImages.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      const src = resolvedImages[i];
      const thumb = document.createElement("div");
      const isActive = i === galleryCurrentIndex;
      thumb.className = `thumbnail-item aspect-square rounded-md overflow-hidden bg-slate-100 dark:bg-slate-700 cursor-pointer transition ${isActive ? "ring-2 ring-primary opacity-100" : "opacity-80 hover:opacity-100"}`;
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Miniatura ${i + 1}`;
      img.className = "w-full h-full object-cover";
      thumb.appendChild(img);
      thumb.addEventListener("click", () => setActive(i));
      thumb.addEventListener("dblclick", () => openLightbox(i));
      thumbContainer.appendChild(thumb);
    }
    
    // Update navigation buttons
    if (prevBtn) prevBtn.disabled = galleryThumbPage === 0;
    if (nextBtn) nextBtn.disabled = galleryThumbPage >= totalPages - 1;
    
    // Render pagination dots
    if (paginationContainer) {
      renderPaginationDots(paginationContainer, galleryThumbPage, totalPages, (page) => {
        galleryThumbPage = page;
        renderThumbnails();
      }, false);
    }
  };

  const galleryNextImage = () => {
    const newIndex = (galleryCurrentIndex + 1) % resolvedImages.length;
    setActive(newIndex);
    // Auto-advance page if needed
    const newPage = Math.floor(newIndex / galleryThumbsPerPage);
    if (newPage !== galleryThumbPage) {
      galleryThumbPage = newPage;
      renderThumbnails();
    }
  };

  const galleryPrevImage = () => {
    const newIndex = (galleryCurrentIndex - 1 + resolvedImages.length) % resolvedImages.length;
    setActive(newIndex);
    // Auto-advance page if needed
    const newPage = Math.floor(newIndex / galleryThumbsPerPage);
    if (newPage !== galleryThumbPage) {
      galleryThumbPage = newPage;
      renderThumbnails();
    }
  };

  const thumbNextPage = () => {
    const totalPages = getTotalPages(resolvedImages.length, galleryThumbsPerPage);
    if (galleryThumbPage < totalPages - 1) {
      galleryThumbPage++;
      renderThumbnails();
    }
  };

  const thumbPrevPage = () => {
    if (galleryThumbPage > 0) {
      galleryThumbPage--;
      renderThumbnails();
    }
  };

  // Event listeners for navigation
  if (prevBtn) {
    prevBtn.onclick = thumbPrevPage;
  }
  if (nextBtn) {
    nextBtn.onclick = thumbNextPage;
  }
  if (mainPrevBtn) {
    mainPrevBtn.onclick = galleryPrevImage;
  }
  if (mainNextBtn) {
    mainNextBtn.onclick = galleryNextImage;
  }

  // Make main image clickable to open lightbox
  mainImage.classList.add("cursor-pointer");
  mainImage.onclick = () => openLightbox(galleryCurrentIndex);

  // Handle window resize
  window.addEventListener("resize", () => {
    const newPerPage = getThumbsPerPage();
    if (newPerPage !== galleryThumbsPerPage) {
      galleryThumbsPerPage = newPerPage;
      galleryThumbPage = Math.floor(galleryCurrentIndex / galleryThumbsPerPage);
      renderThumbnails();
    }
  });

  // Initial render
  renderThumbnails();
  setActive(0);
};

const renderDetails = (property) => {
  const detailsList = $("#property-details");
  detailsList.innerHTML = "";

  const areaPrivada = property.area_privada ? `${formatNumber(property.area_privada)} m²` : null;
  const areaConstruida = property.area_construida
    ? `${formatNumber(property.area_construida)} m²`
    : null;

  const details = [
    ["Área privada", areaPrivada],
    ["Área construida", areaConstruida],
    ["Parqueaderos", property.parqueaderos],
    ["Baños", property.banos],
    ["Habitaciones", property.habitaciones],
    ["Antigüedad", property.antiguedad],
    ["Tipo", property.tipo_inmueble],
    ["Estrato", property.estrato],
  ];

  details
    .filter(([, value]) => value && value !== "--")
    .forEach(([label, value]) => {
      const div = document.createElement("div");
      div.className = "flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-700/50";
      const span = document.createElement("span");
      span.className = "text-slate-500 text-sm";
      span.textContent = label;
      const strong = document.createElement("span");
      strong.className = "font-bold";
      strong.textContent = value;
      div.appendChild(span);
      div.appendChild(strong);
      detailsList.appendChild(div);
    });
};

const renderDistribution = (property) => {
  const list = $("#property-distribution");
  list.innerHTML = "";

  const items = [
    ["Habitaciones", property.habitaciones],
    ["Baños", property.banos],
    ["Parqueaderos", property.parqueaderos],
    ["Estrato", property.estrato],
  ];

  items
    .filter(([, value]) => value && value !== "--")
    .forEach(([label, value]) => {
      const li = document.createElement("li");
      const span = document.createElement("span");
      span.textContent = label;
      const strong = document.createElement("strong");
      strong.textContent = value;
      li.appendChild(span);
      li.appendChild(strong);
      list.appendChild(li);
    });
};

const renderFeatures = (features) => {
  const container = $("#property-features");
  container.innerHTML = "";

  if (!features || !features.length) {
    container.innerHTML = "<span class=\"text-slate-500 text-sm\">No hay características disponibles.</span>";
    return;
  }

  features.forEach((feature) => {
    const span = document.createElement("span");
    span.className = "bg-slate-50 dark:bg-slate-700/50 px-4 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-600";
    span.textContent = feature;
    container.appendChild(span);
  });
};

const renderServices = (services) => {
  const container = $("#property-services");
  container.innerHTML = "";

  if (!services || !services.length) {
    container.innerHTML = "<p class=\"text-slate-500 text-sm\">No hay servicios registrados.</p>";
    return;
  }

  services.forEach((service) => {
    const item = document.createElement("div");
    item.className = "flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30";
    const label = document.createElement("span");
    label.className = "text-sm font-medium";
    label.textContent = service.nombre || service.servicio || "Servicio";
    const value = document.createElement("span");
    value.className = "text-sm font-bold";
    value.textContent = service.valor ? formatCurrency(service.valor) : "--";
    item.appendChild(label);
    item.appendChild(value);
    container.appendChild(item);
  });
};

const renderContact = (property) => {
  const phone = property.telefono || "";
  const email = property.correo || "";
  const name = property.nombre_contacto || "Equipo comercial";

  $("#contact-name").textContent = name;

  const phoneLink = $("#contact-phone");
  const phoneText = $("#contact-phone-text");
  if (phoneText) {
    phoneText.textContent = phone ? `Llamar ${phone}` : "Llamar";
  }
  phoneLink.href = phone ? `tel:${phone}` : "#";

  const emailLink = $("#contact-email");
  emailLink.href = email ? `mailto:${email}` : "#";

  const whatsappLink = $("#contact-whatsapp");
  if (phone) {
    const cleaned = phone.replace(/\D/g, "");
    whatsappLink.href = `https://wa.me/57${cleaned}`;
  } else {
    whatsappLink.href = "#";
  }

  $("#contact-building").textContent = property.conjunto || "--";
  $("#contact-admin").textContent = property.administracion
    ? formatCurrency(property.administracion)
    : "--";
};

const renderMap = (property) => {
  const address = [property.direccion, property.barrio, property.ciudad]
    .filter(Boolean)
    .join(", ");
  const mapLink = $("#property-map");
  const mapPreview = $("#property-map-preview");
  const coords = property.latitud && property.longitud
    ? `${property.latitud},${property.longitud}`
    : null;

  $("#property-address").textContent = address || "Dirección no disponible";

  const mapUrl = coords
    ? `https://www.google.com/maps/search/?api=1&query=${coords}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  mapLink.href = mapUrl;

  if (coords) {
    const [lat, lon] = coords.split(",");
    const delta = 0.01;
    const left = parseFloat(lon) - delta;
    const right = parseFloat(lon) + delta;
    const top = parseFloat(lat) + delta;
    const bottom = parseFloat(lat) - delta;
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${left}%2C${bottom}%2C${right}%2C${top}&layer=mapnik&marker=${lat}%2C${lon}`;
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.title = "Mapa de ubicación";
    iframe.style.border = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    mapPreview.innerHTML = "";
    mapPreview.appendChild(iframe);
  } else {
    mapPreview.textContent = "Ubicación aproximada";
  }
};

const normalizeProperty = (raw) => {
  const property = raw?.property || raw?.data?.property || raw;
  const details = property?.detalles_propiedad || {};
  const images = Array.isArray(property?.images)
    ? property.images
        .slice()
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map((img) => img.url || img)
    : [];

  return {
    titulo: property?.titulo,
    descripcion: property?.descripcion,
    url_360: property?.url_360,
    images,
    servicios: property?.servicios || [],
    caracteristicas_propiedad: property?.caracteristicas_propiedad || [],
    tipo_inmueble: details?.tipo_inmueble || property?.tipo_inmueble,
    estrato: details?.estrato || property?.estrato,
    conjunto: details?.conjunto || details?.conjunto_edificio || property?.conjunto,
    direccion: details?.direccion || property?.direccion,
    barrio: details?.barriocomun || property?.barrio,
    ciudad: details?.ciudad || property?.ciudad,
    departamento: details?.departamento || property?.departamento,
    precio: details?.precio_venta ?? property?.precio,
    precio_anterior: details?.precio_anterior ?? property?.precio_anterior,
    area_privada: details?.area ?? property?.area_privada,
    area_construida: details?.area_construida ?? property?.area_construida,
    habitaciones: details?.num_habitaciones ?? property?.habitaciones,
    banos: details?.baños ?? details?.banos ?? property?.banos,
    parqueaderos: details?.garajes ?? property?.parqueaderos,
    antiguedad: details?.anos_antiguedad ?? property?.antiguedad,
    telefono: details?.telefono || details?.contacto_zona || property?.telefono,
    correo: details?.correo || property?.correo,
    nombre_contacto: property?.nombre_contacto,
    administracion: details?.last_admin_price ?? property?.administracion,
    latitud: details?.latitud ?? property?.latitud,
    longitud: details?.longitud ?? property?.longitud,
    estado: property?.estado,
  };
};

const populatePage = (data) => {
  const property = normalizeProperty(data);

  $("#property-title").textContent = property.titulo || "Inmueble en venta";
  $("#property-location").textContent = [property.barrio, property.ciudad, property.departamento]
    .filter(Boolean)
    .join(" · ");

  $("#property-price").textContent = formatCurrency(property.precio);
  const pricePrev = $("#property-price-prev");
  if (pricePrev) {
    pricePrev.textContent = property.precio_anterior
      ? formatCurrency(property.precio_anterior)
      : "";
  }

  $("#property-description").textContent = property.descripcion || "Sin descripción";

  // Handle 360 tour button (main gallery)
  const btn360Container = $("#btn-360-container");
  const tour360 = $("#property-360");
  const tour360Btn = $("#property-360-btn");
  
  if (property.url_360) {
    if (btn360Container) btn360Container.style.display = "flex";
    if (tour360) tour360.href = property.url_360;
    if (tour360Btn) {
      tour360Btn.href = property.url_360;
      tour360Btn.style.display = "inline-flex";
    }
  } else {
    if (btn360Container) btn360Container.style.display = "none";
    if (tour360Btn) tour360Btn.style.display = "none";
  }

  renderBadges(property);
  renderGallery(property.images || []);
  renderDetails(property);
  renderDistribution(property);
  renderFeatures(property.caracteristicas_propiedad || []);
  renderServices(property.servicios || []);
  renderContact(property);
  renderMap(property);

  $("#generated-date").textContent = new Date().toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const loadData = async () => {
  // Initialize lightbox
  initLightbox();

  if (window.PROPERTY_DATA) {
    populatePage(window.PROPERTY_DATA);
    return;
  }

  try {
    const response = await fetch("property-5157395.json");
    if (!response.ok) throw new Error("No se pudo cargar el JSON");
    const data = await response.json();
    populatePage(data);
  } catch (error) {
    $("#property-title").textContent = "No se pudo cargar el inmueble";
    $("#property-description").textContent = "Revisa que el archivo property-5157395.json esté disponible.";
  }
};

loadData();

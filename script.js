/* go-ai Image Studio — standalone interaction layer */
(() => {
  "use strict";

  const STORAGE_PREFIX = "go-ai-image-studio:";
  const HERO_FALLBACK = "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=86";
  const STARTER_IMAGES = [
    { id: "starter-paper", src: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=86", prompt: "Layered topographic landscape with an electric signal line", style: "Editorial", createdAt: "Curated reference", favorite: false, fallback: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=86" },
    { id: "starter-botanical", src: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1000&q=86", prompt: "Futuristic botanical specimen inside a glass archive case", style: "Specimen", createdAt: "Curated reference", favorite: true, fallback: "https://images.unsplash.com/photo-1549490349-8643362247b5?auto=format&fit=crop&w=1000&q=86" },
    { id: "starter-corridor", src: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1000&q=86", prompt: "Surreal architectural corridor with a lime signal ribbon", style: "Architectural", createdAt: "Curated reference", favorite: false, fallback: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1000&q=86" }
  ];
  const STYLE_OPTIONS = ["None", "Editorial", "Photoreal", "Cinematic", "Anime", "Product", "Surreal"];
  const STYLE_SUFFIX = {
    None: "",
    Editorial: "editorial art direction, tactile material detail, refined composition",
    Photoreal: "photorealistic, natural light, high detail, premium photography",
    Cinematic: "cinematic lighting, film still, atmospheric depth, dramatic composition",
    Anime: "detailed anime illustration, expressive design, polished linework",
    Product: "luxury product photography, clean studio light, premium commercial styling",
    Surreal: "surreal dream logic, unexpected scale, poetic visual metaphor"
  };
  const state = {
    theme: load("theme", "dark"),
    collapsed: false,
    mobileOpen: false,
    view: "create",
    style: "Editorial",
    gallery: migrateGallery(load("gallery", STARTER_IMAGES)),
    prompts: load("prompts", []),
    selected: null,
    generating: false
  };

  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const studioShell = $("#studioShell");
  const sidebar = $("#studioSidebar");
  const mobileScrim = $("#mobileScrim");
  const promptInput = $("#promptInput");
  const negativePrompt = $("#negativePrompt");
  const styleOptions = $("#styleOptions");
  const galleryGrid = $("#galleryGrid");
  const galleryCount = $("#galleryCount");
  const visibleCount = $("#visibleCount");
  const gallerySection = $("#gallerySection");
  const searchInput = $("#searchInput");
  const toastRegion = $("#toastRegion");

  function key(name) { return `${STORAGE_PREFIX}${name}`; }
  function load(name, fallback) {
    try { const value = localStorage.getItem(key(name)); return value === null ? fallback : JSON.parse(value); } catch { return fallback; }
  }
  function save(name, value) { try { localStorage.setItem(key(name), JSON.stringify(value)); } catch { /* Private browsing can block storage. */ } }
  function migrateGallery(items) {
    return Array.isArray(items) ? items.map(item => {
      if (String(item.src).includes("gallery-01")) return { ...item, ...STARTER_IMAGES[0] };
      if (String(item.src).includes("gallery-02")) return { ...item, ...STARTER_IMAGES[1] };
      if (String(item.src).includes("gallery-03")) return { ...item, ...STARTER_IMAGES[2] };
      return item;
    }) : STARTER_IMAGES;
  }
  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#039;", '"': "&quot;" }[character]));
  }
  function refreshIcons() { if (window.lucide) window.lucide.createIcons(); }
  function showToast(title, detail = "") {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<strong>${escapeHTML(title)}</strong>${detail ? `<span>${escapeHTML(detail)}</span>` : ""}`;
    toastRegion.appendChild(toast);
    window.setTimeout(() => { toast.classList.add("is-leaving"); window.setTimeout(() => toast.remove(), 220); }, 3200);
  }

  function setTheme(theme) {
    state.theme = theme;
    document.documentElement.dataset.theme = theme;
    save("theme", theme);
    $("#themeToggle").innerHTML = `<i data-lucide="${theme === "dark" ? "sun" : "moon"}"></i>`;
    refreshIcons();
  }
  function setMobile(open) {
    state.mobileOpen = open;
    sidebar.classList.toggle("mobile-open", open);
    mobileScrim.classList.toggle("is-visible", open);
  }
  function setView(view) {
    state.view = view;
    $("#createView").hidden = view !== "create";
    $("#galleryView").hidden = view !== "gallery";
    $("#historyView").hidden = view !== "history";
    gallerySection.hidden = view === "history";
    $$(".side-nav-item[data-view]").forEach(item => item.classList.toggle("active", item.dataset.view === view));
    $("#crumbTitle").textContent = view === "create" ? "New canvas" : view === "gallery" ? "Gallery" : "Prompt history";
    if (view === "gallery") { $("#galleryKicker").textContent = "Your gallery"; $("#galleryTitle").textContent = "Frames from your studio"; }
    else { $("#galleryKicker").textContent = "Curated references"; $("#galleryTitle").textContent = "Start with a visual signal"; }
    renderHistory();
    renderGallery();
    setMobile(false);
  }

  function renderStyleOptions() {
    styleOptions.innerHTML = STYLE_OPTIONS.map(option => `<button type="button" class="${state.style === option ? "selected" : ""}" data-style="${escapeHTML(option)}">${escapeHTML(option)}</button>`).join("");
    $$("[data-style]", styleOptions).forEach(button => button.addEventListener("click", () => { state.style = button.dataset.style; renderStyleOptions(); }));
  }

  function renderGallery() {
    const query = searchInput.value.trim().toLowerCase();
    const items = state.gallery.filter(item => !query || `${item.prompt} ${item.style}`.toLowerCase().includes(query));
    galleryCount.textContent = state.gallery.length;
    visibleCount.textContent = items.length;
    if (!items.length) { galleryGrid.innerHTML = `<div class="empty-gallery"><i data-lucide="image-off"></i><p>No frames match that search.</p></div>`; refreshIcons(); return; }
    galleryGrid.innerHTML = items.map(item => `<article class="gallery-card" data-id="${escapeHTML(item.id)}"><button class="image-preview" data-gallery-action="open" aria-label="Open ${escapeHTML(item.prompt)}"><img src="${escapeHTML(item.src)}" data-fallback="${escapeHTML(item.fallback || HERO_FALLBACK)}" alt="${escapeHTML(item.prompt)}" loading="lazy" /><span class="image-overlay"><i data-lucide="arrow-up-right"></i></span></button><div class="image-meta"><div class="meta-top"><span class="meta-style">${escapeHTML(item.style)}</span><button class="favorite-button ${item.favorite ? "is-favorite" : ""}" data-gallery-action="favorite" aria-label="Favorite image"><i data-lucide="heart" ${item.favorite ? 'fill="currentColor"' : ""}></i></button></div><p>${escapeHTML(item.prompt)}</p><div class="meta-bottom"><span>${escapeHTML(item.createdAt)}</span><div class="meta-actions"><button data-gallery-action="copy" title="Copy prompt"><i data-lucide="copy"></i></button><button data-gallery-action="download" title="Download"><i data-lucide="download"></i></button><button data-gallery-action="more" title="More"><i data-lucide="more-horizontal"></i></button></div></div></div></article>`).join("");
    $$('img[data-fallback]', galleryGrid).forEach(image => image.addEventListener("error", () => { if (image.src !== image.dataset.fallback) image.src = image.dataset.fallback; }, { once: true }));
    refreshIcons();
  }

  function renderHistory() {
    const list = $("#historyList");
    if (!state.prompts.length) { list.innerHTML = `<div class="empty-history"><i data-lucide="history"></i><p>Your prompt history will appear here after your first generation.</p></div>`; refreshIcons(); return; }
    list.innerHTML = state.prompts.map((prompt, index) => `<button class="history-prompt-row" data-history-prompt="${escapeHTML(prompt)}"><span class="history-number">${String(index + 1).padStart(2, "0")}</span><span>${escapeHTML(prompt)}</span><i data-lucide="arrow-up-right"></i></button>`).join("");
    refreshIcons();
  }

  function setGenerating(isGenerating) {
    state.generating = isGenerating;
    const button = $("#generateButton");
    button.disabled = isGenerating;
    button.classList.toggle("is-loading", isGenerating);
    button.innerHTML = isGenerating ? `<i data-lucide="loader-circle"></i><span>Rendering frame...</span>` : `<i data-lucide="sparkles"></i><span>Generate the frame</span><i data-lucide="arrow-up-right"></i>`;
    refreshIcons();
  }

  function generateImage(event) {
    event.preventDefault();
    const prompt = promptInput.value.trim();
    if (!prompt) { showToast("Describe your frame first", "Add a visual direction before generating."); promptInput.focus(); return; }
    const aspect = $("#aspectSelect").value;
    const quality = $("#qualitySelect").value;
    const dimensions = { square: [1024, 1024], landscape: [1536, 864], portrait: [864, 1536] }[aspect];
    const qualitySuffix = quality === "Ultra" ? " ultra detailed, 4k quality" : quality === "Studio" ? " high detail" : " concept sketch";
    const negative = negativePrompt.value.trim() ? `, avoid ${negativePrompt.value.trim()}` : "";
    const fullPrompt = `${prompt}${STYLE_SUFFIX[state.style] ? `, ${STYLE_SUFFIX[state.style]}` : ""}${qualitySuffix}${negative}`;
    const seed = Math.floor(Math.random() * 999999);
    const source = `https://image.pollinations.ai/prompt/${encodeURIComponent(fullPrompt)}?width=${dimensions[0]}&height=${dimensions[1]}&seed=${seed}&nologo=true&enhance=true`;
    const item = { id: `generated-${Date.now()}`, src: source, prompt, style: state.style, aspect, createdAt: "Just now", favorite: false, fallback: HERO_FALLBACK };
    state.gallery.unshift(item);
    state.prompts = [prompt, ...state.prompts.filter(value => value !== prompt)].slice(0, 12);
    save("gallery", state.gallery); save("prompts", state.prompts);
    setGenerating(true); setView("gallery"); renderGallery();
    showToast("Generation started", "Pollinations is rendering your frame now.");
    window.setTimeout(() => setGenerating(false), 1600);
  }

  function clearPrompt() { promptInput.value = ""; negativePrompt.value = ""; $("#charCount").textContent = "0"; $("#referenceLabel").textContent = "Attach a reference"; $("#attachButton").classList.remove("attached"); $("#referenceInput").value = ""; }
  function surpriseMe() { const prompts = ["A moonlit archive of floating botanical specimens, with a single lime signal thread", "A quiet brutalist observatory on a desert salt flat, cinematic dusk, tiny human scale", "A glass city folded inside an antique radio, warm paper texture, surreal editorial still life", "A luminous underwater library with geometric fish and a hand-drawn constellation above"]; promptInput.value = prompts[Math.floor(Math.random() * prompts.length)]; $("#charCount").textContent = promptInput.value.length; showToast("A new direction is ready"); }
  async function copyText(value) { try { await navigator.clipboard.writeText(value); showToast("Prompt copied"); } catch { showToast("Clipboard unavailable", "Copy the prompt manually from the card."); } }
  function findItem(id) { return state.gallery.find(item => item.id === id); }
  function downloadImage(item) { const link = document.createElement("a"); link.href = item.src; link.target = "_blank"; link.rel = "noreferrer"; link.download = `go-ai-${item.id}.jpg`; link.click(); showToast("Download opened", "Your browser will save the rendered frame."); }
  function openLightbox(item) { state.selected = item; $("#lightboxImage").src = item.src; $("#lightboxImage").alt = item.prompt; $("#lightboxImage").dataset.fallback = item.fallback || HERO_FALLBACK; $("#lightboxStyle").textContent = `${item.style} / ${item.aspect}`; $("#lightboxPrompt").textContent = item.prompt; $("#lightbox").hidden = false; }
  function closeLightbox() { $("#lightbox").hidden = true; state.selected = null; }

  function bindEvents() {
    $("#generatorForm").addEventListener("submit", generateImage);
    promptInput.addEventListener("input", () => { $("#charCount").textContent = promptInput.value.length; });
    promptInput.addEventListener("keydown", event => { if ((event.metaKey || event.ctrlKey) && event.key === "Enter") generateImage(event); });
    $("#clearPrompt").addEventListener("click", clearPrompt); $("#surpriseButton").addEventListener("click", surpriseMe); $("#themeToggle").addEventListener("click", () => setTheme(state.theme === "dark" ? "light" : "dark"));
    $("#collapseSidebar").addEventListener("click", () => { state.collapsed = !state.collapsed; studioShell.classList.toggle("sidebar-collapsed", state.collapsed); $("#collapseSidebar").innerHTML = `<i data-lucide="${state.collapsed ? "panel-left-open" : "panel-left-close"}"></i>`; refreshIcons(); });
    $("#openSidebar").addEventListener("click", () => setMobile(true)); $("#closeSidebar").addEventListener("click", () => setMobile(false)); mobileScrim.addEventListener("click", () => setMobile(false));
    $("#newCanvasButton").addEventListener("click", () => { clearPrompt(); setView("create"); });
    $$(".side-nav-item[data-view]").forEach(item => item.addEventListener("click", () => setView(item.dataset.view)));
    $$('[data-action="create"]').forEach(item => item.addEventListener("click", () => setView("create")));
    $$('[data-coming-soon]').forEach(item => item.addEventListener("click", () => showToast(`${item.dataset.comingSoon} is coming soon`)));
    $("#filterButton").addEventListener("click", () => { $("#galleryToolbar").hidden = !$("#galleryToolbar").hidden; }); $("#searchInput").addEventListener("input", renderGallery); $("#clearSearch").addEventListener("click", () => { searchInput.value = ""; renderGallery(); }); $("#allFramesButton").addEventListener("click", () => { searchInput.value = ""; renderGallery(); });
    $("#attachButton").addEventListener("click", () => $("#referenceInput").click()); $("#referenceInput").addEventListener("change", event => { const file = event.target.files?.[0]; if (!file) return; $("#referenceLabel").textContent = file.name; $("#attachButton").classList.add("attached"); showToast("Reference attached", "The file is ready for your next direction."); });
    galleryGrid.addEventListener("click", event => { const action = event.target.closest("[data-gallery-action]")?.dataset.galleryAction; const card = event.target.closest("[data-id]"); if (!action || !card) return; const item = findItem(card.dataset.id); if (!item) return; if (action === "open") openLightbox(item); if (action === "favorite") { item.favorite = !item.favorite; save("gallery", state.gallery); renderGallery(); } if (action === "copy") copyText(item.prompt); if (action === "download") downloadImage(item); if (action === "more") showToast("More image actions are coming soon"); });
    $("#historyList").addEventListener("click", event => { const row = event.target.closest("[data-history-prompt]"); if (!row) return; promptInput.value = row.dataset.historyPrompt; $("#charCount").textContent = promptInput.value.length; setView("create"); promptInput.focus(); });
    $("#closeLightbox").addEventListener("click", closeLightbox); $("#lightbox").addEventListener("click", event => { if (event.target.id === "lightbox") closeLightbox(); }); $("#copyLightbox").addEventListener("click", () => state.selected && copyText(state.selected.prompt)); $("#downloadLightbox").addEventListener("click", () => state.selected && downloadImage(state.selected));
    $("#heroReference").addEventListener("error", event => { if (event.currentTarget.src !== event.currentTarget.dataset.fallback) event.currentTarget.src = event.currentTarget.dataset.fallback; }, { once: true }); $("#lightboxImage").addEventListener("error", event => { if (event.currentTarget.src !== event.currentTarget.dataset.fallback) event.currentTarget.src = event.currentTarget.dataset.fallback; }, { once: true });
    document.addEventListener("keydown", event => { if (event.key === "Escape") { closeLightbox(); setMobile(false); } if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") { event.preventDefault(); clearPrompt(); setView("create"); promptInput.focus(); } });
  }

  function init() { document.documentElement.dataset.theme = state.theme; renderStyleOptions(); renderGallery(); renderHistory(); bindEvents(); refreshIcons(); }
  init();
})();

const state = {
  params: {
    prompt: '',
    negativePrompt: '',
    aspectRatio: '1:1',
    style: 'None',
    provider: 'pollinations'
  },
  keys: JSON.parse(localStorage.getItem('aura-ai-keys') || '{}'),
  history: JSON.parse(localStorage.getItem('aura-ai-history') || '[]'),
  isGenerating: false
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const els = {
  provider: $('#providerSelect'), prompt: $('#prompt'), negativePrompt: $('#negativePrompt'), ratio: $('#aspectRatio'), style: $('#style'),
  generate: $('#generateButton'), stage: $('#canvasStage'), title: $('#canvasTitle'), help: $('#providerHelp'), gallery: $('#galleryGrid'),
  modal: $('#keyModal'), googleKey: $('#googleKey'), huggingfaceKey: $('#huggingfaceKey'), keyIndicator: $('#keyIndicator'), keyStatus: $('#keyStatusText'),
  toasts: $('#toastStack'), canvasStatus: $('#canvasStatus'), canvasStatusWrap: $('.canvas-status'), downloadImage: $('#downloadImage'), reuseImage: $('#reuseImage')
};

function saveState() {
  localStorage.setItem('aura-ai-keys', JSON.stringify(state.keys));
  localStorage.setItem('aura-ai-history', JSON.stringify(state.history));
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  els.toasts.appendChild(toast);
  window.setTimeout(() => toast.remove(), 4000);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function hasActiveKey() {
  if (state.params.provider === 'pollinations') return true;
  return Boolean(state.params.provider === 'google' ? state.keys.google : state.keys.huggingface);
}

function updateProviderUI() {
  const providerName = els.provider.options[els.provider.selectedIndex].textContent;
  const keyRequired = state.params.provider !== 'pollinations';
  els.help.textContent = keyRequired
    ? `${providerName} requires an API key saved in API settings.`
    : 'Pollinations can be used without an API key.';
  els.keyIndicator.classList.toggle('active', hasActiveKey());
  els.keyStatus.textContent = hasActiveKey() ? 'Connected' : 'API keys';
}

function openKeyModal() {
  els.googleKey.value = state.keys.google || '';
  els.huggingfaceKey.value = state.keys.huggingface || '';
  els.modal.hidden = false;
  els.googleKey.focus();
}
function closeKeyModal() { els.modal.hidden = true; }

function renderGallery() {
  if (!state.history.length) {
    els.gallery.innerHTML = '<p class="empty-history">Your generated images will be saved in this browser.</p>';
    return;
  }
  els.gallery.innerHTML = state.history.map((item) => `
    <article class="gallery-card">
      <img src="${item.url}" alt="${escapeHtml(item.prompt)}" loading="lazy">
      <p>${escapeHtml(item.prompt)}<br><small>${escapeHtml(item.provider)} · ${new Date(item.timestamp).toLocaleDateString()}</small></p>
    </article>
  `).join('');
}

function showLoading() {
  els.title.textContent = 'Creating your image...';
  els.canvasStatus.textContent = 'Generating your image';
  els.canvasStatusWrap.classList.add('busy');
  els.downloadImage.disabled = true; els.reuseImage.disabled = true;
  els.stage.innerHTML = '<div class="canvas-loading"><div class="loader-ring"></div><p>AURA.AI is bringing your prompt to life.</p></div>';
}

function showResult(result) {
  els.title.textContent = 'Your image is ready';
  els.canvasStatus.textContent = 'Ready to download or reuse';
  els.canvasStatusWrap.classList.remove('busy');
  els.stage.classList.add('has-image');
  els.downloadImage.disabled = false; els.reuseImage.disabled = false;
  els.stage.innerHTML = `<img class="canvas-image" src="${result.url}" alt="${escapeHtml(result.prompt)}">`;
  els.downloadImage.dataset.url = result.url; els.reuseImage.dataset.prompt = result.prompt;
}

function showError(message) {
  els.title.textContent = 'Generation failed';
  els.canvasStatus.textContent = 'Needs attention';
  els.canvasStatusWrap.classList.remove('busy');
  els.downloadImage.disabled = true; els.reuseImage.disabled = true;
  els.stage.classList.remove('has-image');
  els.stage.innerHTML = `<div class="canvas-error">${escapeHtml(message)}</div>`;
}

function buildPrompt() {
  const style = state.params.style !== 'None' ? `, ${state.params.style} style` : '';
  const negative = state.params.negativePrompt.trim() ? ` Avoid: ${state.params.negativePrompt.trim()}.` : '';
  return `${state.params.prompt.trim()}${style}.${negative}`;
}

async function generateWithPollinations(prompt) {
  const encoded = encodeURIComponent(prompt);
  const seed = Math.floor(Math.random() * 999999);
  const width = state.params.aspectRatio === '16:9' || state.params.aspectRatio === '4:3' ? 1280 : 1024;
  const height = state.params.aspectRatio === '9:16' || state.params.aspectRatio === '3:4' ? 1280 : 1024;
  return { url: `https://image.pollinations.ai/prompt/${encoded}?width=${width}&height=${height}&seed=${seed}&nologo=true`, provider: 'Pollinations' };
}

async function generateWithOpenAICompatibleProvider(prompt) {
  const key = state.params.provider === 'google' ? state.keys.google : state.keys.huggingface;
  throw new Error(`${state.params.provider === 'google' ? 'Google Imagen' : 'FLUX.1'} is selected. Connect its provider endpoint in script.js before using it.`);
}

async function handleGenerate() {
  const prompt = els.prompt.value.trim();
  state.params.prompt = prompt;
  state.params.negativePrompt = els.negativePrompt.value;
  state.params.aspectRatio = els.ratio.value;
  state.params.style = els.style.value;
  if (!prompt) return showToast('Please enter a prompt first.', 'error');
  if (!hasActiveKey()) { openKeyModal(); return showToast('Save the selected provider API key first.', 'error'); }
  if (state.isGenerating) return;
  state.isGenerating = true; els.generate.disabled = true; els.generate.innerHTML = '<span>Generating...</span><b>✦</b>'; showLoading();
  try {
    const finalPrompt = buildPrompt();
    const result = state.params.provider === 'pollinations' ? await generateWithPollinations(finalPrompt) : await generateWithOpenAICompatibleProvider(finalPrompt);
    const record = { ...result, prompt, timestamp: Date.now(), aspectRatio: state.params.aspectRatio, style: state.params.style };
    state.history = [record, ...state.history].slice(0, 30); saveState(); renderGallery(); showResult(record); showToast('Image generated successfully.');
  } catch (error) { showError(error.message || 'Something went wrong. Please try again.'); showToast(error.message || 'Generation failed.', 'error'); }
  finally { state.isGenerating = false; els.generate.disabled = false; els.generate.innerHTML = '<span>Generate image</span><b>↗</b>'; }
}

els.provider.addEventListener('change', () => { state.params.provider = els.provider.value; updateProviderUI(); if (!hasActiveKey()) openKeyModal(); });
const quickPrompt = $('#quickPrompt');
const quickGenerate = $('#quickGenerate');
function useLandingPrompt(value) { if (!value) return; els.prompt.value = value; quickPrompt.value = value; els.prompt.focus(); document.querySelector('.control-panel').scrollIntoView({ behavior: 'smooth', block: 'start' }); showToast('Prompt loaded into the studio.', 'info'); }
quickGenerate.addEventListener('click', () => { useLandingPrompt(quickPrompt.value.trim()); if (quickPrompt.value.trim()) handleGenerate(); else showToast('Enter a prompt first.', 'error'); });
quickPrompt.addEventListener('keydown', (event) => { if (event.key === 'Enter') { event.preventDefault(); quickGenerate.click(); } });
$$('.reference-thumb').forEach((button) => button.addEventListener('click', () => useLandingPrompt(button.dataset.starter)));
$('#useFeaturedPrompt').addEventListener('click', () => useLandingPrompt('Photorealistic cat resting on a wooden café table, warm pendant lights, shallow depth of field, editorial photography'));
$$('[data-starter]').forEach((button) => button.addEventListener('click', () => useLandingPrompt(button.dataset.starter)));
els.downloadImage.addEventListener('click', () => { const url = els.downloadImage.dataset.url; if (!url) return; const link = document.createElement('a'); link.href = url; link.download = `go-ai-${Date.now()}.png`; link.target = '_blank'; link.click(); });
els.reuseImage.addEventListener('click', () => { if (!els.reuseImage.dataset.prompt) return; els.prompt.value = els.reuseImage.dataset.prompt; els.prompt.focus(); showToast('Prompt restored for another variation.', 'info'); });
els.generate.addEventListener('click', handleGenerate);
$('#openKeys').addEventListener('click', openKeyModal);
$('#closeKeys').addEventListener('click', closeKeyModal);
$('#saveKeys').addEventListener('click', () => { state.keys.google = els.googleKey.value.trim(); state.keys.huggingface = els.huggingfaceKey.value.trim(); saveState(); updateProviderUI(); closeKeyModal(); showToast('API keys saved in this browser.'); });
$('#removeKeys').addEventListener('click', () => { state.keys = {}; saveState(); updateProviderUI(); els.googleKey.value = ''; els.huggingfaceKey.value = ''; showToast('API keys removed.'); });
$('#clearHistory').addEventListener('click', () => { state.history = []; saveState(); renderGallery(); showToast('History cleared.'); });
els.modal.addEventListener('click', (event) => { if (event.target === els.modal) closeKeyModal(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeKeyModal(); if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') handleGenerate(); });

function getSavedUser() {
  try { return JSON.parse(localStorage.getItem('go-ai-session') || sessionStorage.getItem('go-ai-session') || 'null'); } catch { return null; }
}
function setLoggedIn(user, remember) {
  const value = JSON.stringify(user);
  if (remember) localStorage.setItem('go-ai-session', value);
  else sessionStorage.setItem('go-ai-session', value);
  $('#loginScreen').hidden = true;
  $('#appView').hidden = false;
  $('#userChip').textContent = user.name;
  updateProviderUI(); renderGallery();
}
function logOut() {
  localStorage.removeItem('go-ai-session');
  sessionStorage.removeItem('go-ai-session');
  $('#appView').hidden = true;
  $('#loginScreen').hidden = false;
  $('#loginForm').reset();
  showToast('You have been signed out.', 'info');
}
$('#loginForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const name = $('#loginName').value.trim();
  const email = $('#loginEmail').value.trim();
  const password = $('#loginPassword').value;
  if (!name || !email || password.length < 6) return showToast('Enter a name, valid email, and password with at least 6 characters.', 'error');
  setLoggedIn({ name, email }, $('#rememberLogin').checked);
  showToast(`Welcome, ${name}.`, 'info');
});
$('#logoutButton').addEventListener('click', logOut);
const existingUser = getSavedUser();
if (existingUser) setLoggedIn(existingUser, true);
else { $('#loginScreen').hidden = false; $('#appView').hidden = true; }

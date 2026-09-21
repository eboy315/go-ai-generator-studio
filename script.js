/**
 * Go-AI Generator - Premium Vanilla JavaScript Application
 * Turn your imagination into stunning AI-generated images.
 */

// Application State
const state = {
  theme: 'dark',
  user: null, // { name, email, createdAt }
  currentResults: [], // [{ id, url, prompt, style, size, timestamp, isFavorite }]
  isGenerating: false,
  progressInterval: null,
  activeExploreCategory: 'all',
  historyFilter: 'all',
  activeLightboxItem: null,
  pendingDeleteId: null
};

// Curated Explore Gallery Data
const EXPLORE_ITEMS = [
  {
    id: 'exp-1',
    prompt: 'A futuristic African metropolis at sunset, soaring biometric skyscrapers, hyper-detailed architecture, golden hour cinematic glow',
    category: 'cinematic',
    styleName: 'Cinematic',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1000&q=80',
    dimensions: '1024 × 1024'
  },
  {
    id: 'exp-2',
    prompt: 'Astronaut discovering glowing crystalline lifeforms on an ocean trench planet, deep blue bioluminescence, 8k render',
    category: 'fantasy',
    styleName: 'Fantasy',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
    dimensions: '1024 × 768'
  },
  {
    id: 'exp-3',
    prompt: 'Majestic ethereal snow leopard with cosmic starlight patterns on its fur, hyper-realistic macro photography, studio illumination',
    category: 'realistic',
    styleName: 'Realistic',
    url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=1000&q=80',
    dimensions: '1024 × 1024'
  },
  {
    id: 'exp-4',
    prompt: 'Vibrant cyberpunk alley in Neo-Tokyo, rain reflections, neon signs in kanji, hovering drones, cinematic depth of field',
    category: 'digital-art',
    styleName: 'Digital Art',
    url: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1000&q=80',
    dimensions: '768 × 1024'
  },
  {
    id: 'exp-5',
    prompt: 'Mecha warrior maiden overlooking floating cherry blossom islands, anime masterpiece, dynamic atmospheric lighting',
    category: 'anime',
    styleName: 'Anime',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80',
    dimensions: '1024 × 1024'
  },
  {
    id: 'exp-6',
    prompt: 'Geometric iridescent sculpture in a pristine brutalist museum hall, octane 3D render, soft ambient shadows, ultra crisp',
    category: '3d',
    styleName: '3D Render',
    url: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80',
    dimensions: '1024 × 1024'
  },
  {
    id: 'exp-7',
    prompt: 'Ancient mythical library suspended inside a giant hollow baobab tree, scrolls and floating orbs, warm amber illumination',
    category: 'fantasy',
    styleName: 'Fantasy',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80',
    dimensions: '1024 × 768'
  },
  {
    id: 'exp-8',
    prompt: 'Intricate mechanical chronometer heart made of polished brass and glowing blue plasma, cinematic macro close-up',
    category: '3d',
    styleName: '3D Render',
    url: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1000&q=80',
    dimensions: '1024 × 1024'
  }
];

// Style prompt modifiers for natural prompt composition
const STYLE_MODIFIERS = {
  realistic: 'photorealistic, 8k resolution, ultra-detailed photograph, natural volumetric lighting, raw photo, sharp focus',
  cinematic: 'cinematic still, 35mm film photograph, dramatic rim lighting, cinematic color grading, depth of field, 8k',
  anime: 'vibrant Japanese anime illustration, Makoto Shinkai style, clean crisp line art, beautiful ambient illumination, masterpiece',
  'digital-art': 'award-winning digital concept art, trending on ArtStation, vivid colors, intricate composition, detailed brushwork',
  fantasy: 'epic high fantasy scene, mythical aura, magical glowing particles, highly ornate architectural details, majestic atmosphere',
  '3d-render': 'octane 3D render, raytracing, physically based rendering, subsurface scattering, unreal engine 5 quality, hyperdetailed',
  watercolor: 'expressive watercolor painting, wet-on-wet technique, soft pastel color washes, paper texture grain, artistic splashes',
  cyberpunk: 'cyberpunk aesthetic, high-tech dystopian city, glowing neon violet and teal lights, chromatic reflections, volumetric fog',
  illustration: 'modern stylized editorial illustration, clean vector aesthetic, refined harmonious color palette, sophisticated design',
  minimalist: 'minimalist composition, vast elegant negative space, clean lines, muted architectural palette, serene simplicity'
};

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
});

function initializeApp() {
  initializeTheme();
  initializeNavigation();
  initializeAuth();
  initializeGenerator();
  initializeExplore();
  initializeHistory();
  initializeModals();
  initializePromptSuggestions();
}

/* ==========================================================================
   THEME MANAGEMENT
   ========================================================================== */
function initializeTheme() {
  const savedTheme = localStorage.getItem('go_ai_theme') || 'dark';
  setTheme(savedTheme);

  const themeToggleButtons = document.querySelectorAll('.theme-toggle-btn');
  themeToggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      setTheme(nextTheme);
      showToast(`Switched to ${nextTheme} mode`, 'info');
    });
  });
}

function setTheme(theme) {
  state.theme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('go_ai_theme', theme);

  // Update theme toggle icons
  const themeToggles = document.querySelectorAll('.theme-toggle-btn');
  themeToggles.forEach(btn => {
    btn.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  });
}

/* ==========================================================================
   NAVIGATION & MOBILE DRAWER
   ========================================================================== */
function initializeNavigation() {
  const hamburgerBtn = document.getElementById('mobileHamburgerBtn');
  const drawerBackdrop = document.getElementById('mobileMenuBackdrop');
  const drawer = document.getElementById('mobileMenuDrawer');
  const closeDrawerBtn = document.getElementById('closeMobileDrawerBtn');
  const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');

  function openDrawer() {
    drawerBackdrop?.classList.add('show');
    drawer?.classList.add('show');
    document.body.classList.add('modal-open');
  }

  function closeDrawer() {
    drawerBackdrop?.classList.remove('show');
    drawer?.classList.remove('show');
    document.body.classList.remove('modal-open');
  }

  hamburgerBtn?.addEventListener('click', openDrawer);
  closeDrawerBtn?.addEventListener('click', closeDrawer);
  drawerBackdrop?.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer?.classList.contains('show')) {
      closeDrawer();
    }
  });

  // Active section tracking and smooth scroll
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        closeDrawer();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          e.preventDefault();
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  });

  // Highlight links on scroll
  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        document.querySelectorAll(`.nav-link[href*="${sectionId}"]`).forEach(el => {
          el.classList.add('active');
        });
      } else {
        document.querySelectorAll(`.nav-link[href*="${sectionId}"]`).forEach(el => {
          el.classList.remove('active');
        });
      }
    });
  });
}

/* ==========================================================================
   AUTHENTICATION (DEMO SESSION)
   ========================================================================== */
function initializeAuth() {
  // Load saved user session
  const storedUser = localStorage.getItem('go_ai_user');
  if (storedUser) {
    try {
      state.user = JSON.parse(storedUser);
    } catch (e) {
      state.user = null;
    }
  }

  updateAuthUI();

  // Login modal trigger buttons
  const loginBtns = document.querySelectorAll('.btn-login, #authTriggerBtn, #mobileLoginBtn');
  loginBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      openAuthModal('login');
    });
  });

  // Switch Auth Tabs
  const authTabs = document.querySelectorAll('.auth-tab-btn');
  authTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetMode = tab.dataset.mode;
      switchAuthMode(targetMode);
    });
  });

  // Password Visibility Toggle
  const togglePassBtns = document.querySelectorAll('.password-toggle-btn');
  togglePassBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetInputId = btn.dataset.target;
      const input = document.getElementById(targetInputId);
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;
        } else {
          input.type = 'password';
          btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
        }
      }
    });
  });

  // Form Submissions
  const loginForm = document.getElementById('loginForm');
  loginForm?.addEventListener('submit', handleLogin);

  const signupForm = document.getElementById('signupForm');
  signupForm?.addEventListener('submit', handleSignup);

  // Forgot Password Demo link
  document.getElementById('forgotPasswordLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Password reset link sent to your registered email (demo)', 'info');
  });

  // Profile Dropdown Toggle
  const profileBtn = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown');

  profileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown?.classList.toggle('show');
  });

  document.addEventListener('click', (e) => {
    if (!profileDropdown?.contains(e.target) && !profileBtn?.contains(e.target)) {
      profileDropdown?.classList.remove('show');
    }
  });

  // Profile Dropdown Actions
  document.getElementById('logoutDropdownBtn')?.addEventListener('click', handleLogout);
  document.getElementById('mobileLogoutBtn')?.addEventListener('click', handleLogout);

  document.getElementById('profileHistoryLink')?.addEventListener('click', () => {
    profileDropdown?.classList.remove('show');
    document.getElementById('history')?.scrollIntoView({ behavior: 'smooth' });
    setHistoryFilter('all');
  });

  document.getElementById('profileFavoritesLink')?.addEventListener('click', () => {
    profileDropdown?.classList.remove('show');
    document.getElementById('history')?.scrollIntoView({ behavior: 'smooth' });
    setHistoryFilter('favorites');
  });
}

function updateAuthUI() {
  const isAuth = !!state.user;
  const loginBtns = document.querySelectorAll('.btn-login');
  const profileWrapper = document.getElementById('profileMenuWrapper');
  const profileName = document.getElementById('profileName');
  const profileAvatar = document.getElementById('profileAvatar');
  const dropdownUserName = document.getElementById('dropdownUserName');
  const dropdownUserEmail = document.getElementById('dropdownUserEmail');

  const mobileLoginBtn = document.getElementById('mobileLoginBtn');
  const mobileProfileBlock = document.getElementById('mobileProfileBlock');
  const mobileUserName = document.getElementById('mobileUserName');

  if (isAuth) {
    loginBtns.forEach(btn => btn.style.display = 'none');
    if (profileWrapper) profileWrapper.style.display = 'block';

    const initial = state.user.name.charAt(0).toUpperCase();
    if (profileName) profileName.textContent = state.user.name;
    if (profileAvatar) profileAvatar.textContent = initial;
    if (dropdownUserName) dropdownUserName.textContent = state.user.name;
    if (dropdownUserEmail) dropdownUserEmail.textContent = state.user.email;

    if (mobileLoginBtn) mobileLoginBtn.style.display = 'none';
    if (mobileProfileBlock) mobileProfileBlock.style.display = 'flex';
    if (mobileUserName) mobileUserName.textContent = state.user.name;
  } else {
    loginBtns.forEach(btn => btn.style.display = 'inline-flex');
    if (profileWrapper) profileWrapper.style.display = 'none';

    if (mobileLoginBtn) mobileLoginBtn.style.display = 'block';
    if (mobileProfileBlock) mobileProfileBlock.style.display = 'none';
  }

  // Refresh history display based on auth state
  loadHistory(state.historyFilter);
}

function openAuthModal(mode = 'login') {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  switchAuthMode(mode);
  modal.classList.add('show');
  document.body.classList.add('modal-open');
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (!modal) return;
  modal.classList.remove('show');
  document.body.classList.remove('modal-open');
}

function switchAuthMode(mode) {
  const tabs = document.querySelectorAll('.auth-tab-btn');
  const forms = document.querySelectorAll('.auth-form');

  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  });

  forms.forEach(form => {
    form.classList.toggle('active', form.dataset.mode === mode);
  });
}
window.switchAuthMode = switchAuthMode;

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail')?.value.trim();
  const password = document.getElementById('loginPassword')?.value;

  if (!email || !password) {
    showToast('Please enter both email and password', 'error');
    return;
  }

  // Demo user identification
  const derivedName = email.split('@')[0].replace(/[._-]/g, ' ');
  const formattedName = derivedName
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  state.user = {
    name: formattedName || 'Creative User',
    email: email,
    createdAt: new Date().toISOString()
  };

  localStorage.setItem('go_ai_user', JSON.stringify(state.user));
  updateAuthUI();
  closeAuthModal();
  showToast(`Welcome back, ${state.user.name}!`, 'success');
}

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signupName')?.value.trim();
  const email = document.getElementById('signupEmail')?.value.trim();
  const password = document.getElementById('signupPassword')?.value;
  const confirm = document.getElementById('signupConfirmPassword')?.value;
  const terms = document.getElementById('signupTerms')?.checked;

  if (!name || !email || !password) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  if (password.length < 6) {
    showToast('Password must be at least 6 characters', 'error');
    return;
  }

  if (password !== confirm) {
    showToast('Passwords do not match', 'error');
    return;
  }

  if (!terms) {
    showToast('Please agree to the Terms of Service', 'error');
    return;
  }

  state.user = {
    name: name,
    email: email,
    createdAt: new Date().toISOString()
  };

  localStorage.setItem('go_ai_user', JSON.stringify(state.user));
  updateAuthUI();
  closeAuthModal();
  showToast(`Account created successfully! Welcome, ${name}`, 'success');
}

function handleLogout() {
  state.user = null;
  localStorage.removeItem('go_ai_user');
  updateAuthUI();
  document.getElementById('profileDropdown')?.classList.remove('show');
  showToast('Signed out successfully', 'info');
}

/* ==========================================================================
   GENERATOR LOGIC
   ========================================================================== */
function initializeGenerator() {
  const promptTextarea = document.getElementById('promptTextarea');
  const promptCounter = document.getElementById('promptCounter');
  const clearPromptBtn = document.getElementById('clearPromptBtn');
  const enhancePromptBtn = document.getElementById('enhancePromptBtn');
  const generateBtn = document.getElementById('generateBtn');

  // Character counter
  promptTextarea?.addEventListener('input', () => {
    const len = promptTextarea.value.length;
    if (promptCounter) promptCounter.textContent = `${len} / 500`;
  });

  // Clear prompt
  clearPromptBtn?.addEventListener('click', () => {
    if (promptTextarea) {
      promptTextarea.value = '';
      if (promptCounter) promptCounter.textContent = '0 / 500';
      promptTextarea.focus();
    }
  });

  // Enhance prompt
  enhancePromptBtn?.addEventListener('click', () => {
    const current = promptTextarea?.value.trim();
    if (!current) {
      showToast('Please type a base prompt to enhance', 'info');
      promptTextarea?.focus();
      return;
    }
    const enhancements = [
      'cinematic studio lighting, ultra-fine details, 8k resolution, photorealistic masterpiece',
      'volumetric light rays, intricate organic textures, trending on ArtStation, majestic atmosphere',
      'sharp focal depth, dynamic color grading, hyper-detailed rendering, epic composition',
      'ethereal glow, natural ambient illumination, award-winning concept art, masterpiece'
    ];
    const picked = enhancements[Math.floor(Math.random() * enhancements.length)];
    promptTextarea.value = `${current}, ${picked}`;
    const len = promptTextarea.value.length;
    if (promptCounter) promptCounter.textContent = `${len} / 500`;
    showToast('Prompt enhanced with creative visual details!', 'success');
  });

  // Style selector buttons
  const stylePills = document.querySelectorAll('.style-pill');
  stylePills.forEach(pill => {
    pill.addEventListener('click', () => {
      stylePills.forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
    });
  });

  // Size selector buttons
  const sizeBtns = document.querySelectorAll('.size-option-btn');
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sizeBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // Count selector buttons
  const countBtns = document.querySelectorAll('.count-option-btn');
  countBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      countBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // Generate Button Click
  generateBtn?.addEventListener('click', () => {
    executeGeneration();
  });

  // Ctrl+Enter or Cmd+Enter trigger
  promptTextarea?.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      executeGeneration();
    }
  });
}

function getSelectedGeneratorOptions() {
  const prompt = document.getElementById('promptTextarea')?.value.trim() || '';

  const selectedStyleEl = document.querySelector('.style-pill.selected');
  const style = selectedStyleEl?.dataset.style || 'realistic';
  const styleName = selectedStyleEl?.querySelector('.style-pill-name')?.textContent || 'Realistic';

  const selectedSizeEl = document.querySelector('.size-option-btn.selected');
  const width = parseInt(selectedSizeEl?.dataset.width || '1024', 10);
  const height = parseInt(selectedSizeEl?.dataset.height || '1024', 10);
  const sizeLabel = selectedSizeEl?.textContent || '1024 × 1024';

  const selectedCountEl = document.querySelector('.count-option-btn.selected');
  const count = parseInt(selectedCountEl?.dataset.count || '1', 10);

  return { prompt, style, styleName, width, height, sizeLabel, count };
}

async function executeGeneration() {
  const options = getSelectedGeneratorOptions();

  if (!options.prompt) {
    showToast('Please describe the image you want to create', 'error');
    document.getElementById('promptTextarea')?.focus();
    return;
  }

  if (state.isGenerating) return;

  state.isGenerating = true;
  showGenerationLoading();

  try {
    const generatedImages = await generateImages(options.prompt, options);
    state.currentResults = generatedImages;
    showGenerationSuccess(generatedImages, options);

    // Save each generated image to history if authenticated
    if (state.user) {
      generatedImages.forEach(img => {
        saveToHistory({
          id: img.id,
          url: img.url,
          prompt: options.prompt,
          style: options.styleName,
          size: options.sizeLabel,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          isFavorite: false
        });
      });
      showToast('Image generated & saved to your history!', 'success');
    } else {
      showToast('Image generated successfully! Sign in to save to history.', 'info');
    }
  } catch (error) {
    console.error('Generation Error:', error);
    showGenerationError(error.message || "We couldn't create your image right now. Please try again.");
  } finally {
    state.isGenerating = false;
  }
}

/**
 * Image Generation Engine
 * Synthesizes requests using natural prompt enhancements and verified resolution seeds
 */
async function generateImages(userPrompt, options) {
  const { style, width, height, count } = options;

  // Enhance prompt naturally based on chosen style
  const modifier = STYLE_MODIFIERS[style] || STYLE_MODIFIERS.realistic;
  const styledPrompt = `${userPrompt}, ${modifier}`;

  const requestTasks = Array.from({ length: count }).map((_, index) => {
    // Generate a unique seed for each variation
    const seed = Math.floor(Math.random() * 9999999) + index * 1000;
    const encodedPrompt = encodeURIComponent(styledPrompt);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

    return preloadImage(imageUrl, {
      id: `gen-${Date.now()}-${index}`,
      url: imageUrl,
      prompt: userPrompt,
      style: options.styleName,
      size: options.sizeLabel
    });
  });

  return await Promise.all(requestTasks);
}

/**
 * Preloads image and ensures it has loaded over the network before showing result
 */
function preloadImage(url, meta) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeoutTimer = setTimeout(() => {
      // If network takes longer than 35s, reject with friendly message
      reject(new Error("Image creation took longer than expected. Please check your connection and retry."));
    }, 35000);

    img.onload = () => {
      clearTimeout(timeoutTimer);
      resolve({ ...meta, url });
    };

    img.onerror = () => {
      clearTimeout(timeoutTimer);
      // Try fallback to standard dimensions if extreme resolution had an issue
      const fallbackUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(meta.prompt)}?width=512&height=512&seed=${Date.now()}&nologo=true`;
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve({ ...meta, url: fallbackUrl });
      fallbackImg.onerror = () => reject(new Error("We couldn't create your image right now. Please try again."));
      fallbackImg.src = fallbackUrl;
    };

    img.src = url;
  });
}

/* ==========================================================================
   PROGRESS RING & GENERATION STATES
   ========================================================================== */
function showGenerationLoading() {
  const emptyState = document.getElementById('previewEmptyState');
  const loadingState = document.getElementById('previewLoadingState');
  const successState = document.getElementById('previewSuccessState');
  const generateBtn = document.getElementById('generateBtn');

  if (emptyState) emptyState.style.display = 'none';
  if (successState) successState.classList.remove('active');
  if (loadingState) loadingState.classList.add('active');

  // Disable button and update text
  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.innerHTML = `
      <svg class="generate-btn-sparkle" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
      <span>Creating your image...</span>
    `;
  }

  // Animate progress ring
  const circle = document.getElementById('progressRingIndicator');
  const percentText = document.getElementById('progressRingPercent');
  const circumference = 377; // 2 * PI * 60

  let currentPercent = 0;
  clearInterval(state.progressInterval);

  state.progressInterval = setInterval(() => {
    // Smooth progress curve approaching 94%
    if (currentPercent < 92) {
      currentPercent += Math.floor(Math.random() * 4) + 1;
      if (currentPercent > 92) currentPercent = 92;
    }
    const offset = circumference - (currentPercent / 100) * circumference;
    if (circle) circle.style.strokeDashoffset = offset;
    if (percentText) percentText.textContent = `${currentPercent}%`;
  }, 350);
}

function showGenerationSuccess(results, options) {
  clearInterval(state.progressInterval);

  // Complete progress ring
  const circle = document.getElementById('progressRingIndicator');
  const percentText = document.getElementById('progressRingPercent');
  if (circle) circle.style.strokeDashoffset = 0;
  if (percentText) percentText.textContent = '100%';

  setTimeout(() => {
    const loadingState = document.getElementById('previewLoadingState');
    const successState = document.getElementById('previewSuccessState');
    const generateBtn = document.getElementById('generateBtn');

    if (loadingState) loadingState.classList.remove('active');
    if (successState) successState.classList.add('active');

    // Reset button
    if (generateBtn) {
      generateBtn.disabled = false;
      generateBtn.innerHTML = `
        <svg class="generate-btn-sparkle" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path>
        </svg>
        <span>Generate Image</span>
      `;
    }

    renderResultsGallery(results, options);
  }, 400);
}

function showGenerationError(message) {
  clearInterval(state.progressInterval);

  const emptyState = document.getElementById('previewEmptyState');
  const loadingState = document.getElementById('previewLoadingState');
  const successState = document.getElementById('previewSuccessState');
  const generateBtn = document.getElementById('generateBtn');

  if (loadingState) loadingState.classList.remove('active');
  if (successState) successState.classList.remove('active');
  if (emptyState) emptyState.style.display = 'flex';

  if (generateBtn) {
    generateBtn.disabled = false;
    generateBtn.innerHTML = `
      <svg class="generate-btn-sparkle" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"></path>
      </svg>
      <span>Generate Image</span>
    `;
  }

  showToast(message, 'error');
}

function renderResultsGallery(results, options) {
  const gallery = document.getElementById('resultsGallery');
  const promptSummary = document.getElementById('resultPromptSummary');
  if (!gallery) return;

  gallery.dataset.count = results.length;
  gallery.innerHTML = '';

  if (promptSummary) {
    promptSummary.textContent = `"${options.prompt}"`;
    promptSummary.title = options.prompt;
  }

  results.forEach(item => {
    const card = document.createElement('div');
    card.className = 'result-image-card';
    card.innerHTML = `
      <img src="${item.url}" alt="${escapeHtml(item.prompt)}" loading="eager">
      <button class="result-overlay-btn" title="View in Lightbox" aria-label="View Fullscreen">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 3 21 3 21 9"></polyline>
          <polyline points="9 21 3 21 3 15"></polyline>
          <line x1="21" y1="3" x2="14" y2="10"></line>
          <line x1="3" y1="21" x2="10" y2="14"></line>
        </svg>
      </button>
    `;

    card.addEventListener('click', () => {
      openLightbox({
        url: item.url,
        prompt: item.prompt,
        styleName: options.styleName,
        dimensions: options.sizeLabel
      });
    });

    gallery.appendChild(card);
  });

  // Attach Result Toolbar actions
  const primaryItem = results[0];
  const downloadBtn = document.getElementById('resultDownloadBtn');
  const copyBtn = document.getElementById('resultCopyBtn');
  const favoriteBtn = document.getElementById('resultFavoriteBtn');
  const shareBtn = document.getElementById('resultShareBtn');
  const regenerateBtn = document.getElementById('resultRegenerateBtn');

  downloadBtn.onclick = () => downloadImage(primaryItem.url, `go-ai-${Date.now()}.png`);
  copyBtn.onclick = () => copyText(options.prompt, 'Prompt copied to clipboard');
  shareBtn.onclick = () => shareImage(primaryItem.url, options.prompt);
  regenerateBtn.onclick = () => executeGeneration();

  favoriteBtn.onclick = () => {
    if (!state.user) {
      showProtectedFeatureModal('Sign in to favorite and organize your creations.');
      return;
    }
    primaryItem.isFavorite = !primaryItem.isFavorite;
    favoriteBtn.classList.toggle('favorited', primaryItem.isFavorite);
    updateHistoryItemFavorite(primaryItem.id, primaryItem.isFavorite);
    showToast(primaryItem.isFavorite ? 'Added to favorites' : 'Removed from favorites', 'info');
  };
}

/* ==========================================================================
   IMAGE HISTORY & FAVORITES
   ========================================================================== */
function initializeHistory() {
  const tabs = document.querySelectorAll('.history-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      setHistoryFilter(tab.dataset.filter);
    });
  });

  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  clearHistoryBtn?.addEventListener('click', () => {
    if (!state.user) {
      showProtectedFeatureModal('Sign in to manage your generation history.');
      return;
    }
    const history = getStoredHistory();
    if (history.length === 0) {
      showToast('History is already empty', 'info');
      return;
    }
    openConfirmModal({
      title: 'Clear History?',
      desc: 'This will permanently remove all saved creations from your browser history. This action cannot be undone.',
      onConfirm: () => {
        localStorage.removeItem('go_ai_history');
        loadHistory(state.historyFilter);
        showToast('Generation history cleared', 'info');
      }
    });
  });
}

function setHistoryFilter(filter) {
  state.historyFilter = filter;
  loadHistory(filter);
}

function getStoredHistory() {
  try {
    const raw = localStorage.getItem('go_ai_history');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveToHistory(item) {
  const history = getStoredHistory();
  // Add newest first, cap at 50 items
  history.unshift(item);
  if (history.length > 50) history.pop();
  localStorage.setItem('go_ai_history', JSON.stringify(history));
  loadHistory(state.historyFilter);
}

function updateHistoryItemFavorite(id, isFavorite) {
  const history = getStoredHistory();
  const target = history.find(h => h.id === id);
  if (target) {
    target.isFavorite = isFavorite;
    localStorage.setItem('go_ai_history', JSON.stringify(history));
    loadHistory(state.historyFilter);
  }
}

function deleteHistoryItem(id) {
  let history = getStoredHistory();
  history = history.filter(h => h.id !== id);
  localStorage.setItem('go_ai_history', JSON.stringify(history));
  loadHistory(state.historyFilter);
  showToast('Creation removed from history', 'info');
}

function loadHistory(filter = 'all') {
  const container = document.getElementById('historyGrid');
  if (!container) return;

  // If user is logged out, show protected message
  if (!state.user) {
    container.innerHTML = `
      <div class="history-empty-placeholder">
        <div class="empty-state-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h3 class="empty-state-title">Sign in to save your creations</h3>
        <p class="empty-state-desc">Your personal history and favorites are preserved in your account session.</p>
        <button class="btn btn-primary btn-sm" id="historySignInBtn">Sign In / Create Account</button>
      </div>
    `;
    document.getElementById('historySignInBtn')?.addEventListener('click', () => openAuthModal('login'));
    return;
  }

  let history = getStoredHistory();
  if (filter === 'favorites') {
    history = history.filter(h => h.isFavorite);
  }

  if (history.length === 0) {
    container.innerHTML = `
      <div class="history-empty-placeholder">
        <div class="empty-state-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 14 14"></polyline>
          </svg>
        </div>
        <h3 class="empty-state-title">${filter === 'favorites' ? 'No favorites yet' : 'No creations saved yet'}</h3>
        <p class="empty-state-desc">${filter === 'favorites' ? 'Click the heart icon on any generated artwork to save it here.' : 'Generate your first artwork above and it will automatically be stored here.'}</p>
        <a href="#generator" class="btn btn-primary btn-sm">Start Creating</a>
      </div>
    `;
    return;
  }

  container.innerHTML = '';
  history.forEach(item => {
    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <div class="history-thumb-wrapper">
        <img src="${item.url}" alt="${escapeHtml(item.prompt)}" loading="lazy">
      </div>
      <div class="history-card-body">
        <p class="history-card-prompt" title="${escapeHtml(item.prompt)}">${escapeHtml(item.prompt)}</p>
        <div class="history-card-meta">
          <span class="gallery-tag">${escapeHtml(item.style)}</span>
          <span>${item.date}</span>
        </div>
        <div class="history-card-actions">
          <button class="action-icon-btn ${item.isFavorite ? 'favorited' : ''}" title="Favorite" data-fav-id="${item.id}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="${item.isFavorite ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
          </button>
          <div style="display:flex; gap:6px;">
            <button class="action-icon-btn" title="Download" data-download-url="${item.url}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
            <button class="action-icon-btn" title="Regenerate with this prompt" data-prompt="${escapeHtml(item.prompt)}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
              </svg>
            </button>
            <button class="action-icon-btn" title="Delete" data-delete-id="${item.id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    // Card thumb click opens lightbox
    card.querySelector('.history-thumb-wrapper').addEventListener('click', () => {
      openLightbox({
        url: item.url,
        prompt: item.prompt,
        styleName: item.style,
        dimensions: item.size
      });
    });

    // Favorite toggle
    card.querySelector('[data-fav-id]').addEventListener('click', () => {
      updateHistoryItemFavorite(item.id, !item.isFavorite);
    });

    // Download action
    card.querySelector('[data-download-url]').addEventListener('click', () => {
      downloadImage(item.url, `go-ai-${item.id}.png`);
    });

    // Regenerate action
    card.querySelector('[data-prompt]').addEventListener('click', () => {
      const textarea = document.getElementById('promptTextarea');
      if (textarea) {
        textarea.value = item.prompt;
        const counter = document.getElementById('promptCounter');
        if (counter) counter.textContent = `${item.prompt.length} / 500`;
        document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' });
        showToast('Prompt loaded into generator', 'info');
      }
    });

    // Delete action
    card.querySelector('[data-delete-id]').addEventListener('click', () => {
      deleteHistoryItem(item.id);
    });

    container.appendChild(card);
  });
}

/* ==========================================================================
   EXPLORE GALLERY
   ========================================================================== */
function initializeExplore() {
  const categoryTabs = document.querySelectorAll('.category-tab');
  categoryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      categoryTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      state.activeExploreCategory = tab.dataset.category;
      renderExploreGallery();
    });
  });

  renderExploreGallery();
}

function renderExploreGallery() {
  const grid = document.getElementById('exploreGalleryGrid');
  if (!grid) return;

  const category = state.activeExploreCategory;
  const filtered = category === 'all'
    ? EXPLORE_ITEMS
    : EXPLORE_ITEMS.filter(item => item.category === category);

  grid.innerHTML = '';
  filtered.forEach(item => {
    const el = document.createElement('div');
    el.className = 'gallery-item';
    el.innerHTML = `
      <img src="${item.url}" alt="${escapeHtml(item.prompt)}" loading="lazy">
      <div class="gallery-overlay">
        <p class="gallery-prompt-text">${escapeHtml(item.prompt)}</p>
        <div class="gallery-meta">
          <span class="gallery-tag">${item.styleName}</span>
          <span>${item.dimensions}</span>
        </div>
      </div>
    `;

    el.addEventListener('click', () => {
      openLightbox(item);
    });

    grid.appendChild(el);
  });
}

/* ==========================================================================
   PROMPT SUGGESTIONS ("Need Inspiration?")
   ========================================================================== */
function initializePromptSuggestions() {
  const ideaCards = document.querySelectorAll('.idea-card');
  const textarea = document.getElementById('promptTextarea');
  const counter = document.getElementById('promptCounter');

  ideaCards.forEach(card => {
    card.addEventListener('click', () => {
      const promptText = card.dataset.prompt;
      if (promptText && textarea) {
        textarea.value = promptText;
        if (counter) counter.textContent = `${promptText.length} / 500`;
        document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' });
        textarea.focus();
        showToast('Idea applied to generator!', 'success');
      }
    });
  });
}

/* ==========================================================================
   MODALS (LIGHTBOX, CONFIRMATION, PROTECTED)
   ========================================================================== */
function initializeModals() {
  // Lightbox Close
  const lightbox = document.getElementById('lightboxModal');
  const closeLightboxBtn = document.getElementById('closeLightboxBtn');

  closeLightboxBtn?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Auth Modal Close
  const authModal = document.getElementById('authModal');
  const closeAuthModalBtn = document.getElementById('closeAuthModalBtn');
  closeAuthModalBtn?.addEventListener('click', closeAuthModal);
  authModal?.addEventListener('click', (e) => {
    if (e.target === authModal) closeAuthModal();
  });

  // Confirmation Modal Close
  const confirmModal = document.getElementById('confirmModal');
  const cancelConfirmBtn = document.getElementById('cancelConfirmBtn');
  cancelConfirmBtn?.addEventListener('click', closeConfirmModal);
  confirmModal?.addEventListener('click', (e) => {
    if (e.target === confirmModal) closeConfirmModal();
  });

  // Global Escape Listener
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeLightbox();
      closeAuthModal();
      closeConfirmModal();
    }
  });
}

function openLightbox(item) {
  const modal = document.getElementById('lightboxModal');
  const img = document.getElementById('lightboxImage');
  const promptEl = document.getElementById('lightboxPrompt');
  const tagEl = document.getElementById('lightboxTag');
  const downloadBtn = document.getElementById('lightboxDownloadBtn');
  const shareBtn = document.getElementById('lightboxShareBtn');
  const copyBtn = document.getElementById('lightboxCopyBtn');
  const usePromptBtn = document.getElementById('lightboxUsePromptBtn');

  if (!modal || !img) return;

  state.activeLightboxItem = item;
  img.src = item.url;
  img.alt = item.prompt;

  if (promptEl) promptEl.textContent = item.prompt;
  if (tagEl) tagEl.textContent = item.styleName || 'AI Creation';

  downloadBtn.onclick = () => downloadImage(item.url, `go-ai-${Date.now()}.png`);
  shareBtn.onclick = () => shareImage(item.url, item.prompt);
  copyBtn.onclick = () => copyText(item.prompt, 'Prompt copied to clipboard');

  usePromptBtn.onclick = () => {
    const textarea = document.getElementById('promptTextarea');
    if (textarea) {
      textarea.value = item.prompt;
      const counter = document.getElementById('promptCounter');
      if (counter) counter.textContent = `${item.prompt.length} / 500`;
      closeLightbox();
      document.getElementById('generator')?.scrollIntoView({ behavior: 'smooth' });
      textarea.focus();
      showToast('Loaded prompt into generator!', 'success');
    }
  };

  modal.classList.add('show');
  document.body.classList.add('modal-open');
}

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  if (!modal) return;
  modal.classList.remove('show');
  document.body.classList.remove('modal-open');
}

let confirmCallback = null;

function openConfirmModal({ title, desc, onConfirm }) {
  const modal = document.getElementById('confirmModal');
  const titleEl = document.getElementById('confirmModalTitle');
  const descEl = document.getElementById('confirmModalDesc');
  const confirmBtn = document.getElementById('actionConfirmBtn');

  if (!modal) return;

  if (titleEl) titleEl.textContent = title;
  if (descEl) descEl.textContent = desc;

  confirmCallback = onConfirm;

  confirmBtn.onclick = () => {
    if (confirmCallback) confirmCallback();
    closeConfirmModal();
  };

  modal.classList.add('show');
  document.body.classList.add('modal-open');
}

function closeConfirmModal() {
  const modal = document.getElementById('confirmModal');
  if (!modal) return;
  modal.classList.remove('show');
  document.body.classList.remove('modal-open');
  confirmCallback = null;
}

function showProtectedFeatureModal(message) {
  showToast(message, 'info');
  setTimeout(() => {
    openAuthModal('login');
  }, 400);
}

/* ==========================================================================
   DOWNLOAD, COPY, SHARE UTILITIES
   ========================================================================== */
async function downloadImage(url, filename = 'go-ai-artwork.png') {
  try {
    showToast('Preparing your image download...', 'info');
    // Fetch image as blob to bypass cross-origin browser download restrictions
    const res = await fetch(url);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);

    showToast('Image downloaded successfully!', 'success');
  } catch (err) {
    // Fallback direct link trigger if CORS blocks blob fetch
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Image opened for download', 'success');
  }
}

function copyText(text, successMsg = 'Copied to clipboard!') {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg, 'success');
    }).catch(() => {
      fallbackCopyText(text, successMsg);
    });
  } else {
    fallbackCopyText(text, successMsg);
  }
}

function fallbackCopyText(text, successMsg) {
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  showToast(successMsg, 'success');
}

async function shareImage(url, prompt) {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'Go-AI Generated Artwork',
        text: `Check out this AI artwork: "${prompt}"`,
        url: url
      });
      showToast('Artwork shared successfully!', 'success');
    } catch (e) {
      if (e.name !== 'AbortError') {
        copyText(url, 'Artwork link copied to clipboard!');
      }
    }
  } else {
    copyText(url, 'Artwork link copied to clipboard!');
  }
}

/* ==========================================================================
   TOAST NOTIFICATION ENGINE
   ========================================================================== */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconSvg = '';
  if (type === 'success') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
  } else if (type === 'error') {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
  } else {
    iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `
    <span class="toast-icon">${iconSvg}</span>
    <span class="toast-message">${escapeHtml(message)}</span>
  `;

  container.appendChild(toast);

  // Animate enter
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  // Auto dismiss
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode === container) {
        container.removeChild(toast);
      }
    }, 300);
  }, 3600);
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}


/* ==========================================
   HERO TYPEWRITER ANIMATION
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
    const typewriter = document.getElementById("typewriterText");

    if (!typewriter) return;

    const text = "Create Anything You Can Imagine";

    let index = 0;
    let deleting = false;

    function typeEffect() {
        if (!deleting) {
            typewriter.textContent = text.substring(0, index + 1);
            index++;

            if (index === text.length) {
                setTimeout(() => {
                    deleting = true;
                    typeEffect();
                }, 2200);

                return;
            }

            setTimeout(typeEffect, 75);
        } else {
            typewriter.textContent = text.substring(0, index - 1);
            index--;

            if (index === 0) {
                deleting = false;

                setTimeout(typeEffect, 500);
                return;
            }

            setTimeout(typeEffect, 40);
        }
    }

    typeEffect();
});



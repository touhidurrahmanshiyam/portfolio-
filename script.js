/**
 * Md. Touhidur Rahman Shiyam - Professional Academic Portfolio Script
 * Handles:
 *  - Dark / Light Mode Toggle with localStorage persistence
 *  - Sticky Navbar & Mobile Drawer Toggle
 *  - "More" Dropdown Menu for Desktop Navbar
 *  - Smooth Scrolling & Active Section Spy
 *  - Project Filter Tabs (All / EEE Hardware / Web Dev)
 *  - Feed / Blog / Script Modal Viewer
 *  - Video Resume Modal / Playback Launcher
 *  - Scroll Reveal Intersection Observer
 */

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. DARK / LIGHT THEME TOGGLE
  // ==========================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const themeToggleMobileBtn = document.getElementById('theme-toggle-mobile');
  const htmlEl = document.documentElement;

  // Initialize theme from storage or system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    htmlEl.classList.add('dark');
  } else {
    htmlEl.classList.remove('dark');
  }

  function toggleTheme() {
    htmlEl.classList.toggle('dark');
    const isDark = htmlEl.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
  if (themeToggleMobileBtn) themeToggleMobileBtn.addEventListener('click', toggleTheme);

  // ==========================================
  // 2. MOBILE DRAWER & NAVBAR "MORE" DROPDOWN
  // ==========================================
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileDrawerOverlay = document.getElementById('mobile-drawer-overlay');
  const closeDrawerBtn = document.getElementById('close-drawer-btn');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  function openMobileDrawer() {
    if (!mobileDrawer || !mobileDrawerOverlay) return;
    mobileDrawer.classList.remove('translate-x-full');
    mobileDrawerOverlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileDrawer() {
    if (!mobileDrawer || !mobileDrawerOverlay) return;
    mobileDrawer.classList.add('translate-x-full');
    mobileDrawerOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  }

  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobileDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', closeMobileDrawer);
  if (mobileDrawerOverlay) mobileDrawerOverlay.addEventListener('click', closeMobileDrawer);

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileDrawer();
    });
  });

  // Desktop "More" Dropdown Toggle
  const moreDropdownBtn = document.getElementById('more-dropdown-btn');
  const moreDropdownMenu = document.getElementById('more-dropdown-menu');

  if (moreDropdownBtn && moreDropdownMenu) {
    moreDropdownBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      moreDropdownMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!moreDropdownMenu.contains(e.target) && !moreDropdownBtn.contains(e.target)) {
        moreDropdownMenu.classList.add('hidden');
      }
    });

    // Close dropdown on clicking any item inside
    moreDropdownMenu.querySelectorAll('a').forEach(item => {
      item.addEventListener('click', () => {
        moreDropdownMenu.classList.add('hidden');
      });
    });
  }

  // ==========================================
  // 3. STRICT MULTI-PAGE VIEW ROUTER
  // ==========================================
  const validPages = [
    'home',
    'education',
    'projects',
    'experience',
    'participations',
    'achievements',
    'extracurricular',
    'skills',
    'hobbies',
    'recommendations',
    'feed'
  ];

  // Map potential alias hashes to standard page IDs
  const aliasMap = {
    'the-feed': 'feed',
    'about': 'home',
    'contact': 'home'
  };

  function normalizePageId(id) {
    if (!id) return 'home';
    const cleanId = id.replace(/^#/, '').toLowerCase().trim();
    if (validPages.includes(cleanId)) return cleanId;
    if (aliasMap[cleanId]) return aliasMap[cleanId];
    return 'home';
  }

  function navigateTo(rawPageId) {
    const pageId = normalizePageId(rawPageId);

    // 1. Hide all page-view containers
    const allPages = document.querySelectorAll('.page-view');
    allPages.forEach(page => {
      page.classList.remove('active');
    });

    // 2. Display ONLY the selected page view
    const targetPage = document.getElementById(`page-${pageId}`) || document.getElementById('page-home');
    if (targetPage) {
      targetPage.classList.add('active');
      // Ensure elements inside the newly visible page are revealed
      const pageReveals = targetPage.querySelectorAll('.reveal-on-scroll');
      pageReveals.forEach(el => el.classList.add('revealed'));
    }

    // 3. Scroll to the absolute top of the screen
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    // 4. Update active highlight state on navbar links (desktop & mobile)
    document.querySelectorAll('.nav-page-link, .mobile-nav-link').forEach(link => {
      const linkPage = link.getAttribute('data-page') || normalizePageId(link.getAttribute('href'));
      if (linkPage === pageId) {
        link.classList.add('active-page');
      } else {
        link.classList.remove('active-page');
      }
    });

    // 5. Update URL hash without extra reloads
    if (window.location.hash !== `#${pageId}`) {
      history.pushState(null, '', `#${pageId}`);
    }
  }

  // Expose router globally for any inline onclick handlers if needed
  window.navigateTo = navigateTo;

  // Intercept all clicks on internal links targeting one of the 11 pages
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[href^="#"], [data-page]');
    if (!link) return;

    // Check if it has data-page or is an internal anchor
    let targetPage = link.getAttribute('data-page');
    const href = link.getAttribute('href');

    if (!targetPage && href && href.startsWith('#')) {
      const targetHash = href.replace(/^#/, '').toLowerCase();
      if (validPages.includes(targetHash) || aliasMap[targetHash]) {
        targetPage = targetHash;
      }
    }

    if (targetPage) {
      e.preventDefault();
      navigateTo(targetPage);
      closeMobileDrawer();
      const moreMenu = document.getElementById('more-dropdown-menu');
      if (moreMenu) moreMenu.classList.add('hidden');
    }
  });

  // Handle browser back/forward buttons
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash;
    navigateTo(hash);
  });

  // Handle initial page load according to URL hash
  const initialHash = window.location.hash || '#home';
  navigateTo(initialHash);

  // ==========================================
  // 4. PROJECT FILTER TABS
  // ==========================================
  const projectFilterBtns = document.querySelectorAll('.project-filter-btn');
  const projectCards = document.querySelectorAll('.portfolio-project-card');

  projectFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      projectFilterBtns.forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
        b.classList.add('bg-slate-200', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
      });

      btn.classList.remove('bg-slate-200', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
      btn.classList.add('bg-blue-600', 'text-white', 'shadow-md');

      const filter = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.classList.remove('hidden');
          card.classList.add('flex');
        } else {
          card.classList.add('hidden');
          card.classList.remove('flex');
        }
      });
    });
  });

  // ==========================================
  // 5. THE FEED & SCRIPT VIEWER MODAL
  // ==========================================
  const feedModal = document.getElementById('feed-modal');
  const feedModalTitle = document.getElementById('feed-modal-title');
  const feedModalCategory = document.getElementById('feed-modal-category');
  const feedModalDate = document.getElementById('feed-modal-date');
  const feedModalContent = document.getElementById('feed-modal-content');
  const closeFeedModalBtn = document.getElementById('close-feed-modal');
  const openScriptBtns = document.querySelectorAll('.open-script-modal-btn');

  // Script & Reflection Content Database
  const feedDatabase = {
    'video-resume': {
      title: "My Video Resume Script & Narrative Blueprint",
      category: "Speech & Presentation Script",
      date: "Spring 2026",
      html: `
        <div class="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">
          <div class="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
            <h5 class="font-bold text-blue-900 dark:text-blue-300 mb-1 flex items-center gap-2">
              <i class="fa-solid fa-clapperboard"></i> Scene 1: Introduction & Identity (0:00 - 0:25)
            </h5>
            <p><em>(Visual: Md. Touhidur Rahman Shiyam standing in university conference setup, confident smile, smart formal suit)</em></p>
            <p class="mt-2 font-mono text-xs md:text-sm bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              "Hello! My name is <strong>Md. Touhidur Rahman Shiyam</strong>, an Electrical and Electronic Engineering undergraduate at Daffodil International University. I describe myself as a technical thinker with a voice for impact — blending engineering discipline with dynamic stage anchoring and modern web development."
            </p>
          </div>

          <div class="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
            <h5 class="font-bold text-emerald-900 dark:text-emerald-300 mb-1 flex items-center gap-2">
              <i class="fa-solid fa-microchip"></i> Scene 2: Academic Core & Technical Mastery (0:26 - 0:55)
            </h5>
            <p><em>(Visual: Screen cuts to circuit simulations in Proteus, MATLAB waveform graphs, and clean code layouts)</em></p>
            <p class="mt-2 font-mono text-xs md:text-sm bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              "Throughout my degree at DIU, I have immersed myself in circuit analysis, digital electronics, instrumentation, and microcontroller systems. I don't just solve textbook equations; I translate electrical principles into real-world simulations and smart systems."
            </p>
          </div>

          <div class="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60">
            <h5 class="font-bold text-purple-900 dark:text-purple-300 mb-1 flex items-center gap-2">
              <i class="fa-solid fa-microphone-lines"></i> Scene 3: IEEE Leadership & Public Speaking (0:56 - 1:25)
            </h5>
            <p><em>(Visual: Clips hosting high-profile international engineering webinars, IEEE PES symposiums, and stage address)</em></p>
            <p class="mt-2 font-mono text-xs md:text-sm bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              "As an official anchor for the IEEE PES DIU Student Branch Chapter, I have hosted seminars and panel discussions with global scholars. This leadership experience taught me to articulate complex technical ideas with clarity, charisma, and poise."
            </p>
          </div>

          <div class="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
            <h5 class="font-bold text-amber-900 dark:text-amber-300 mb-1 flex items-center gap-2">
              <i class="fa-solid fa-guitar"></i> Scene 4: Web Technology, Music & Vision (1:26 - End)
            </h5>
            <p><em>(Visual: Modern web development snippets, acoustic guitar strum, closing CTA screen with contact info)</em></p>
            <p class="mt-2 font-mono text-xs md:text-sm bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              "Beyond circuits and microphones, I build modern web applications and play acoustic guitar. I am seeking forward-thinking teams where I can bring analytical rigor, communicative energy, and creative problem-solving. Thank you for watching!"
            </p>
          </div>
        </div>
      `
    },
    'reflection-eee': {
      title: "Why Technical Precision Needs Artistic Rhythm",
      category: "Personal Engineering Essay",
      date: "February 2026",
      html: `
        <div class="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">
          <p>
            People often consider engineering and music as opposite ends of the human spectrum. In engineering, we seek deterministic outcomes: Kirchhoff's laws, impedance matching, and clock cycle precision. In music, we celebrate the emotional weight of a resonant acoustic chord and the warmth of a melodic vocal cadence.
          </p>
          <p>
            Yet during my studies at Daffodil International University, I discovered they are fundamentally identical. An audio equalizer is a network of active bandpass filters. A musical rhythm is a periodic square wave with harmonious harmonics. When you approach circuit design with musical sensitivity, you create elegant, balanced architectures.
          </p>
          <div class="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border-l-4 border-blue-600">
            <p class="italic text-slate-800 dark:text-slate-200">
              "Some people feel the rain. Others just get wet." — Bob Marley. In both technology and music, feeling the rhythm is the difference between simply executing a task and creating something profound.
            </p>
          </div>
        </div>
      `
    },
    'ieee-anchoring': {
      title: "Behind the Podium: Moderating International Technical Summits",
      category: "Public Speaking & Event Leadership",
      date: "January 2026",
      html: `
        <div class="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base">
          <p>
            Standing before an audience of senior IEEE fellows, international professors, and student engineers is an exhilarating test of adaptability. As an official anchor for IEEE PES DIU SBC, every session requires meticulous preparation:
          </p>
          <ul class="list-disc list-inside space-y-2 pl-2">
            <li><strong>Speaker Deconstruction:</strong> Thoroughly researching each guest speaker's patents, papers, and key findings to craft tailored, intellectually stimulating introductions.</li>
            <li><strong>Live Pace Management:</strong> Balancing technical Q&A time limits while ensuring the audience's most poignant questions receive answers.</li>
            <li><strong>Stage Presence & Energy:</strong> Maintaining crisp vocal modulation, clear pronunciation, and infectious positivity throughout multi-hour conferences.</li>
          </ul>
          <p>
            This journey has transformed how I communicate in all professional settings — whether presenting a semester capstone project or collaborating with software engineers.
          </p>
        </div>
      `
    }
  };

  openScriptBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const scriptKey = btn.getAttribute('data-script') || 'video-resume';
      const item = feedDatabase[scriptKey] || feedDatabase['video-resume'];

      if (feedModal && feedModalTitle && feedModalContent) {
        feedModalTitle.textContent = item.title;
        if (feedModalCategory) feedModalCategory.textContent = item.category;
        if (feedModalDate) feedModalDate.textContent = item.date;
        feedModalContent.innerHTML = item.html;

        feedModal.classList.remove('hidden');
        feedModal.classList.add('flex');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  function closeFeedModal() {
    if (!feedModal) return;
    feedModal.classList.add('hidden');
    feedModal.classList.remove('flex');
    document.body.style.overflow = '';
  }

  if (closeFeedModalBtn) closeFeedModalBtn.addEventListener('click', closeFeedModal);

  if (feedModal) {
    feedModal.addEventListener('click', (e) => {
      if (e.target === feedModal) closeFeedModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeFeedModal();
      closeMobileDrawer();
    }
  });

  // ==========================================
  // 6. SCROLL REVEAL OBSERVER
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }
});

/* ============================================================
   MAIN.JS — Interactions, Animations & Form (ULTRA ENHANCED)
   Features: Cinematic loader, custom cursor, scroll progress,
   stat counters, dark/light mode, testimonials slider,
   parallax, tilt cards, Konami code easter egg, and more.
   ============================================================ */

(function () {
  'use strict';

  // Wait for DOM
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initCinematicLoader();
    initNavbar();
    initTypewriter();
    initScrollReveal();
    initSkillOrbs();
    initSkillTabs();
    initProjectTilt();
    initMouseLight();
    initContactForm();
    initSmoothScrollWithAnimations();
    initSectionClickAnimations();
    initCardMagneticEffect();
    initCertificateViewer();
    initParallaxElements();
    // New features
    initScrollProgress();
    initCustomCursor();
    initStatCounters();

    initThemeCycle();
    initKonamiCode();
  }

  /* ===== CINEMATIC LOADER ===== */
  function initCinematicLoader() {
    const loader = document.getElementById('loader');
    if (!loader) return;

    window.addEventListener('load', () => {
      setTimeout(() => {
        loader.classList.add('hidden');
      }, 2200); // Give time for letter animation + bar fill
    });

    // Fallback: hide after 4s
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 4000);
  }

  /* ===== SCROLL PROGRESS BAR ===== */
  function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = scrollPercent + '%';
    });
  }

  /* ===== CUSTOM ANIMATED CURSOR ===== */
  function initCustomCursor() {
    const dot = document.getElementById('cursor-dot');
    const outline = document.getElementById('cursor-outline');
    if (!dot || !outline) return;

    // Detect touch device — bail out
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      dot.style.display = 'none';
      outline.style.display = 'none';
      return;
    }

    // Hide default cursor
    document.body.style.cursor = 'none';

    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
    });

    // Smooth trailing outline
    function animateOutline() {
      outlineX += (mouseX - outlineX) * 0.15;
      outlineY += (mouseY - outlineY) * 0.15;
      outline.style.left = outlineX + 'px';
      outline.style.top = outlineY + 'px';
      requestAnimationFrame(animateOutline);
    }
    animateOutline();

    // Hover effect on interactive elements
    const hoverTargets = document.querySelectorAll(
      'a, button, .btn, .glass-card, .project-card, .tech-card, .hamburger, input, textarea, .testimonial-nav-btn, .testimonial-dot, #theme-toggle, .floating-resume-btn'
    );

    hoverTargets.forEach((el) => {
      el.style.cursor = 'none';
      el.addEventListener('mouseenter', () => {
        dot.classList.add('cursor-hover');
        outline.classList.add('cursor-hover');
      });
      el.addEventListener('mouseleave', () => {
        dot.classList.remove('cursor-hover');
        outline.classList.remove('cursor-hover');
      });
    });
  }

  /* ===== ANIMATED STAT COUNTERS ===== */
  function initStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    if (!statNumbers.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute('data-count'));
            const suffix = el.getAttribute('data-suffix') || '';

            // Special case for infinity
            if (suffix === '∞') {
              el.textContent = '∞';
              observer.unobserve(el);
              return;
            }

            animateCount(el, 0, target, suffix, 1500);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach((el) => observer.observe(el));
  }

  function animateCount(el, start, end, suffix, duration) {
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);

      el.textContent = current + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  /* ===== MULTI-THEME CYCLE TOGGLE ===== */
  function initThemeCycle() {
    const toggleBtn = document.getElementById('theme-toggle');
    const icon = document.getElementById('theme-icon');
    if (!toggleBtn || !icon) return;

    const themes = ['dark', 'light', 'brutalist', 'aurora', 'terminal'];

    function applyTheme(themeName) {
      // Remove all theme classes
      document.body.classList.remove('light-theme', 'theme-brutalist', 'theme-aurora', 'theme-terminal');

      // Add appropriate class (dark is base, no class needed)
      if (themeName === 'light') {
        document.body.classList.add('light-theme');
      } else if (themeName !== 'dark') {
        document.body.classList.add(`theme-${themeName}`);
      }

      // Update icon classes and toggle button title/tooltip
      if (themeName === 'light') {
        icon.className = 'fas fa-sun';
        toggleBtn.setAttribute('title', 'Switch to Neo-Brutalist');
      } else if (themeName === 'brutalist') {
        icon.className = 'fas fa-border-all';
        toggleBtn.setAttribute('title', 'Switch to Aurora Glow');
      } else if (themeName === 'aurora') {
        icon.className = 'fas fa-wand-magic-sparkles';
        toggleBtn.setAttribute('title', 'Switch to Retro Terminal');
      } else if (themeName === 'terminal') {
        icon.className = 'fas fa-terminal';
        toggleBtn.setAttribute('title', 'Switch to Cyber Dark');
      } else {
        icon.className = 'fas fa-moon';
        toggleBtn.setAttribute('title', 'Switch to Minimalist Light');
      }

      // Save preference
      localStorage.setItem('portfolio-theme', themeName);

      // Custom adjustments
      updateThemeDependencies(themeName);
    }

    function updateThemeDependencies(themeName) {
      const bgCanvas = document.getElementById('bg-canvas');
      if (bgCanvas) {
        if (themeName === 'light') {
          bgCanvas.style.opacity = '0.2';
        } else if (themeName === 'dark' || themeName === 'aurora') {
          bgCanvas.style.opacity = '1';
        } else {
          bgCanvas.style.opacity = '0'; // Hidden for terminal/brutalist
        }
      }

      const themeEvent = new CustomEvent('themechanged', { detail: { theme: themeName } });
      window.dispatchEvent(themeEvent);
    }

    // Load saved preference
    let savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    if (!themes.includes(savedTheme)) savedTheme = 'dark';
    applyTheme(savedTheme);

    // On button click, cycle to next theme
    toggleBtn.addEventListener('click', () => {
      const currentTheme = localStorage.getItem('portfolio-theme') || 'dark';
      const currentIndex = themes.indexOf(currentTheme);
      const nextIndex = (currentIndex + 1) % themes.length;
      const nextTheme = themes[nextIndex];

      applyTheme(nextTheme);

      // Rotation animation on click
      toggleBtn.style.transform = 'rotate(360deg)';
      setTimeout(() => {
        toggleBtn.style.transform = '';
      }, 400);
    });
  }


  /* ===== KONAMI CODE EASTER EGG ===== */
  function initKonamiCode() {
    const konamiSequence = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ];
    let konamiIndex = 0;
    let easterEggActive = false;

    document.addEventListener('keydown', (e) => {
      if (e.code === konamiSequence[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiSequence.length) {
          konamiIndex = 0;
          if (!easterEggActive) {
            triggerEasterEgg();
          }
        }
      } else {
        konamiIndex = 0;
      }
    });

    function triggerEasterEgg() {
      easterEggActive = true;
      const overlay = document.getElementById('easter-egg-overlay');
      if (!overlay) return;

      // Phase 1: Confetti burst
      for (let i = 0; i < 80; i++) {
        const piece = document.createElement('div');
        piece.className = 'confetti-piece';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.animationDelay = Math.random() * 1.5 + 's';
        piece.style.animationDuration = (2 + Math.random() * 2) + 's';
        const colors = ['#38BDF8', '#8B5CF6', '#06B6D4', '#EC4899', '#22C55E', '#F59E0B', '#EF4444'];
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
        piece.style.width = (6 + Math.random() * 10) + 'px';
        piece.style.height = (6 + Math.random() * 10) + 'px';
        overlay.appendChild(piece);
      }

      // Phase 2: Matrix rain after 1.5s
      setTimeout(() => {
        const chars = 'KSNDHU01アカサタナ';
        for (let i = 0; i < 60; i++) {
          const ch = document.createElement('div');
          ch.className = 'matrix-char';
          ch.textContent = chars[Math.floor(Math.random() * chars.length)];
          ch.style.left = Math.random() * 100 + 'vw';
          ch.style.animationDelay = Math.random() * 2 + 's';
          ch.style.animationDuration = (1.5 + Math.random() * 2) + 's';
          ch.style.fontSize = (10 + Math.random() * 14) + 'px';
          overlay.appendChild(ch);
        }
      }, 1500);

      // Cleanup after 5s
      setTimeout(() => {
        overlay.innerHTML = '';
        easterEggActive = false;
      }, 5000);
    }
  }

  /* ===== NAVBAR ===== */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a');

    // Scroll shrink
    window.addEventListener('scroll', () => {
      if (window.scrollY > 80) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      // Active section highlight
      highlightActiveSection(links);
    });

    // Hamburger toggle
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
      });

      // Close on link click
      links.forEach((link) => {
        link.addEventListener('click', () => {
          hamburger.classList.remove('active');
          navLinks.classList.remove('open');
        });
      });
    }
  }

  function highlightActiveSection(links) {
    const sections = document.querySelectorAll('section[id]');
    let current = '';

    sections.forEach((section) => {
      const top = section.offsetTop - 150;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    links.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) {
        link.classList.add('active');
      }
    });
  }

  /* ===== TYPEWRITER ===== */
  function initTypewriter() {
    const el = document.querySelector('.typewriter-text');
    if (!el) return;

    const roles = [
      'Python Developer',
      'AI/ML Enthusiast',
      'Diploma CSE Graduate',
      'Java Programmer',
      'Full Stack Developer',
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let speed = 100;

    function type() {
      const current = roles[roleIndex];

      if (isDeleting) {
        el.textContent = current.substring(0, charIndex - 1);
        charIndex--;
        speed = 50;
      } else {
        el.textContent = current.substring(0, charIndex + 1);
        charIndex++;
        speed = 100;
      }

      if (!isDeleting && charIndex === current.length) {
        speed = 2000; // Pause at end
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        speed = 400; // Pause before next word
      }

      setTimeout(type, speed);
    }

    type();
  }

  /* ===== SCROLL REVEAL (Bidirectional) ===== */
  function initScrollReveal() {
    const reveals = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-stagger'
    );

    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          } else {
            // Remove active when scrolled out so it re-animates on re-entry
            entry.target.classList.remove('active');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  /* ===== SKILL ORBS — SVG Ring Animation ===== */
  function initSkillOrbs() {
    const orbFills = document.querySelectorAll('.skill-orb-fill');
    if (!orbFills.length) return;

    const circumference = 2 * Math.PI * 44; // r=44

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const circle = entry.target;
            const percent = parseInt(circle.getAttribute('data-percent')) || 0;
            const offset = circumference - (percent / 100) * circumference;
            circle.style.strokeDashoffset = offset;
            circle.classList.add('animated');
            observer.unobserve(circle);
          }
        });
      },
      { threshold: 0.3 }
    );

    orbFills.forEach((fill) => observer.observe(fill));
  }

  /* ===== SKILL TABS — Filter by Category ===== */
  function initSkillTabs() {
    const tabs = document.querySelectorAll('.skill-tab');
    const orbs = document.querySelectorAll('.skill-orb');
    if (!tabs.length || !orbs.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        // Update active tab
        tabs.forEach((t) => t.classList.remove('active'));
        tab.classList.add('active');

        const category = tab.getAttribute('data-category');

        orbs.forEach((orb) => {
          if (category === 'all' || orb.getAttribute('data-category') === category) {
            orb.classList.remove('hidden');
          } else {
            orb.classList.add('hidden');
          }
        });
      });
    });
  }



  /* ===== PROJECT CARD TILT ===== */
  function initProjectTilt() {
    const cards = document.querySelectorAll('.project-card');

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px) scale(1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform =
          'perspective(800px) rotateX(0) rotateY(0) translateY(0) scale(1)';
      });
    });
  }

  /* ===== MOUSE LIGHT ===== */
  function initMouseLight() {
    const light = document.getElementById('mouse-light');
    if (!light) return;

    let lastX = 0,
      lastY = 0;
    let rafId = null;

    document.addEventListener('mousemove', (e) => {
      lastX = e.clientX;
      lastY = e.clientY;

      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          light.style.left = lastX + 'px';
          light.style.top = lastY + 'px';
          rafId = null;
        });
      }
    });
  }

  /* ===== CONTACT FORM ===== */
  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const statusEl = document.getElementById('form-status');
      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;

      // Basic client-side validation
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      if (!data.name || !data.email || !data.subject || !data.message) {
        statusEl.textContent = '❌ All fields are required.';
        statusEl.className = 'form-status error';
        statusEl.style.display = 'block';
        return;
      }

      // Simulate sending
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      btn.disabled = true;

      setTimeout(() => {
        statusEl.textContent = '✅ Thanks for your message! I\'ll get back to you soon.';
        statusEl.className = 'form-status success';
        statusEl.style.display = 'block';
        form.reset();

        btn.innerHTML = originalText;
        btn.disabled = false;

        // Hide status after 5s
        setTimeout(() => {
          statusEl.className = 'form-status';
          statusEl.style.display = 'none';
        }, 5000);
      }, 800);
    });
  }

  /* ===== SMOOTH SCROLL WITH SECTION ANIMATIONS ===== */
  function initSmoothScrollWithAnimations() {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const href = link.getAttribute('href');
        const target = document.querySelector(href);
        if (!target) return;

        // Trigger the cinematic section entrance animation
        triggerSectionAnimation(target);

        // Smooth scroll
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ===== SECTION CLICK ANIMATIONS (CINEMATIC) ===== */
  function triggerSectionAnimation(section) {
    // Select all animatable children within the section
    const container = section.querySelector('.container');
    if (!container) return;

    // Elements to animate: title, subtitle, grid items, cards, timeline items
    const animatableSelectors = [
      '.section-title',
      '.section-subtitle',
      '.glass-card',
      '.skill-category',
      '.skill-orb',
      '.skill-tabs',
      '.spoken-lang-card',
      '.coding-stat-card',
      '.heatmap-container',
      '.coding-lang-card',
      '.project-card',
      '.timeline-item',
      '.language-card',
      '.tech-card',
      '.about-text',
      '.about-highlights',
      '.about-stats',
      '.contact-info',
      '.contact-form',
      '.about-highlight-item',
      '.stat-card',
      '.hero-badge',
      '.hero-name',
      '.hero-tagline',
      '.hero-buttons',
      '.hero-socials',
    ];

    const allElements = container.querySelectorAll(animatableSelectors.join(','));
    // Exclude testimonial cards — they live inside a slider with overflow:hidden,
    // so animationend never fires for off-screen slides, leaving them stuck at opacity:0
    const elements = Array.from(allElements).filter(el => !el.classList.contains('testimonial-card'));
    if (!elements.length) return;

    // Animation styles: randomly pick one per navigation for variety
    const animations = [
      'anim-cascade-up',
      'anim-cascade-scale',
      'anim-cascade-flip',
      'anim-cascade-slide-rotate',
      'anim-cascade-blur',
    ];
    const chosenAnimation = animations[Math.floor(Math.random() * animations.length)];

    elements.forEach((el, index) => {
      // Remove any existing animation classes
      el.classList.remove(
        'anim-cascade-up',
        'anim-cascade-scale',
        'anim-cascade-flip',
        'anim-cascade-slide-rotate',
        'anim-cascade-blur',
        'anim-active'
      );

      // Force reflow to restart animation
      void el.offsetWidth;

      // Set stagger delay
      el.style.setProperty('--anim-delay', `${index * 0.08}s`);

      // Add the animation class
      el.classList.add(chosenAnimation);

      // Trigger after a micro-delay to ensure class changes register
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.classList.add('anim-active');
        });
      });

      // Clean up after animation completes
      const cleanup = () => {
        el.classList.remove(chosenAnimation, 'anim-active');
        el.style.removeProperty('--anim-delay');
        el.removeEventListener('animationend', cleanup);
      };
      el.addEventListener('animationend', cleanup);
    });

    // Fire a flash/ripple effect on the section
    createSectionRipple(section);
  }

  /* ===== SECTION RIPPLE FLASH ===== */
  function createSectionRipple(section) {
    const ripple = document.createElement('div');
    ripple.className = 'section-ripple';
    section.appendChild(ripple);

    // Position at center top of the section viewport
    ripple.style.top = '0';
    ripple.style.left = '50%';

    requestAnimationFrame(() => {
      ripple.classList.add('active');
    });

    // Remove after animation
    setTimeout(() => {
      ripple.remove();
    }, 1200);
  }

  /* ===== INIT SECTION CLICK ANIMATIONS ===== */
  function initSectionClickAnimations() {
    // Animate sections when they scroll into view — re-triggers every time
    const sections = document.querySelectorAll('section[id]');
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerSectionAnimation(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px',
      }
    );

    sections.forEach((section) => sectionObserver.observe(section));
  }

  /* ===== CARD MAGNETIC HOVER EFFECT ===== */
  function initCardMagneticEffect() {
    const cards = document.querySelectorAll('.glass-card');

    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
      });
    });
  }

  /* ===== PARALLAX ELEMENTS ===== */
  function initParallaxElements() {
    const parallaxElements = document.querySelectorAll('.floating-shape, .avatar-ring');

    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;

      parallaxElements.forEach((el, index) => {
        const speed = 0.02 + (index * 0.01);
        const yOffset = scrolled * speed;
        el.style.transform = el.style.transform
          ? el.style.transform.replace(/translateY\([^)]*\)/, `translateY(${-yOffset}px)`)
          : `translateY(${-yOffset}px)`;
      });
    });
  }

  /* ===== CERTIFICATE VIEWER ===== */
  function initCertificateViewer() {
    const modal = document.getElementById('cert-modal');
    if (!modal) return;

    const modalBody = modal.querySelector('.cert-modal-body');
    const closeBtn = modal.querySelector('.cert-modal-close');
    const viewButtons = document.querySelectorAll('.view-cert-btn');

    const certData = {
      'cert-ai': {
        issuer: 'IBM SkillsBuild',
        title: 'Artificial Intelligence Fundamentals',
        image: 'assets/cert_ai_fundamentals.png',
        verifyUrl: 'https://www.credly.com/badges/5eb28ca2-e766-4a08-8a99-d2ecd1fc67fb'
      },
      'cert-threat': {
        issuer: 'Infosys Springboard',
        title: 'Threat Modeling',
        image: 'assets/cert_threat_modeling.png',
        verifyUrl: 'https://verify.onwingspan.com'
      },
      'cert-comm': {
        issuer: 'IBM SkillsBuild',
        title: 'Customer Engagement: Communication and Personality Dynamics',
        image: 'assets/cert_customer_comm.png',
        verifyUrl: 'https://www.credly.com/badges/24b6bfb8-8d48-49f4-b385-642c15f1aeca'
      },
      'cert-solving': {
        issuer: 'IBM SkillsBuild',
        title: 'Customer Engagement: Problem Solving and Process Controls',
        image: 'assets/cert_customer_solving.png',
        verifyUrl: 'https://www.credly.com/badges/41f7cb00-a4aa-4645-8f69-d694a2476acb'
      }
    };

    viewButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const certId = btn.getAttribute('data-cert');
        const data = certData[certId];
        if (!data) return;

        // Render Certificate Image and Verification details
        modalBody.innerHTML = `
          <div class="image-cert-viewer" style="text-align: center;">
            <img src="${data.image}" alt="${data.title} Certificate" style="width: 100%; max-height: 70vh; object-fit: contain; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 8px 32px rgba(0,0,0,0.5); margin-bottom: 20px;">
            <div style="display: flex; gap: 15px; justify-content: center; align-items: center; flex-wrap: wrap; margin-top: 10px;">
              <span style="color: var(--text-primary); font-size: 0.95rem; font-weight: 500;">${data.title} — ${data.issuer}</span>
              <a href="${data.verifyUrl}" target="_blank" rel="noopener" class="btn btn-primary" style="padding: 10px 20px; font-size: 0.85rem; width: auto; display: inline-flex;">
                <i class="fas fa-external-link-alt"></i> Verify Credential
              </a>
            </div>
          </div>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeModal = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
  }
})();

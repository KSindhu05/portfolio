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
    initSkillsGalaxy();
    initNeuralCanvas();
    initSkillsParallax();
    initSkillCardInteractions();
    initProjectTilt();
    initMouseLight();
    initContactForm();
    initSmoothScrollWithAnimations();
    initSectionClickAnimations();
    initCardMagneticEffect();
    initParallaxElements();
    // New features
    initScrollProgress();
    initCustomCursor();
    initStatCounters();

    initThemeCycle();
    initKonamiCode();
    initScreenshotProtection();
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

    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        scrollTicking = true;
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          progressBar.style.width = scrollPercent + '%';
          scrollTicking = false;
        });
      }
    }, { passive: true });
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

    // Scroll shrink — throttled with rAF
    let navScrollTicking = false;
    window.addEventListener('scroll', () => {
      if (!navScrollTicking) {
        navScrollTicking = true;
        requestAnimationFrame(() => {
          if (window.scrollY > 80) {
            navbar.classList.add('scrolled');
          } else {
            navbar.classList.remove('scrolled');
          }
          // Active section highlight
          highlightActiveSection(links);
          navScrollTicking = false;
        });
      }
    }, { passive: true });

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
            observer.unobserve(entry.target); // Trigger only once for performance and prevent overlapping
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

  /* ===== NEW SKILLS GALAXY — AI COMMAND CENTER ===== */
  function initSkillsGalaxy() {
    const cosmos = document.getElementById('skills-cosmos');
    const nodes = document.querySelectorAll('.skill-node');
    if (!cosmos || !nodes.length) return;

    function positionNodes() {
      const isMobile = window.innerWidth <= 900;
      
      nodes.forEach((node) => {
        if (isMobile) {
          // Clear custom positioning for grid fallback
          node.style.left = '';
          node.style.top = '';
          node.style.transform = '';
          return;
        }

        const orbit = node.getAttribute('data-orbit');
        const index = parseInt(node.getAttribute('data-index')) || 0;
        
        // Calculate total items in this orbit
        const total = Array.from(nodes).filter(n => n.getAttribute('data-orbit') === orbit).length;
        
        // Determine radius for inner/outer orbits
        const radius = orbit === 'inner' ? 190 : 330; // Matches CSS paths
        
        // Calculate angle (spread evenly around the circle)
        // Offset inner and outer angles for a more dynamic galaxy layout
        const angleOffset = orbit === 'inner' ? 0 : Math.PI / total;
        const angle = (index / total) * 2 * Math.PI + angleOffset;
        
        // Trigonometric positioning relative to cosmos center (50%, 50%)
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        // Position card centered on (x, y) coordinates
        node.style.left = `calc(50% + ${x}px - 87.5px)`; // 87.5px is half of 175px card width
        node.style.top = `calc(50% + ${y}px - 50px)`;    // Approximate half of card height
        
        // Store base coordinate variables for tilt/float reference
        node.setAttribute('data-x', x);
        node.setAttribute('data-y', y);
        node.style.transform = `translate3d(0, 0, 0)`;
      });
    }

    positionNodes();
    window.addEventListener('resize', positionNodes);

    // Staggered entrance animations when entering viewport
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            nodes.forEach((node, idx) => {
              node.style.opacity = '0';
              node.style.transform = 'scale(0.8) translate3d(0, 50px, 0)';
              node.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
              
              setTimeout(() => {
                node.style.opacity = '1';
                node.style.transform = 'scale(1) translate3d(0, 0, 0)';
                // Re-apply transitions for mouse hover after entrance finishes
                setTimeout(() => {
                  node.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s ease, border-color 0.3s ease, background 0.3s ease';
                }, 600);
              }, idx * 100);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(cosmos);
  }

  /* ===== NEURAL CANVAS BACKGROUND ===== */
  function initNeuralCanvas() {
    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    
    function resizeCanvas() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.radius = Math.random() * 2 + 1;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce boundaries
        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 15000));
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    initParticles();
    window.addEventListener('resize', initParticles);

    function drawConnections() {
      const maxDistance = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }
    }

    // Only run if user doesn't prefer reduced motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // Only animate when the skills section is visible
      const skillsSection = canvas.closest('section') || canvas.parentElement;
      let isVisible = false;

      const visObserver = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting;
        if (isVisible && !animationId) {
          animate();
        }
      }, { threshold: 0 });
      visObserver.observe(skillsSection);

      function animate() {
        if (!isVisible) {
          animationId = null;
          return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach((p) => {
          p.update();
          p.draw();
        });
        
        drawConnections();
        animationId = requestAnimationFrame(animate);
      }
    }
  }

  /* ===== SKILLS PARALLAX ===== */
  function initSkillsParallax() {
    const cosmos = document.getElementById('skills-cosmos');
    if (!cosmos || window.innerWidth <= 900) return;

    cosmos.addEventListener('mousemove', (e) => {
      if (window.innerWidth <= 900) return;
      const rect = cosmos.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      // Calculate rotation ratios
      const rotX = (-y / rect.height) * 12;
      const rotY = (x / rect.width) * 12;
      
      // Apply slight perspective rotate to the entire container
      cosmos.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });

    cosmos.addEventListener('mouseleave', () => {
      cosmos.style.transform = 'rotateX(0) rotateY(0)';
    });
  }

  /* ===== SKILL CARD INTERACTIONS & BEAM CONNECTIONS ===== */
  function initSkillCardInteractions() {
    const nodes = document.querySelectorAll('.skill-node');
    const beam = document.getElementById('beam-line');
    const core = document.getElementById('ai-core');
    const cosmos = document.getElementById('skills-cosmos');
    
    if (!nodes.length || !beam || !core || !cosmos) return;

    nodes.forEach((node) => {
      // 3D Card Tilt
      node.addEventListener('mousemove', (e) => {
        if (window.innerWidth <= 900) return;
        const rect = node.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Tilt amount: max 15 degrees
        const rotX = ((y - centerY) / centerY) * -15;
        const rotY = ((x - centerX) / centerX) * 15;
        
        // Lift card and rotate
        node.style.transform = `translateZ(30px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.06)`;
        
        // Update connection beam endpoint dynamically as card tilts
        updateBeam(node);
      });

      node.addEventListener('mouseenter', () => {
        const color = node.style.getPropertyValue('--node-color') || 'var(--accent-blue)';
        document.documentElement.style.setProperty('--beam-color', color);
        beam.classList.add('active');
        updateBeam(node);
      });

      node.addEventListener('mouseleave', () => {
        node.style.transform = 'translateZ(0) rotateX(0) rotateY(0) scale(1)';
        beam.classList.remove('active');
      });
    });

    function updateBeam(node) {
      if (window.innerWidth <= 900) return;
      
      const cosmosRect = cosmos.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      const coreRect = core.getBoundingClientRect();
      
      // Node center relative to cosmos
      const nodeX = (nodeRect.left + nodeRect.width / 2) - cosmosRect.left;
      const nodeY = (nodeRect.top + nodeRect.height / 2) - cosmosRect.top;
      
      // Core center relative to cosmos
      const coreX = (coreRect.left + coreRect.width / 2) - cosmosRect.left;
      const coreY = (coreRect.top + coreRect.height / 2) - cosmosRect.top;
      
      beam.setAttribute('x1', `${coreX}px`);
      beam.setAttribute('y1', `${coreY}px`);
      beam.setAttribute('x2', `${nodeX}px`);
      beam.setAttribute('y2', `${nodeY}px`);
    }
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
      '.skill-node',
      '.skills-cosmos',
      '.ai-core',
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
            sectionObserver.unobserve(entry.target); // Trigger only once
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
    if (!parallaxElements.length) return;

    let parallaxTicking = false;
    window.addEventListener('scroll', () => {
      if (!parallaxTicking) {
        parallaxTicking = true;
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          // Only process parallax if hero section is likely visible
          if (scrolled < window.innerHeight * 1.5) {
            parallaxElements.forEach((el, index) => {
              const speed = 0.02 + (index * 0.01);
              const yOffset = scrolled * speed;
              el.style.transform = `translateY(${-yOffset}px)`;
            });
          }
          parallaxTicking = false;
        });
      }
    }, { passive: true });
  }

  /* Certificate viewer functionality has been moved to a self-contained inline script in index.html for maximum reliability and to bypass cache/init issues. */
  /* ===== PROFILE PICTURE PROTECTION (Avatar Only) ===== */
  function initScreenshotProtection() {
    const avatarContainer = document.querySelector('.hero-avatar-container');
    const avatarImg = document.querySelector('.hero-avatar');
    if (!avatarContainer || !avatarImg) return;

    // ---- 1. Render profile pic on a Canvas (harder to save/inspect) ----
    function replaceWithCanvas() {
      const canvas = document.createElement('canvas');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = avatarImg.src;

      img.onload = function () {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        canvas.className = avatarImg.className;
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', avatarImg.alt || 'Profile Picture');
        canvas.style.cssText = avatarImg.style.cssText;
        canvas.draggable = false;

        canvas.addEventListener('contextmenu', (e) => { e.preventDefault(); return false; });
        canvas.addEventListener('dragstart', (e) => { e.preventDefault(); });
        canvas.addEventListener('touchstart', (e) => { e.preventDefault(); }, { passive: false });

        avatarImg.replaceWith(canvas);
      };
    }
    replaceWithCanvas();

    // ---- 2. Transparent shield over the avatar container ----
    const shield = document.createElement('div');
    shield.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 10;
      background: transparent;
      pointer-events: auto;
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
    `;
    shield.addEventListener('contextmenu', (e) => { e.preventDefault(); return false; });
    shield.addEventListener('dragstart', (e) => { e.preventDefault(); });

    const containerPosition = window.getComputedStyle(avatarContainer).position;
    if (containerPosition === 'static') {
      avatarContainer.style.position = 'relative';
    }
    avatarContainer.appendChild(shield);

    // ---- 3. Block right-click only on avatar area ----
    avatarContainer.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });

    // ---- 4. Avatar-only overlay ----
    const avatarOverlay = document.createElement('div');
    avatarOverlay.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(11, 17, 32, 0.95);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 20;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s ease;
      border-radius: inherit;
      font-family: 'Space Grotesk', sans-serif;
      color: #38bdf8;
      font-size: 0.8rem;
      text-align: center;
      padding: 10px;
    `;
    avatarOverlay.innerHTML = '<i class="fas fa-shield-alt" style="font-size:1.2rem;margin-right:6px;"></i> Protected';
    avatarContainer.appendChild(avatarOverlay);

    // ---- 5. DROP-DOWN TOAST NOTIFICATION ----
    const toast = document.createElement('div');
    toast.id = 'screenshot-toast';
    toast.style.cssText = `
      position: fixed;
      top: -80px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 99999999;
      background: linear-gradient(135deg, rgba(11, 17, 32, 0.97), rgba(30, 41, 59, 0.97));
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 14px;
      padding: 14px 28px;
      display: flex;
      align-items: center;
      gap: 12px;
      font-family: 'Space Grotesk', sans-serif;
      color: #38bdf8;
      font-size: 0.95rem;
      font-weight: 500;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.15);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      transition: none;
      opacity: 0;
      pointer-events: none;
      white-space: nowrap;
    `;
    toast.innerHTML = `
      <i class="fas fa-shield-alt" style="font-size: 1.3rem; color: #38bdf8;"></i>
      <span>Screenshot is prohibited</span>
    `;
    document.body.appendChild(toast);

    let restoreTimeout;
    let toastTimeout;
    let isToastVisible = false;

    function showToast() {
      if (isToastVisible) return;
      isToastVisible = true;

      // Appear INSTANTLY — no transition
      toast.style.transition = 'none';
      toast.style.top = '24px';
      toast.style.opacity = '1';

      clearTimeout(toastTimeout);
      toastTimeout = setTimeout(() => {
        // Smooth slide-out when dismissing
        toast.style.transition = 'top 0.4s ease, opacity 0.4s ease';
        toast.style.top = '-80px';
        toast.style.opacity = '0';
        isToastVisible = false;
      }, 3000);
    }

    function hideAvatar() {
      // Instant overlay — no transition delay
      avatarOverlay.style.transition = 'none';
      avatarOverlay.style.opacity = '1';
      avatarOverlay.style.pointerEvents = 'all';
      showToast();
    }

    function showAvatar() {
      // Smooth fade-back when restoring
      avatarOverlay.style.transition = 'opacity 0.3s ease';
      avatarOverlay.style.opacity = '0';
      avatarOverlay.style.pointerEvents = 'none';
    }

    // ---- 6. Desktop: PrintScreen / snipping tool / Win+Shift+S ----
    document.addEventListener('keydown', (e) => {
      if (e.key === 'PrintScreen') {
        hideAvatar();
        clearTimeout(restoreTimeout);
        restoreTimeout = setTimeout(showAvatar, 3000);
      }
      // Win + Shift + S (Windows Snip & Sketch)
      if (e.key === 's' && e.shiftKey && e.metaKey) {
        hideAvatar();
        clearTimeout(restoreTimeout);
        restoreTimeout = setTimeout(showAvatar, 4000);
      }
      // Cmd+Shift (Mac screenshot) or Ctrl+P (print)
      if ((e.metaKey && e.shiftKey && (e.key === '3' || e.key === '4' || e.key === '5')) || (e.ctrlKey && e.key === 'p')) {
        hideAvatar();
        clearTimeout(restoreTimeout);
        restoreTimeout = setTimeout(showAvatar, 3000);
      }
    });

    // ---- 7. Window blur/focus — snipping tools steal focus ----
    window.addEventListener('blur', () => {
      hideAvatar();
      clearTimeout(restoreTimeout);
      restoreTimeout = setTimeout(showAvatar, 4000);
    });
    window.addEventListener('focus', () => {
      clearTimeout(restoreTimeout);
      restoreTimeout = setTimeout(showAvatar, 500);
    });

    // ---- 8. Visibility change ----
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        hideAvatar();
        clearTimeout(restoreTimeout);
        restoreTimeout = setTimeout(showAvatar, 4000);
      } else {
        clearTimeout(restoreTimeout);
        restoreTimeout = setTimeout(showAvatar, 500);
      }
    });

    // ---- 9. Print protection (avatar only) ----
    const printStyle = document.createElement('style');
    printStyle.textContent = `
      @media print {
        .hero-avatar-container {
          visibility: hidden !important;
        }
        .hero-avatar-container::after {
          content: 'Profile picture protected';
          visibility: visible;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100%;
          color: #94a3b8;
          font-family: 'Space Grotesk', sans-serif;
        }
      }
    `;
    document.head.appendChild(printStyle);
    window.addEventListener('beforeprint', hideAvatar);
    window.addEventListener('afterprint', showAvatar);

    // ---- 10. Disable image drag/save ----
    document.querySelectorAll('.hero-avatar-container img, .hero-avatar-container canvas').forEach((el) => {
      el.setAttribute('draggable', 'false');
      el.style.webkitTouchCallout = 'none';
      el.style.webkitUserSelect = 'none';
      el.style.userSelect = 'none';
    });
  }


})();


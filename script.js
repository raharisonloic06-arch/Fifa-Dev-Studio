/* ============================================================
   FIFA DEV STUDIO — SCRIPT PRINCIPAL
   Vanilla JavaScript — aucune dépendance externe
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. LOADER ---------- */
  const loader = document.getElementById('loader');
  window.addEventListener('load', () => {
    setTimeout(() => loader.classList.add('hidden'), 300);
  });
  // Sécurité : si l'event load tarde, on masque après 1.8s max
  setTimeout(() => loader.classList.add('hidden'), 1800);

  /* ---------- 2. MODE SOMBRE / CLAIR ---------- */
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;
  const savedTheme = localStorage.getItem('fds-theme');

  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
  } else {
    // Respecte la préférence système si aucune sauvegarde
    const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    root.setAttribute('data-theme', prefersLight ? 'light' : 'dark');
  }

  themeToggle.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('fds-theme', next);
  });

  /* ---------- 3. NAVIGATION FIXE — EFFET AU SCROLL ---------- */
  const nav = document.getElementById('nav');
  const backToTop = document.getElementById('backToTop');

  const onScroll = () => {
    const scrollY = window.scrollY;
    nav.classList.toggle('scrolled', scrollY > 20);
    backToTop.classList.toggle('visible', scrollY > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ---------- 4. MENU MOBILE ---------- */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');

  burger.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    burger.classList.toggle('active', isOpen);
    burger.setAttribute('aria-expanded', isOpen);
  });

  // Ferme le menu mobile après clic sur un lien
  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
    });
  });

  /* ---------- 5. HERO — LUMIÈRE QUI SUIT LA SOURIS ---------- */
  const hero = document.getElementById('hero');
  const heroGlow = document.getElementById('heroGlow');

  if (window.matchMedia('(pointer: fine)').matches) {
    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      heroGlow.style.left = `${x}%`;
      heroGlow.style.top = `${y}%`;
      heroGlow.style.transform = 'translate(-50%, -50%)';
    });
  }

  /* ---------- 6. ANIMATIONS AU DÉFILEMENT (Intersection Observer) ---------- */
  const revealEls = document.querySelectorAll('.reveal, .reveal-up');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- 7. COMPTEURS ANIMÉS ---------- */
  const counters = document.querySelectorAll('.stat-number');
  let countersStarted = false;

  const animateCounters = () => {
    if (countersStarted) return;
    countersStarted = true;

    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-count'), 10);
      const prefix = counter.getAttribute('data-prefix') || '';
      const suffix = counter.getAttribute('data-suffix') || '';
      const duration = 1600;
      const startTime = performance.now();

      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        // easeOutExpo pour un effet fluide et premium
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const value = Math.round(eased * target);
        counter.textContent = `${prefix}${value}${suffix}`;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  };

  const statsSection = document.querySelector('.hero-stats');
  if (statsSection) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounters();
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statsObserver.observe(statsSection);
  }

  /* ---------- 8. FAQ ACCORDÉON ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Ferme les autres items ouverts (accordéon exclusif)
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          openItem.querySelector('.faq-answer').style.maxHeight = null;
        }
      });

      item.classList.toggle('open', !isOpen);
      question.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = !isOpen ? `${answer.scrollHeight}px` : null;
    });
  });

  /* ---------- 9. VALIDATION DU FORMULAIRE DE CONTACT ---------- */
  const form = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');

  const fields = {
    name: { el: document.getElementById('name'), error: document.getElementById('nameError') },
    email: { el: document.getElementById('email'), error: document.getElementById('emailError') },
    project: { el: document.getElementById('project'), error: document.getElementById('projectError') },
    message: { el: document.getElementById('message'), error: document.getElementById('messageError') },
  };

  const validators = {
    name: (value) => value.trim().length >= 2 ? '' : 'Merci d\'indiquer votre nom (2 caractères minimum).',
    email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Merci d\'indiquer une adresse email valide.',
    project: (value) => value !== '' ? '' : 'Merci de sélectionner un type de projet.',
    message: (value) => value.trim().length >= 10 ? '' : 'Votre message doit contenir au moins 10 caractères.',
  };

  const validateField = (key) => {
    const { el, error } = fields[key];
    const message = validators[key](el.value);
    error.textContent = message;
    el.closest('.form-group').classList.toggle('error', Boolean(message));
    return message === '';
  };

  // Validation en temps réel après la première interaction
  Object.keys(fields).forEach(key => {
    fields[key].el.addEventListener('blur', () => validateField(key));
    fields[key].el.addEventListener('input', () => {
      if (fields[key].el.closest('.form-group').classList.contains('error')) {
        validateField(key);
      }
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const results = Object.keys(fields).map(validateField);
    const isValid = results.every(Boolean);

    if (!isValid) {
      // Scroll vers le premier champ en erreur
      const firstError = form.querySelector('.form-group.error');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Simulation d'envoi réussi (à remplacer par un appel API / service d'emails)
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    submitBtn.textContent = 'Envoi en cours...';

    setTimeout(() => {
      formSuccess.classList.add('visible');
      form.reset();
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.innerHTML = originalText;

      Object.keys(fields).forEach(key => {
        fields[key].el.closest('.form-group').classList.remove('error');
        fields[key].error.textContent = '';
      });

      setTimeout(() => formSuccess.classList.remove('visible'), 6000);
    }, 900);
  });

  /* ---------- 10. NAVIGATION FLUIDE + LIENS ANCRÉS ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId.length > 1) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* ---------- 11. ANNÉE DYNAMIQUE DANS LE FOOTER ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

});

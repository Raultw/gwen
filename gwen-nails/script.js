/* ============================================
   GWEN NAILS — JavaScript
   ============================================ */

'use strict';

// ===== UTILS =====
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


// ===== HEADER SCROLL =====
(function initHeader() {
  const header = $('#site-header');
  const heroScrollIndicator = $('#hero-scroll');
  if (!header) return;

  function onScroll() {
    const scrolled = window.scrollY > 60;
    header.classList.toggle('scrolled', scrolled);
    if (heroScrollIndicator) {
      heroScrollIndicator.style.opacity = scrolled ? '0' : '1';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


// ===== HERO PARALLAX =====
(function initParallax() {
  const parallax = $('#hero-parallax');
  if (!parallax) return;

  let ticking = false;

  function applyParallax() {
    const scrollY = window.scrollY;
    const heroHeight = parallax.closest('.hero')?.offsetHeight || 0;
    if (scrollY > heroHeight) return;

    const factor = 0.35; // subtler parallax
    parallax.style.transform = `translateY(${scrollY * factor}px)`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(applyParallax);
      ticking = true;
    }
  }, { passive: true });
})();


// ===== HAMBURGER MENU =====
(function initMobileMenu() {
  const hamburger = $('#nav-hamburger');
  const navLinks  = $('#nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';

    // Animate hamburger lines
    const spans = $$('span', hamburger);
    if (isOpen) {
      spans[0].style.cssText = 'transform:rotate(45deg) translate(5px,5px)';
      spans[1].style.cssText = 'opacity:0';
      spans[2].style.cssText = 'transform:rotate(-45deg) translate(5px,-5px)';
    } else {
      spans.forEach(s => s.style.cssText = '');
    }
  });

  // Close on nav link click
  $$('a', navLinks).forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      $$('span', hamburger).forEach(s => s.style.cssText = '');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      $$('span', hamburger).forEach(s => s.style.cssText = '');
    }
  });
})();


// ===== SCROLL REVEAL =====
(function initScrollReveal() {
  const elements = $$('.reveal-up, .reveal-left, .reveal-right');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  elements.forEach(el => observer.observe(el));
})();


// ===== GALLERY FILTERS =====
(function initGalleryFilters() {
  const filterBtns = $$('.filter-btn');
  const galleryItems = $$('.gallery-item');
  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      galleryItems.forEach(item => {
        const show = filter === 'all' || item.dataset.category === filter;
        item.style.transition = 'opacity 0.3s ease';
        if (show) {
          item.style.opacity = '0';
          item.classList.remove('hidden');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              item.style.opacity = '1';
            });
          });
        } else {
          item.style.opacity = '0';
          setTimeout(() => item.classList.add('hidden'), 300);
        }
      });
    });
  });
})();


// ===== TESTIMONIOS CAROUSEL =====
(function initCarousel() {
  const track      = $('#testimonios-track');
  const prevBtn    = $('#carousel-prev');
  const nextBtn    = $('#carousel-next');
  const dotsWrap   = $('#carousel-dots');
  if (!track) return;

  const cards = $$('.testimonio-card', track);
  const total  = cards.length;
  let current  = 0;
  let autoTimer = null;

  // Determine items per view based on screen size
  function getPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  let perView = getPerView();

  // Build dots
  function buildDots() {
    dotsWrap.innerHTML = '';
    const maxIndex = Math.max(0, total - perView);
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Ir al testimonio ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    $$('.carousel-dot', dotsWrap).forEach((dot, i) => {
      dot.classList.toggle('active', i === current);
    });
  }

  function getCardWidth() {
    if (cards.length === 0) return 0;
    const card = cards[0];
    const style = getComputedStyle(card);
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    return card.offsetWidth + gap;
  }

  function goTo(index) {
    const maxIndex = Math.max(0, total - perView);
    current = Math.max(0, Math.min(index, maxIndex));
    const offset = current * getCardWidth();
    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
  }

  function goNext() { goTo(current + 1); }
  function goPrev() { goTo(current - 1); }

  function startAuto() {
    autoTimer = setInterval(() => {
      const maxIndex = Math.max(0, total - perView);
      goTo(current < maxIndex ? current + 1 : 0);
    }, 5000);
  }

  function stopAuto() { clearInterval(autoTimer); }

  prevBtn?.addEventListener('click', () => { stopAuto(); goPrev(); startAuto(); });
  nextBtn?.addEventListener('click', () => { stopAuto(); goNext(); startAuto(); });

  // Swipe support
  let startX = 0;
  track.addEventListener('pointerdown', e => { startX = e.clientX; });
  track.addEventListener('pointerup', e => {
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 50) {
      stopAuto();
      diff > 0 ? goNext() : goPrev();
      startAuto();
    }
  });

  // Resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      perView = getPerView();
      buildDots();
      goTo(0);
    }, 200);
  });

  buildDots();
  goTo(0);
  startAuto();
})();


// ===== CALENDAR / DATE PICKER =====
(function initDatePicker() {
  const pickerBtn     = $('#date-picker-btn');
  const popup         = $('#calendar-popup');
  const displayInput  = $('#fecha-display');
  const hiddenInput   = $('#fecha-value');
  const daysContainer = $('#calendar-days');
  const monthLabel    = $('#cal-month-label');
  const prevMonthBtn  = $('#cal-prev-month');
  const nextMonthBtn  = $('#cal-next-month');
  const timeSlots     = $$('.time-slot');

  if (!pickerBtn || !popup) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let viewDate = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = null;
  let selectedTime = null;

  const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

  function formatDateDisplay(d) {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  function renderCalendar() {
    const year  = viewDate.getFullYear();
    const month = viewDate.getMonth();

    monthLabel.textContent = `${MONTHS_ES[month]} ${year}`;

    const firstDay  = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays   = new Date(year, month, 0).getDate();

    daysContainer.innerHTML = '';

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      const btn = createDayBtn(prevDays - i, 'cal-day--other');
      daysContainer.appendChild(btn);
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      date.setHours(0, 0, 0, 0);

      const isPast    = date < today;
      const isToday   = date.getTime() === today.getTime();
      const isSelected = selectedDate && date.getTime() === selectedDate.getTime();

      let cls = 'cal-day';
      if (isPast)     cls += ' cal-day--past';
      if (isToday)    cls += ' cal-day--today';
      if (isSelected) cls += ' cal-day--selected';

      const btn = createDayBtn(d, cls);
      if (!isPast) {
        btn.addEventListener('click', () => selectDate(date));
      }
      daysContainer.appendChild(btn);
    }

    // Next month padding (fill to 6 rows)
    const totalCells = firstDay + daysInMonth;
    const remaining  = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remaining; i++) {
      const btn = createDayBtn(i, 'cal-day--other');
      daysContainer.appendChild(btn);
    }
  }

  function createDayBtn(day, className) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = day;
    btn.className = className || 'cal-day';
    return btn;
  }

  function selectDate(date) {
    selectedDate = date;
    renderCalendar();
    updateDisplayInput();
  }

  function updateDisplayInput() {
    if (!selectedDate) return;
    let display = formatDateDisplay(selectedDate);
    if (selectedTime) display += ` — ${selectedTime}`;
    displayInput.value = display;
    hiddenInput.value  = selectedDate.toISOString().split('T')[0] + (selectedTime ? `T${selectedTime}` : '');
    displayInput.classList.remove('error');
    $('#error-fecha') && ($('#error-fecha').textContent = '', $('#error-fecha').classList.remove('visible'));
  }

  // Time slots
  timeSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      timeSlots.forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      selectedTime = slot.dataset.time;
      updateDisplayInput();
    });
  });

  // Month navigation
  prevMonthBtn?.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() - 1);
    renderCalendar();
  });
  nextMonthBtn?.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() + 1);
    renderCalendar();
  });

  // Toggle popup
  function openCalendar() {
    popup.hidden = false;
    displayInput.setAttribute('aria-expanded', 'true');
    renderCalendar();
  }

  function closeCalendar() {
    popup.hidden = true;
    displayInput.setAttribute('aria-expanded', 'false');
  }

  pickerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    popup.hidden ? openCalendar() : closeCalendar();
  });

  displayInput.addEventListener('click', (e) => {
    e.stopPropagation();
    popup.hidden ? openCalendar() : closeCalendar();
  });

  document.addEventListener('click', (e) => {
    if (!popup.contains(e.target) && e.target !== pickerBtn && e.target !== displayInput) {
      closeCalendar();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCalendar();
  });

  renderCalendar();
})();


// ===== BOOKING FORM =====
(function initBookingForm() {
  const form       = $('#booking-form');
  const submitBtn  = $('#submit-btn');
  const successBox = $('#form-success');
  const errorBox   = $('#form-error');
  const servicioInput = $('#servicio');
  const charCount  = $('#servicio-count');

  if (!form) return;

  // Char counter
  servicioInput?.addEventListener('input', () => {
    const len = servicioInput.value.length;
    if (charCount) charCount.textContent = `${len}/50`;
  });

  function showError(inputId, errorId, message) {
    const input = $(`#${inputId}`);
    const error = $(`#${errorId}`);
    if (input)  input.classList.add('error');
    if (error) {
      error.textContent  = message;
      error.classList.add('visible');
    }
  }

  function clearError(inputId, errorId) {
    const input = $(`#${inputId}`);
    const error = $(`#${errorId}`);
    if (input)  input.classList.remove('error');
    if (error) {
      error.textContent = '';
      error.classList.remove('visible');
    }
  }

  // Live validation
  ['nombre', 'apellido', 'telefono', 'servicio'].forEach(field => {
    $(`#${field}`)?.addEventListener('blur', () => validateField(field));
    $(`#${field}`)?.addEventListener('input', () => clearError(field, `error-${field}`));
  });

  function validateField(field) {
    const val = $(`#${field}`)?.value.trim() || '';
    const errorId = `error-${field}`;

    clearError(field, errorId);

    if (!val) {
      showError(field, errorId, 'Este campo es obligatorio.');
      return false;
    }

    if (field === 'nombre' || field === 'apellido') {
      if (val.length < 2) {
        showError(field, errorId, 'Ingresá al menos 2 caracteres.');
        return false;
      }
    }

    if (field === 'telefono') {
      const phoneRegex = /^[\d\-\+\s]{7,20}$/;
      if (!phoneRegex.test(val)) {
        showError(field, errorId, 'Ingresá un teléfono válido (ej: 011-1565852012).');
        return false;
      }
    }

    $(`#${field}`)?.classList.add('success');
    return true;
  }

  function validateDate() {
    const fechaVal = $('#fecha-value')?.value;
    if (!fechaVal) {
      const error = $('#error-fecha');
      $('#fecha-display')?.classList.add('error');
      if (error) { error.textContent = 'Seleccioná una fecha de turno.'; error.classList.add('visible'); }
      return false;
    }
    return true;
  }

  function setLoading(loading) {
    const btnText    = submitBtn?.querySelector('.btn-text');
    const btnLoading = submitBtn?.querySelector('.btn-loading');
    if (submitBtn) submitBtn.disabled = loading;
    if (btnText)    btnText.hidden    = loading;
    if (btnLoading) btnLoading.hidden = !loading;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous feedback
    if (successBox) successBox.hidden = true;
    if (errorBox)   errorBox.hidden   = true;

    const fields = ['nombre', 'apellido', 'telefono', 'servicio'];
    const validFields = fields.map(f => validateField(f));
    const validDate   = validateDate();

    if (validFields.includes(false) || !validDate) {
      // Scroll to first error
      const firstError = $('.error', form);
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Simulate submission
    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1800));

      // Success
      setLoading(false);
      if (successBox) successBox.hidden = false;
      form.reset();
      // Reset state
      $$('.time-slot').forEach(s => s.classList.remove('selected'));
      $$('.form-input').forEach(i => { i.classList.remove('success', 'error'); });
      if ($('#servicio-count')) $('#servicio-count').textContent = '0/50';
      if ($('#fecha-display')) $('#fecha-display').value = '';
      if ($('#fecha-value'))   $('#fecha-value').value   = '';

      successBox?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch {
      setLoading(false);
      if (errorBox) errorBox.hidden = false;
      errorBox?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
})();


// ===== SMOOTH NAV ACTIVE STATE =====
(function initNavActive() {
  const sections = $$('section[id]');
  const navLinks  = $$('.nav-links a[href^="#"]');
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          const href = link.getAttribute('href').slice(1);
          link.classList.toggle('active-nav', href === id);
        });
      }
    });
  }, {
    threshold: 0.4,
    rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue('--header-h')} 0px -40% 0px`
  });

  sections.forEach(s => observer.observe(s));
})();


// ===== INSTAGRAM TILES HOVER =====
(function initInstagramTiles() {
  $$('.insta-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      window.open('https://instagram.com/gwennails', '_blank', 'noopener,noreferrer');
    });
  });
})();


// ===== GLITTER SPARKLE EFFECT ON HERO =====
(function initSparkles() {
  const hero = $('.hero');
  if (!hero) return;

  function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.style.cssText = `
      position:fixed;
      pointer-events:none;
      z-index:999;
      left:${x}px;
      top:${y}px;
      width:6px;
      height:6px;
      border-radius:50%;
      background: radial-gradient(circle, hsl(42 80% 80%), hsl(345 60% 80%));
      transform: translate(-50%,-50%) scale(0);
      animation: sparkle-anim 0.6s ease forwards;
    `;
    document.body.appendChild(sparkle);
    setTimeout(() => sparkle.remove(), 650);
  }

  // Inject sparkle keyframe once
  const style = document.createElement('style');
  style.textContent = `
    @keyframes sparkle-anim {
      0%   { transform: translate(-50%,-50%) scale(0); opacity:1; }
      50%  { transform: translate(-50%,-50%) scale(1.8); opacity:1; }
      100% { transform: translate(-50%,-50%) scale(0.4) translateY(-20px); opacity:0; }
    }
  `;
  document.head.appendChild(style);

  let lastSparkle = 0;
  hero.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSparkle < 80) return;
    lastSparkle = now;
    createSparkle(e.clientX, e.clientY);
  });
})();


// ===== CONSOLE BRANDING =====
console.log(
  '%cGwen Nails ✦',
  'color: hsl(345,40%,52%); font-family: serif; font-size: 1.5rem; font-style: italic;'
);
console.log(
  '%c💅 Sitio desarrollado con ♡ | Sofía L. — 10 años de pasión',
  'color: hsl(38,60%,58%); font-size: 0.85rem;'
);

/**
 * ==========================================================================
 * GWEN NAILS — LÓGICA E INTERACTIVIDAD (JAVASCRIPT)
 * Arquitectura modular, optimizada y libre de dependencias externas.
 * ==========================================================================
 */

'use strict';

// --------------------------------------------------------------------------
// 1. HELPERS Y UTILIDADES DOM
// --------------------------------------------------------------------------
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

// --------------------------------------------------------------------------
// 2. HEADER Y NAVEGACIÓN (CONTROL DE SCROLL Y MENÚ MÓVIL)
// --------------------------------------------------------------------------
(function initHeaderAndMenu() {
  const header        = $('#site-header');
  const hamburger     = $('#nav-hamburger');
  const navLinks      = $('#nav-links');
  const heroIndicator = $('#hero-scroll');

  if (!header) return;

  // Manejo del estado scroll del Header
  function handleScroll() {
    const isScrolled = window.scrollY > 50;
    header.classList.toggle('scrolled', isScrolled);

    if (heroIndicator) {
      heroIndicator.style.opacity = isScrolled ? '0' : '1';
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Menú Hamburguesa para móviles
  if (hamburger && navLinks) {
    function closeMenu() {
      navLinks.classList.remove('open');
      header.classList.remove('menu-open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      
      const spans = $$('span', hamburger);
      spans.forEach(span => { span.style.cssText = ''; });
    }

    function toggleMenu() {
      const isOpen = navLinks.classList.toggle('open');
      header.classList.toggle('menu-open', isOpen);
      hamburger.setAttribute('aria-expanded', String(isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';

      const spans = $$('span', hamburger);
      if (isOpen) {
        spans[0].style.cssText = 'transform: rotate(45deg) translate(5px, 5px);';
        spans[1].style.cssText = 'opacity: 0;';
        spans[2].style.cssText = 'transform: rotate(-45deg) translate(5px, -5px);';
      } else {
        spans.forEach(span => { span.style.cssText = ''; });
      }
    }

    hamburger.addEventListener('click', toggleMenu);

    // Cerrar al pulsar un enlace de navegación
    $$('a', navLinks).forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    // Cerrar al hacer clic fuera del menú
    document.addEventListener('click', (event) => {
      if (navLinks.classList.contains('open') && 
          !hamburger.contains(event.target) && 
          !navLinks.contains(event.target)) {
        closeMenu();
      }
    });

    // Cerrar si se redimensiona a pantalla de escritorio
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && navLinks.classList.contains('open')) {
        closeMenu();
      }
    });
  }
})();

// --------------------------------------------------------------------------
// 3. EFECTO PARALLAX SUAVE EN EL BANNER HERO
// --------------------------------------------------------------------------
(function initHeroParallax() {
  const parallax = $('#hero-parallax');
  if (!parallax) return;

  let isTicking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    const hero = parallax.closest('.hero');
    const heroHeight = hero ? hero.offsetHeight : 0;

    if (scrollY <= heroHeight + 50) {
      const speed = 0.28;
      const translateY = Math.max(0, scrollY * speed);
      parallax.style.transform = `translate3d(0, ${translateY}px, 0)`;
    }
    isTicking = false;
  }

  window.addEventListener('scroll', () => {
    if (!isTicking) {
      requestAnimationFrame(updateParallax);
      isTicking = true;
    }
  }, { passive: true });
})();

// --------------------------------------------------------------------------
// 4. ANIMACIONES AL SCROLLEAR (INTERSECTION OBSERVER)
// --------------------------------------------------------------------------
(function initScrollAnimations() {
  const animatedElements = $$('.reveal-up, .reveal-left, .reveal-right');
  if (!animatedElements.length) return;

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

  animatedElements.forEach(element => observer.observe(element));
})();

// --------------------------------------------------------------------------
// 5. FILTROS DE LA GALERÍA DE TRABAJOS
// --------------------------------------------------------------------------
(function initGallery() {
  const filterButtons = $$('.filter-btn');
  const galleryItems  = $$('.gallery-item');
  if (!filterButtons.length || !galleryItems.length) return;

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');

      const selectedCategory = button.dataset.filter;

      galleryItems.forEach(item => {
        const matchesCategory = selectedCategory === 'all' || item.dataset.category === selectedCategory;
        
        item.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        if (matchesCategory) {
          item.classList.remove('hidden');
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              item.style.opacity = '1';
              item.style.transform = 'scale(1)';
            });
          });
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            if (button.dataset.filter !== 'all' && item.dataset.category !== selectedCategory) {
              item.classList.add('hidden');
            }
          }, 300);
        }
      });
    });
  });
})();

// --------------------------------------------------------------------------
// 6. CARRUSEL DE TESTIMONIOS (RESPONSIVE HORIZONTAL)
// --------------------------------------------------------------------------
(function initTestimonialsCarousel() {
  const track    = $('#testimonios-track');
  const prevBtn  = $('#carousel-prev');
  const nextBtn  = $('#carousel-next');
  const dotsWrap = $('#carousel-dots');
  if (!track) return;

  const cards = $$('.testimonio-card', track);
  const totalCards = cards.length;
  let currentIndex = 0;
  let autoSlideTimer = null;

  function getCardsPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  function getMaxIndex() {
    return Math.max(0, totalCards - getCardsPerView());
  }

  function buildNavigationDots() {
    dotsWrap.innerHTML = '';
    const maxIndex = getMaxIndex();
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '');
      dot.setAttribute('aria-label', `Ver testimonio ${i + 1}`);
      dot.addEventListener('click', () => {
        stopAutoSlide();
        goToSlide(i);
        startAutoSlide();
      });
      dotsWrap.appendChild(dot);
    }
  }

  function updateDots() {
    $$('.carousel-dot', dotsWrap).forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function getStepOffset() {
    if (!cards.length) return 0;
    const cardRect = cards[0].getBoundingClientRect();
    const trackStyles = window.getComputedStyle(track);
    const gap = parseFloat(trackStyles.gap) || 16;
    return cardRect.width + gap;
  }

  function goToSlide(index) {
    const maxIndex = getMaxIndex();
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    const offset = currentIndex * getStepOffset();
    track.style.transform = `translateX(-${offset}px)`;
    updateDots();
  }

  function nextSlide() {
    const maxIndex = getMaxIndex();
    goToSlide(currentIndex >= maxIndex ? 0 : currentIndex + 1);
  }

  function prevSlide() {
    const maxIndex = getMaxIndex();
    goToSlide(currentIndex <= 0 ? maxIndex : currentIndex - 1);
  }

  function startAutoSlide() {
    stopAutoSlide();
    autoSlideTimer = setInterval(nextSlide, 5500);
  }

  function stopAutoSlide() {
    if (autoSlideTimer) clearInterval(autoSlideTimer);
  }

  prevBtn?.addEventListener('click', () => {
    stopAutoSlide();
    prevSlide();
    startAutoSlide();
  });

  nextBtn?.addEventListener('click', () => {
    stopAutoSlide();
    nextSlide();
    startAutoSlide();
  });

  // Soporte táctil / swipe para celulares y tablets
  let startX = 0;
  let isSwiping = false;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isSwiping = true;
    stopAutoSlide();
  }, { passive: true });

  track.addEventListener('touchend', (e) => {
    if (!isSwiping) return;
    isSwiping = false;
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    startAutoSlide();
  }, { passive: true });

  // Recalcular al redimensionar ventana
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      buildNavigationDots();
      goToSlide(Math.min(currentIndex, getMaxIndex()));
    }, 150);
  });

  // Inicialización
  buildNavigationDots();
  goToSlide(0);
  startAutoSlide();
})();

// --------------------------------------------------------------------------
// 7. CALENDARIO INTERACTIVO Y SELECTOR DE TURNOS
// --------------------------------------------------------------------------
(function initDatePickerAndSlots() {
  const pickerBtn     = $('#date-picker-btn');
  const popup         = $('#calendar-popup');
  const displayInput  = $('#fecha-display');
  const hiddenInput   = $('#fecha-value');
  const daysContainer = $('#calendar-days');
  const monthLabel    = $('#cal-month-label');
  const prevMonthBtn  = $('#cal-prev-month');
  const nextMonthBtn  = $('#cal-next-month');
  const timeSlots     = $$('.time-slot');

  if (!pickerBtn || !popup || !displayInput) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let viewDate     = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedDate = null;
  let selectedTime = null;

  const MONTHS_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  function formatDate(d) {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  function renderCalendar() {
    const year  = viewDate.getFullYear();
    const month = viewDate.getMonth();

    monthLabel.textContent = `${MONTHS_ES[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Domingo
    const daysInMonth   = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    daysContainer.innerHTML = '';

    // Días del mes anterior
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = daysInPrevMonth - i;
      btn.className = 'cal-day cal-day--other';
      btn.disabled = true;
      daysContainer.appendChild(btn);
    }

    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      cellDate.setHours(0, 0, 0, 0);

      const isPast     = cellDate < today;
      const isToday    = cellDate.getTime() === today.getTime();
      const isSelected = selectedDate && cellDate.getTime() === selectedDate.getTime();

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = day;
      btn.className = 'cal-day';

      if (isPast) {
        btn.classList.add('cal-day--past');
        btn.disabled = true;
      } else {
        if (isToday) btn.classList.add('cal-day--today');
        if (isSelected) btn.classList.add('cal-day--selected');

        btn.addEventListener('click', () => {
          selectedDate = cellDate;
          renderCalendar();
          updateInputs();
        });
      }

      daysContainer.appendChild(btn);
    }

    // Rellenar hasta completar grilla
    const totalCells = firstDayIndex + daysInMonth;
    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 1; i <= remainingCells; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = i;
      btn.className = 'cal-day cal-day--other';
      btn.disabled = true;
      daysContainer.appendChild(btn);
    }
  }

  function updateInputs() {
    if (!selectedDate) return;
    let text = formatDate(selectedDate);
    if (selectedTime) text += ` · ${selectedTime} hs`;

    displayInput.value = text;
    hiddenInput.value  = selectedDate.toISOString().split('T')[0] + (selectedTime ? `T${selectedTime}` : '');

    displayInput.classList.remove('error');
    const errorEl = $('#error-fecha');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }

  // Selección de horarios
  timeSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      timeSlots.forEach(s => s.classList.remove('selected'));
      slot.classList.add('selected');
      selectedTime = slot.dataset.time;
      updateInputs();
    });
  });

  // Navegación de meses
  prevMonthBtn?.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() - 1);
    renderCalendar();
  });

  nextMonthBtn?.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() + 1);
    renderCalendar();
  });

  // Apertura y cierre del Popup
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

// --------------------------------------------------------------------------
// 8. FORMULARIO DE RESERVAS CON VALIDACIÓN RIGUROSA
// --------------------------------------------------------------------------
(function initBookingForm() {
  const form          = $('#booking-form');
  const submitBtn     = $('#submit-btn');
  const successBox    = $('#form-success');
  const errorBox      = $('#form-error');
  const servicioInput = $('#servicio');
  const charCount     = $('#servicio-count');

  if (!form) return;

  // Contador de caracteres para el textarea de servicio
  if (servicioInput && charCount) {
    servicioInput.addEventListener('input', () => {
      const length = servicioInput.value.length;
      charCount.textContent = `${length}/50`;
    });
  }

  function setFieldError(fieldId, message) {
    const field   = $(`#${fieldId}`);
    const errorEl = $(`#error-${fieldId}`);
    if (field) {
      field.classList.add('error');
      field.classList.remove('success');
    }
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  }

  function clearFieldError(fieldId) {
    const field   = $(`#${fieldId}`);
    const errorEl = $(`#error-${fieldId}`);
    if (field) field.classList.remove('error');
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('visible');
    }
  }

  function validateField(fieldId) {
    const input = $(`#${fieldId}`);
    if (!input) return true;

    const value = input.value.trim();
    clearFieldError(fieldId);

    if (!value) {
      setFieldError(fieldId, 'Este campo es obligatorio.');
      return false;
    }

    if (fieldId === 'nombre' || fieldId === 'apellido') {
      if (value.length < 2) {
        setFieldError(fieldId, 'Ingresá al menos 2 caracteres.');
        return false;
      }
    }

    if (fieldId === 'telefono') {
      const phonePattern = /^[\d\-\+\s]{7,20}$/;
      if (!phonePattern.test(value)) {
        setFieldError(fieldId, 'Ingresá un teléfono válido (ej: 011-1565852012).');
        return false;
      }
    }

    input.classList.add('success');
    return true;
  }

  function validateDate() {
    const dateVal = $('#fecha-value')?.value;
    if (!dateVal) {
      setFieldError('fecha-display', 'Seleccioná la fecha y horario para tu turno.');
      return false;
    }
    return true;
  }

  // Validación en tiempo real al perder foco o escribir
  ['nombre', 'apellido', 'telefono', 'servicio'].forEach(fieldId => {
    const el = $(`#${fieldId}`);
    el?.addEventListener('blur', () => validateField(fieldId));
    el?.addEventListener('input', () => clearFieldError(fieldId));
  });

  // Envío del formulario
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (successBox) successBox.hidden = true;
    if (errorBox)   errorBox.hidden   = true;

    const isNombreValid   = validateField('nombre');
    const isApellidoValid = validateField('apellido');
    const isTelValid      = validateField('telefono');
    const isServicioValid = validateField('servicio');
    const isDateValid     = validateDate();

    const allValid = isNombreValid && isApellidoValid && isTelValid && isServicioValid && isDateValid;

    if (!allValid) {
      const firstError = $('.error', form);
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Estado de carga en el botón
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    submitBtn.disabled = true;
    if (btnText) btnText.hidden = true;
    if (btnLoading) btnLoading.hidden = false;

    try {
      // Simular procesamiento del turno (o conexión a API/WhatsApp)
      await new Promise(resolve => setTimeout(resolve, 1400));

      submitBtn.disabled = false;
      if (btnText) btnText.hidden = false;
      if (btnLoading) btnLoading.hidden = true;

      if (successBox) successBox.hidden = false;
      form.reset();

      // Resetear estados visuales
      $$('.time-slot').forEach(slot => slot.classList.remove('selected'));
      $$('.form-input').forEach(input => input.classList.remove('success', 'error'));
      if (charCount) charCount.textContent = '0/50';
      if ($('#fecha-display')) $('#fecha-display').value = '';
      if ($('#fecha-value'))   $('#fecha-value').value   = '';

      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (err) {
      submitBtn.disabled = false;
      if (btnText) btnText.hidden = false;
      if (btnLoading) btnLoading.hidden = true;

      if (errorBox) errorBox.hidden = false;
      errorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
})();

// --------------------------------------------------------------------------
// 9. RESALTADO AUTOMÁTICO DE SECCIÓN ACTIVA EN NAVEGACIÓN
// --------------------------------------------------------------------------
(function initActiveNavigation() {
  const sections = $$('section[id]');
  const navLinks = $$('.nav-links a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const currentId = entry.target.id;
        navLinks.forEach(link => {
          const targetId = link.getAttribute('href').slice(1);
          link.classList.toggle('active-nav', targetId === currentId);
        });
      }
    });
  }, {
    threshold: 0.35,
    rootMargin: '-76px 0px -40% 0px'
  });

  sections.forEach(sec => observer.observe(sec));
})();

// --------------------------------------------------------------------------
// 10. REDES SOCIALES E INTERACCIONES
// --------------------------------------------------------------------------
(function initSocialAndEffects() {
  // Clic en mosaicos de Instagram
  $$('.insta-tile').forEach(tile => {
    const openInsta = () => window.open('https://instagram.com/gwennails', '_blank', 'noopener,noreferrer');
    tile.addEventListener('click', openInsta);
    tile.addEventListener('keydown', (e) => { if (e.key === 'Enter') openInsta(); });
  });
})();

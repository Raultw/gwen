/**
 * ==========================================================================
 * GWEN NAILS — LÓGICA FRONTEND & CONEXIÓN API REST (ETAPAS 1, 2 Y 3)
 * Conectado con el motor de disponibilidad inteligente del backend.
 * ==========================================================================
 */

'use strict';

// --------------------------------------------------------------------------
// 1. HELPERS Y UTILIDADES DOM
// --------------------------------------------------------------------------
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

// Estado local de la reserva en el frontend
const bookingState = {
  services: [],
  selectedServiceId: null,
  selectedDate: null,
  selectedTime: null,
  availableSlots: []
};

// --------------------------------------------------------------------------
// 2. HEADER Y NAVEGACIÓN (CONTROL DE SCROLL Y MENÚ MÓVIL)
// --------------------------------------------------------------------------
(function initHeaderAndMenu() {
  const header        = $('#site-header');
  const hamburger     = $('#nav-hamburger');
  const navLinks      = $('#nav-links');
  const heroIndicator = $('#hero-scroll');

  if (!header) return;

  function handleScroll() {
    const isScrolled = window.scrollY > 50;
    header.classList.toggle('scrolled', isScrolled);

    if (heroIndicator) {
      heroIndicator.style.opacity = isScrolled ? '0' : '1';
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

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

    $$('a', navLinks).forEach(link => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('click', (event) => {
      if (navLinks.classList.contains('open') && 
          !hamburger.contains(event.target) && 
          !navLinks.contains(event.target)) {
        closeMenu();
      }
    });

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

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      buildNavigationDots();
      goToSlide(Math.min(currentIndex, getMaxIndex()));
    }, 150);
  });

  buildNavigationDots();
  goToSlide(0);
  startAutoSlide();
})();

// --------------------------------------------------------------------------
// 7. CARGA DINÁMICA DE SERVICIOS DESDE EL BACKEND
// --------------------------------------------------------------------------
async function loadServicesFromApi() {
  const select = $('#servicio-select');
  if (!select) return;

  try {
    const res = await fetch('/api/servicios');
    if (!res.ok) throw new Error('Error de conexión');
    const data = await res.json();

    if (data.success && data.services && data.services.length > 0) {
      bookingState.services = data.services;
      select.innerHTML = '<option value="" disabled selected>Seleccioná un servicio...</option>';

      data.services.forEach(svc => {
        const opt = document.createElement('option');
        opt.value = svc.id;
        const priceStr = svc.precio > 0 ? ` · $${svc.precio.toLocaleString('es-AR')}` : '';
        opt.textContent = `${svc.nombre} — aprox. ${svc.duracionAprox}${priceStr}`;
        select.appendChild(opt);
      });

      // Si había un servicio preseleccionado
      if (bookingState.selectedServiceId) {
        select.value = bookingState.selectedServiceId;
      }
    }
  } catch (err) {
    console.warn('Usando servicios por defecto:', err);
    select.innerHTML = `
      <option value="" disabled selected>Seleccioná un servicio...</option>
      <option value="1">Manicura Clásica — aprox. 45 min · $4.500</option>
      <option value="2">Esmaltado Semipermanente — aprox. 1 h · $7.500</option>
      <option value="3" selected>Soft Gel — aprox. 1 h 30 min · $12.000</option>
      <option value="4">Kapping — aprox. 1 h 15 min · $9.000</option>
      <option value="5">Nail Art Exclusivo — aprox. 1 h 30 min · $11.000</option>
      <option value="6">Retiro / Mantenimiento — aprox. 45 min · $5.000</option>
    `;
    bookingState.selectedServiceId = '3';
  }

  // Cambio de servicio dispara recálculo de disponibilidad
  select.addEventListener('change', () => {
    bookingState.selectedServiceId = select.value;
    if (bookingState.selectedDate) {
      fetchAndRenderAvailability(bookingState.selectedDate, bookingState.selectedServiceId);
    }
  });

  // Botones "Reservar ->" en las tarjetas de la sección 03
  $$('.book-service-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const sId = btn.dataset.serviceId;
      if (sId) {
        bookingState.selectedServiceId = sId;
        select.value = sId;
        if (bookingState.selectedDate) {
          fetchAndRenderAvailability(bookingState.selectedDate, sId);
        }
      }
    });
  });
}

// --------------------------------------------------------------------------
// 8. CONSULTA DE DISPONIBILIDAD INTELIGENTE EN TIEMPO REAL
// --------------------------------------------------------------------------
async function fetchAndRenderAvailability(dateStr, serviceId) {
  const slotsContainer = $('#time-slots');
  const statusBadge    = $('#time-picker-status');
  if (!slotsContainer) return;

  slotsContainer.innerHTML = '<span style="font-size: 0.8rem; color: var(--clr-text-light);">Calculando disponibilidad...</span>';
  if (statusBadge) statusBadge.textContent = '';

  try {
    let url = `/api/availability?date=${dateStr}`;
    if (serviceId) url += `&serviceId=${serviceId}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.error || 'No se pudo consultar disponibilidad.');
    }

    const avail = data.availability;
    bookingState.availableSlots = avail.availableSlots || [];

    if (!avail.isOpen) {
      slotsContainer.innerHTML = `<span style="font-size: 0.85rem; color: hsl(0, 60%, 45%);">${avail.reason || 'Cerrado en esta fecha.'}</span>`;
      if (statusBadge) statusBadge.textContent = '⛔ Cerrado';
      return;
    }

    if (avail.availableSlots.length === 0) {
      slotsContainer.innerHTML = '<span style="font-size: 0.85rem; color: hsl(38, 80%, 40%);">No quedan turnos disponibles para la duración de este servicio en esta fecha.</span>';
      if (statusBadge) statusBadge.textContent = 'Sin cupo';
      return;
    }

    if (statusBadge) statusBadge.textContent = `${avail.availableSlots.length} horarios libres`;
    slotsContainer.innerHTML = '';

    avail.availableSlots.forEach(timeStr => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-slot' + (bookingState.selectedTime === timeStr ? ' selected' : '');
      btn.textContent = `${timeStr} hs`;
      btn.dataset.time = timeStr;

      btn.addEventListener('click', () => {
        $$('.time-slot', slotsContainer).forEach(s => s.classList.remove('selected'));
        btn.classList.add('selected');
        bookingState.selectedTime = timeStr;
        updateDisplayInputs();
      });

      slotsContainer.appendChild(btn);
    });

  } catch (err) {
    console.warn('Fallo al consultar disponibilidad de API, usando horarios base:', err);
    // Fallback de horarios en caso de no conexión inmediata
    const baseSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    slotsContainer.innerHTML = '';
    baseSlots.forEach(timeStr => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'time-slot' + (bookingState.selectedTime === timeStr ? ' selected' : '');
      btn.textContent = `${timeStr} hs`;
      btn.dataset.time = timeStr;
      btn.addEventListener('click', () => {
        $$('.time-slot', slotsContainer).forEach(s => s.classList.remove('selected'));
        btn.classList.add('selected');
        bookingState.selectedTime = timeStr;
        updateDisplayInputs();
      });
      slotsContainer.appendChild(btn);
    });
  }
}

function updateDisplayInputs() {
  const displayInput = $('#fecha-display');
  const fechaValue   = $('#fecha-value');
  const horaValue    = $('#hora-value');

  if (!bookingState.selectedDate) return;

  const parts = bookingState.selectedDate.split('-');
  const formattedDate = `${parts[1]}/${parts[2]}/${parts[0]}`; // MM/DD/YYYY o DD/MM/YYYY

  let text = formattedDate;
  if (bookingState.selectedTime) {
    text += ` · ${bookingState.selectedTime} hs`;
  }

  if (displayInput) displayInput.value = text;
  if (fechaValue)   fechaValue.value   = bookingState.selectedDate;
  if (horaValue)    horaValue.value    = bookingState.selectedTime || '';

  displayInput?.classList.remove('error');
  const errorEl = $('#error-fecha');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.remove('visible');
  }
}

// --------------------------------------------------------------------------
// 9. CALENDARIO INTERACTIVO
// --------------------------------------------------------------------------
(function initDatePicker() {
  const pickerBtn     = $('#date-picker-btn');
  const popup         = $('#calendar-popup');
  const displayInput  = $('#fecha-display');
  const daysContainer = $('#calendar-days');
  const monthLabel    = $('#cal-month-label');
  const prevMonthBtn  = $('#cal-prev-month');
  const nextMonthBtn  = $('#cal-next-month');

  if (!pickerBtn || !popup || !displayInput) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let viewDate = new Date(today.getFullYear(), today.getMonth(), 1);

  const MONTHS_ES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  function renderCalendar() {
    const year  = viewDate.getFullYear();
    const month = viewDate.getMonth();

    monthLabel.textContent = `${MONTHS_ES[month]} ${year}`;

    const firstDayIndex   = new Date(year, month, 1).getDay();
    const daysInMonth     = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    daysContainer.innerHTML = '';

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = daysInPrevMonth - i;
      btn.className = 'cal-day cal-day--other';
      btn.disabled = true;
      daysContainer.appendChild(btn);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const cellDate = new Date(year, month, day);
      cellDate.setHours(0, 0, 0, 0);

      const isPast     = cellDate < today;
      const isToday    = cellDate.getTime() === today.getTime();
      
      const dateIsoStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSelected = bookingState.selectedDate === dateIsoStr;

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
          bookingState.selectedDate = dateIsoStr;
          bookingState.selectedTime = null; // Reiniciar horario al cambiar día
          renderCalendar();
          updateDisplayInputs();
          fetchAndRenderAvailability(dateIsoStr, bookingState.selectedServiceId || $('#servicio-select')?.value);
        });
      }

      daysContainer.appendChild(btn);
    }

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

  prevMonthBtn?.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() - 1);
    renderCalendar();
  });

  nextMonthBtn?.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() + 1);
    renderCalendar();
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
// 10. FORMULARIO DE RESERVAS (POST /api/turnos)
// --------------------------------------------------------------------------
(function initBookingForm() {
  const form          = $('#booking-form');
  const submitBtn     = $('#submit-btn');
  const successBox    = $('#form-success');
  const errorBox      = $('#form-error');
  const servicioDesc  = $('#servicio');
  const charCount     = $('#servicio-count');

  if (!form) return;

  if (servicioDesc && charCount) {
    servicioDesc.addEventListener('input', () => {
      charCount.textContent = `${servicioDesc.value.length}/50`;
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

  function validateBookingSelection() {
    const serviceSelect = $('#servicio-select');
    if (!serviceSelect || !serviceSelect.value) {
      setFieldError('servicio-select', 'Por favor elegí el servicio deseado.');
      return false;
    }
    clearFieldError('servicio-select');

    if (!bookingState.selectedDate) {
      setFieldError('fecha-display', 'Seleccioná la fecha de tu turno en el calendario.');
      return false;
    }

    if (!bookingState.selectedTime) {
      setFieldError('fecha-display', 'Seleccioná un horario disponible de la lista.');
      return false;
    }

    clearFieldError('fecha-display');
    return true;
  }

  ['nombre', 'apellido', 'telefono'].forEach(fieldId => {
    const el = $(`#${fieldId}`);
    el?.addEventListener('blur', () => validateField(fieldId));
    el?.addEventListener('input', () => clearFieldError(fieldId));
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (successBox) successBox.hidden = true;
    if (errorBox)   errorBox.hidden   = true;

    const isNombreValid   = validateField('nombre');
    const isApellidoValid = validateField('apellido');
    const isTelValid      = validateField('telefono');
    const isSelectionOk   = validateBookingSelection();

    if (!isNombreValid || !isApellidoValid || !isTelValid || !isSelectionOk) {
      const firstError = $('.error', form);
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Preparar payload para la API
    const payload = {
      nombre: $('#nombre').value.trim(),
      apellido: $('#apellido').value.trim(),
      telefono: $('#telefono').value.trim(),
      servicio_id: $('#servicio-select').value,
      fecha: bookingState.selectedDate,
      hora_inicio: bookingState.selectedTime,
      observaciones: ($('#servicio')?.value || '').trim()
    };

    // Estado de carga
    const btnText    = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    submitBtn.disabled = true;
    if (btnText) btnText.hidden = true;
    if (btnLoading) btnLoading.hidden = false;

    try {
      const response = await fetch('/api/turnos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      submitBtn.disabled = false;
      if (btnText) btnText.hidden = false;
      if (btnLoading) btnLoading.hidden = true;

      if (!response.ok) {
        // En caso de conflicto de horario o error de backend
        if (response.status === 409) {
          $('#error-title').textContent = 'Horario no disponible';
          $('#error-desc').textContent  = 'El horario seleccionado acaba de ser ocupado por otra clienta. Por favor seleccioná otro de los horarios disponibles.';
          // Recargar horarios disponibles actualizados
          fetchAndRenderAvailability(bookingState.selectedDate, payload.servicio_id);
        } else {
          $('#error-title').textContent = 'No se pudo reservar el turno';
          $('#error-desc').textContent  = data.error || 'Por favor verificá los datos ingresados.';
        }
        if (errorBox) errorBox.hidden = false;
        errorBox?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Éxito
      if (successBox) {
        $('#success-title').textContent = '¡Tu turno fue reservado con éxito!';
        $('#success-desc').textContent  = `Te esperamos el ${payload.fecha} a las ${payload.hora_inicio} hs para tu servicio de ${data.turno?.servicio?.nombre || 'manicura'}. Te contactaremos a la brevedad por WhatsApp para confirmar.`;
        successBox.hidden = false;
      }

      form.reset();
      bookingState.selectedTime = null;
      $$('.time-slot').forEach(slot => slot.classList.remove('selected'));
      $$('.form-input').forEach(input => input.classList.remove('success', 'error'));
      if (charCount) charCount.textContent = '0/50';
      if ($('#fecha-display')) $('#fecha-display').value = '';

      successBox?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    } catch (err) {
      submitBtn.disabled = false;
      if (btnText) btnText.hidden = false;
      if (btnLoading) btnLoading.hidden = true;

      if (errorBox) {
        $('#error-title').textContent = 'Error de conexión';
        $('#error-desc').textContent  = 'No se pudo comunicar con el servidor de reservas. Por favor intentá nuevamente o comunicate por WhatsApp.';
        errorBox.hidden = false;
      }
      errorBox?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
})();

// --------------------------------------------------------------------------
// 11. RESALTADO AUTOMÁTICO DE SECCIÓN ACTIVA EN NAVEGACIÓN
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
// 12. REDES SOCIALES E INTERACCIONES
// --------------------------------------------------------------------------
(function initSocialAndEffects() {
  $$('.insta-tile').forEach(tile => {
    const openInsta = () => window.open('https://instagram.com/gwennails', '_blank', 'noopener,noreferrer');
    tile.addEventListener('click', openInsta);
    tile.addEventListener('keydown', (e) => { if (e.key === 'Enter') openInsta(); });
  });
})();

// --------------------------------------------------------------------------
// INICIALIZACIÓN GLOBAL
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  loadServicesFromApi();
});

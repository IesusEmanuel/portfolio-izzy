/* =========================================================
   IZZY — script.js
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initMarquee();
  initProjectsSlider();
  initCounters();
  initCalendly();
  initContactForm();
});

/* ---------- 1. Marquee (Companies Helped) ----------
   Duplica o grupo de logos uma vez. O CSS anima o track de -50% a 0,
   criando um loop contínuo da esquerda para a direita. */
function initMarquee() {
  const track = document.getElementById('marquee-track');
  const group = document.getElementById('marquee-group');
  if (!track || !group) return;

  const clone = group.cloneNode(true);
  clone.removeAttribute('id');
  clone.setAttribute('aria-hidden', 'true');
  track.appendChild(clone);

  // Garante que cada grupo seja mais largo que o container (evita "buracos")
  const container = track.parentElement;
  const ensureWidth = () => {
    while (group.scrollWidth < container.clientWidth && group.children.length < 60) {
      Array.from(group.children).forEach((item) => group.appendChild(item.cloneNode(true)));
      clone.innerHTML = group.innerHTML;
    }
  };
  ensureWidth();
  window.addEventListener('resize', ensureWidth);
}

/* ---------- 2. Projects slider (Previous / Next) ---------- */
/* function initProjectsSlider() {
  const track = document.getElementById('projects-track');
  const prev = document.getElementById('projects-prev');
  const next = document.getElementById('projects-next');
  if (!track || !prev || !next) return;

  const updateButtons = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
  };

  const scrollByPage = (direction) => {
    track.scrollBy({ left: direction * track.clientWidth, behavior: 'smooth' });
  };

  prev.addEventListener('click', () => scrollByPage(-1));
  next.addEventListener('click', () => scrollByPage(1));
  track.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);
  updateButtons();
} */

function initProjectsSlider() {
  const track = document.getElementById('projects-track');
  const prev = document.getElementById('projects-prev');
  const next = document.getElementById('projects-next');
  if (!track || !prev || !next) return;

  // Largura de um card + o gap entre eles = quanto andar a cada clique
  const getStep = () => {
    const card = track.querySelector('.project-card');
    if (!card) return track.clientWidth;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return card.getBoundingClientRect().width + gap;
  };

  const updateButtons = () => {
    const max = track.scrollWidth - track.clientWidth - 2;
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= max;
  };

  prev.addEventListener('click', () => track.scrollBy({ left: -getStep(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: getStep(), behavior: 'smooth' }));

  track.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);
  updateButtons();
}

/* ---------- 3. Contadores da seção About ---------- */
function initCounters() {
  const counters = document.querySelectorAll('.stat__value[data-count]');
  if (!counters.length || !('IntersectionObserver' in window)) return;

  const animate = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animate(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  counters.forEach((el) => observer.observe(el));
}

/* ---------- 4. Formulário de contato ---------- */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');
  if (!form || !feedback) return;

  const FORM_ENDPOINT = 'https://formspree.io/f/mljgvvkb'; // <- paste your Formspree URL
  const submitBtn = document.getElementById('form-submit');
  const msg = (key, fallback) => (window.I18N ? I18N.msg(key) : fallback);

  const required = ['field-company', 'field-name', 'field-email', 'field-message']
    .map((id) => document.getElementById(id));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.className = 'form__feedback';

    /* ---------- Validation ---------- */
    let valid = true;
    required.forEach((input) => {
      const empty = !input.value.trim();
      const badEmail = input.type === 'email' && !/^\S+@\S+\.\S+$/.test(input.value.trim());
      const invalid = empty || badEmail;
      input.classList.toggle('is-invalid', invalid);
      if (invalid) valid = false;
    });

    if (!valid) {
      feedback.textContent = msg('formError', 'Please fill in the required fields correctly.');
      feedback.classList.add('is-error');
      return;
    }

    /* ---------- Data ---------- */
    const data = new FormData(form);

    // Anti-spam: bots fill this hidden field, people don't
    if (data.get('website')) return;

    const payload = {
      _subject: `New contact from ${data.get('name')} (${data.get('company')})`,
      services: data.getAll('service').join(', '),
      budget: data.get('budget') || '',
      company: data.get('company'),
      name: data.get('name'),
      email: data.get('email'),
      phone: data.get('phone'),
      message: data.get('message'),
    };

    /* ---------- Sending ---------- */
    submitBtn.disabled = true;
    feedback.textContent = msg('formSending', 'Sending...');

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Request failed');

      feedback.textContent = msg('formSuccess', 'Thank you! Your message was sent.');
      feedback.classList.add('is-success');
      form.reset(); // only clears when the message was really sent
    } catch (error) {
      feedback.textContent = msg('formFailed', 'Something went wrong. Please try again.');
      feedback.classList.add('is-error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  /* ---------- Remove the red border while typing ---------- */
  form.addEventListener('input', (event) => {
    if (event.target.classList.contains('is-invalid')) {
      event.target.classList.remove('is-invalid');
    }
  });
}

/* ---------- 5. Voltar ao topo ----------
   O botão é fixo (CSS) e fica sempre visível; aqui só tratamos o clique. */
const backToTop = document.getElementById('back-to-top');
if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============ START: CALENDLY POPUP ============ */
function initCalendly() {
  const button = document.getElementById('schedule-btn');
  if (!button) return;

  button.addEventListener('click', (event) => {
    // Se o script do Calendly não carregou, deixa o link abrir normalmente
    if (!window.Calendly) return;

    event.preventDefault();
    window.Calendly.initPopupWidget({ url: button.href });
  });
}
/* ============= END: CALENDLY POPUP ============= */

/* ---------- Cards de projeto -> página de detalhe ---------- */
document.querySelectorAll('.project-card').forEach((card) => {
  const slug = card.id.replace('project-', '');
  const go = () => { window.location.href = `project.html?id=${slug}`; };

  card.setAttribute('role', 'link');
  card.setAttribute('tabindex', '0');
  card.style.cursor = 'pointer';

  card.addEventListener('click', go);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      go();
    }
  });
});
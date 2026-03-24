/**
 * APP.JS — Application Controller
 * IF7102 Multimedios | UCR Sede Guanacaste | I Ciclo 2026
 */

/* ── State ─────────────────────────────────── */
let allData          = null;
let lang             = 'es';
let currentProvincia = null;

const PROVINCE_COLORS = {
  'san-jose':   '#2D6A4F',
  'alajuela':   '#3d7a5c',
  'cartago':    '#4a8f69',
  'heredia':    '#52B788',
  'guanacaste': '#63c494',
  'limon':      '#1B4332',
  'puntarenas': '#74C69D',
};

/* ── Scroll Reveal ──────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.12 });

function observeReveal() {
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/* ── Init ───────────────────────────────────── */
async function init() {
  try {
    const res = await fetch('data/destinos.json');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allData = await res.json();
    buildLegend();
    setupMapInteractions();
    updateAllText();
    const statEl = document.getElementById('stat-destinos');
    if (statEl) statEl.textContent =
      allData.provincias.reduce((s, p) => s + p.destinos.length, 0);
    observeReveal();
  } catch(e) {
    console.error('Error cargando datos:', e);
  } finally {
    const loader = document.getElementById('app-loading');
    if (loader) loader.classList.add('hidden');
  }
}

/* ── Legend ─────────────────────────────────── */
function buildLegend() {
  const legend = document.getElementById('legend');
  if (!legend) return;
  legend.innerHTML = allData.provincias.map(p => {
    const color  = PROVINCE_COLORS[p.id] || p.color;
    const nombre = lang === 'en' ? p.nombre_en : p.nombre;
    return `
      <button class="legend-item" data-provincia="${p.id}" aria-label="${nombre}">
        <span class="legend-dot" style="background:${color}"></span>
        <span class="leg-name" data-id="${p.id}">${nombre}</span>
      </button>`;
  }).join('');

  legend.querySelectorAll('.legend-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const prov = allData.provincias.find(p => p.id === btn.dataset.provincia);
      if (prov) showProvincia(prov);
    });
  });
}

/* ── Map Interactions ───────────────────────── */
function setupMapInteractions() {
  const svg     = document.getElementById('mapa-cr');
  const tooltip = document.getElementById('map-tooltip');
  if (!svg) return;

  allData.provincias.forEach(prov => {
    const path = svg.querySelector(`#${prov.svgId}`);
    if (!path) return;

    path.addEventListener('mouseenter', e => {
      if (!tooltip) return;
      tooltip.textContent = lang === 'en' ? prov.nombre_en : prov.nombre;
      tooltip.classList.add('visible');
      positionTooltip(e, svg);
    });
    path.addEventListener('mousemove', e => positionTooltip(e, svg));
    path.addEventListener('mouseleave', () => tooltip && tooltip.classList.remove('visible'));
    path.addEventListener('click', () => showProvincia(prov));
    path.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showProvincia(prov); }
    });
  });
}

function positionTooltip(e, svg) {
  const tooltip = document.getElementById('map-tooltip');
  if (!tooltip) return;
  const rect = svg.closest('.map-container').getBoundingClientRect();
  tooltip.style.left = `${e.clientX - rect.left}px`;
  tooltip.style.top  = `${e.clientY - rect.top - 8}px`;
}

/* ── Show Provincia ─────────────────────────── */
function showProvincia(prov) {
  currentProvincia = prov;
  window.scrollTo({ top: 0, behavior: 'smooth' });

  const nombre = lang === 'en' ? prov.nombre_en : prov.nombre;
  const desc   = lang === 'en' ? prov.descripcion_en : prov.descripcion;

  const elNombre = document.getElementById('provincia-nombre');
  const elDesc   = document.getElementById('provincia-desc');
  if (elNombre) elNombre.textContent = nombre;
  if (elDesc)   elDesc.textContent   = desc;

  const color = PROVINCE_COLORS[prov.id] || prov.color;
  const bg = document.getElementById('provincia-bg');
  if (bg) bg.style.background = `linear-gradient(150deg, ${color} 0%, #0D1A0F 100%)`;

  // SVG silhouette
  const mainSvg = document.getElementById('mapa-cr');
  const frag    = document.getElementById('provincia-svg-frag');
  if (mainSvg && frag) {
    const path = mainSvg.querySelector(`#${prov.svgId}`);
    if (path) {
      const bbox = path.getBBox();
      frag.innerHTML = `
        <svg viewBox="${bbox.x-20} ${bbox.y-20} ${bbox.width+40} ${bbox.height+40}"
             xmlns="http://www.w3.org/2000/svg">
          <path d="${path.getAttribute('d')}" fill="white" stroke="none"/>
        </svg>`;
    }
  }

  fillDestinosGrid(prov);
  hidePage('page-home');
  hidePage('page-destino');
  showPage('page-provincia');
  setTimeout(observeReveal, 50);
}

/* ── Destinations Grid ──────────────────────── */
function fillDestinosGrid(prov) {
  const grid  = document.getElementById('destinos-grid');
  const title = document.getElementById('destinos-title');
  const count = document.getElementById('destinos-count');
  if (!grid) return;

  if (title) title.textContent = lang === 'en' ? 'Tourist Destinations' : 'Destinos Turísticos';
  if (count) count.textContent = `${prov.destinos.length} ${lang === 'en' ? 'destinations' : 'destinos'}`;

  grid.innerHTML = prov.destinos.map((d, i) => {
    const nombre = lang === 'en' ? (d.nombre_en || d.nombre) : d.nombre;
    const desc   = lang === 'en' ? (d.descripcion_en || d.descripcion) : d.descripcion;
    const acts   = lang === 'en' ? (d.actividades_en || d.actividades) : d.actividades;
    const img    = d.galeria?.[0] || d.imagen_portada || '';
    const num    = String(i + 1).padStart(2, '0');
    const tagsHtml = (acts || []).slice(0, 2).map(a =>
      `<span class="dest-card-tag">${a}</span>`).join('');
    const videoBadge = d.video ? `<div class="dest-card-video-badge">▶ Video</div>` : '';

    return `
      <div role="listitem" class="reveal reveal-delay-${(i % 3) + 1}">
        <article class="dest-card" data-id="${d.id}" tabindex="0"
                 aria-label="${nombre}" role="button">
          <div class="dest-card-img">
            ${img ? `<img src="${img}" alt="${nombre}" loading="lazy"
                          onerror="this.style.display='none'">` : ''}
            <div class="dest-card-num">${num}</div>
            ${videoBadge}
          </div>
          <div class="dest-card-body">
            <div class="dest-card-province-tag">${lang === 'en' ? prov.nombre_en : prov.nombre}</div>
            <h3 class="dest-card-title">${nombre}</h3>
            <p class="dest-card-desc">${desc}</p>
            <div class="dest-card-footer">
              <div class="dest-card-tags">${tagsHtml}</div>
              <span class="dest-card-arrow">→</span>
            </div>
          </div>
        </article>
      </div>`;
  }).join('');

  grid.querySelectorAll('.dest-card').forEach(card => {
    const emit = () => document.dispatchEvent(
      new CustomEvent('destino-selected', { detail: { id: card.dataset.id } })
    );
    card.addEventListener('click', emit);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); emit(); }
    });
  });
}

/* ── Show Destino ───────────────────────────── */
function showDestino(id) {
  if (!currentProvincia) return;
  const d = currentProvincia.destinos.find(x => x.id === id);
  if (!d) return;
  window.scrollTo({ top: 0, behavior: 'smooth' });
  const comp = document.getElementById('destino-detalle-component');
  if (comp) {
    comp.setAttribute('lang', lang);
    comp.destino = d;
  }
  hidePage('page-home');
  hidePage('page-provincia');
  showPage('page-destino');
}

/* ── Page Helpers ───────────────────────────── */
function showPage(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'block';
  requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'none'; });
}
function hidePage(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.display = 'none';
  el.style.opacity = '0';
}
function goHome() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
  hidePage('page-provincia');
  hidePage('page-destino');
  showPage('page-home');
  setTimeout(observeReveal, 50);
}

/* ── Language ───────────────────────────────── */
function setLang(newLang) {
  lang = newLang;
  document.documentElement.lang = lang;
  const header = document.getElementById('header');
  if (header) header.setAttribute('lang', lang);
  updateAllText();
  if (currentProvincia) {
    const pageP = document.getElementById('page-provincia');
    if (pageP && pageP.style.display !== 'none') showProvincia(currentProvincia);
  }
}

function updateAllText() {
  document.querySelectorAll('[data-es]').forEach(el => {
    el.textContent = lang === 'en' ? el.dataset.en : el.dataset.es;
  });
  if (allData) {
    document.querySelectorAll('.leg-name').forEach(el => {
      const prov = allData.provincias.find(p => p.id === el.dataset.id);
      if (prov) el.textContent = lang === 'en' ? prov.nombre_en : prov.nombre;
    });
  }
}

/* ── Global Events (after DOM ready) ───────── */
document.addEventListener('DOMContentLoaded', () => {

  /* ── Video hero autoplay ─────────────────── */
  const heroVideo = document.getElementById('hero-video');
  if (heroVideo) {
    // Ensure muted (required by browsers for autoplay)
    heroVideo.muted = true;
    heroVideo.volume = 0;

    const tryPlay = () => {
      heroVideo.play().catch(() => {
        // If autoplay blocked, try on first user interaction
        document.addEventListener('click', () => heroVideo.play(), { once: true });
        document.addEventListener('touchstart', () => heroVideo.play(), { once: true });
      });
    };

    if (heroVideo.readyState >= 2) {
      tryPlay();
    } else {
      heroVideo.addEventListener('canplay', tryPlay, { once: true });
      heroVideo.load();
    }
  }

  document.addEventListener('navigate-home', goHome);

  document.addEventListener('lang-change', e => {
    setLang(e.detail.lang);
    const comp = document.getElementById('destino-detalle-component');
    if (comp) comp.setAttribute('lang', lang);
  });

  document.addEventListener('destino-selected', e => showDestino(e.detail.id));

  document.addEventListener('back-to-provincia', () => {
    hidePage('page-destino');
    if (currentProvincia) showProvincia(currentProvincia);
    else goHome();
  });

  const btnVolver = document.getElementById('btn-volver-home');
  if (btnVolver) btnVolver.addEventListener('click', goHome);



  /* ── Promo Video (below map) ─────────────── */
  (function initPromoVideo() {
    const vid      = document.getElementById('promo-video');
    if (!vid) return;

    const overlay  = document.getElementById('promo-overlay');
    const wrap     = vid.closest('.promo-video-wrap');
    const toggleBtn= document.getElementById('promo-toggle');
    const toggleIco= document.getElementById('promo-toggle-icon');
    const progWrap = document.getElementById('promo-progress-wrap');
    const progFill = document.getElementById('promo-progress-fill');
    const progThumb= document.getElementById('promo-progress-thumb');
    const timeEl   = document.getElementById('promo-time');
    const muteBtn  = document.getElementById('promo-mute-btn');
    const volIcon  = document.getElementById('promo-vol-icon');
    const volLabel = document.getElementById('promo-vol-label');
    const volSlider= document.getElementById('promo-vol-slider');
    const fsBtn    = document.getElementById('promo-fs-btn');

    // Start muted, autoplay when visible
    vid.muted  = true;
    vid.volume = 0;

    // ── Intersection observer: autoplay when in viewport ──
    const playObserver = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          vid.play().catch(() => {});
          wrap.classList.add('playing');
          wrap.classList.remove('paused');
        } else {
          vid.pause();
          wrap.classList.remove('playing');
          wrap.classList.add('paused');
        }
      });
    }, { threshold: 0.3 });
    playObserver.observe(vid);

    // ── Format time ──
    const fmt = t => {
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    // ── Overlay click → play ──
    overlay.addEventListener('click', () => {
      vid.play().catch(() => {});
      overlay.classList.add('hidden');
      wrap.classList.add('playing');
      wrap.classList.remove('paused');
    });
    vid.addEventListener('click', () => {
      if (vid.paused) {
        vid.play().catch(() => {});
        wrap.classList.add('playing');
        wrap.classList.remove('paused');
      } else {
        vid.pause();
        wrap.classList.remove('playing');
        wrap.classList.add('paused');
      }
    });

    // ── Hide overlay once playing ──
    vid.addEventListener('play', () => {
      overlay.classList.add('hidden');
      if (toggleIco) toggleIco.textContent = '⏸';
      wrap.classList.add('playing');
      wrap.classList.remove('paused');
    });
    vid.addEventListener('pause', () => {
      if (toggleIco) toggleIco.textContent = '▶';
      wrap.classList.remove('playing');
      wrap.classList.add('paused');
    });

    // ── Toggle play/pause button ──
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (vid.paused) { vid.play().catch(() => {}); }
        else            { vid.pause(); }
      });
    }

    // ── Progress update ──
    vid.addEventListener('timeupdate', () => {
      if (!vid.duration) return;
      const pct = (vid.currentTime / vid.duration) * 100;
      if (progFill)  progFill.style.width  = pct + '%';
      if (progThumb) progThumb.style.left  = pct + '%';
      if (timeEl)    timeEl.textContent    = fmt(vid.currentTime) + ' / ' + fmt(vid.duration);
    });

    // ── Click on progress bar ──
    if (progWrap) {
      progWrap.addEventListener('click', e => {
        const rect = progWrap.getBoundingClientRect();
        const pct  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        vid.currentTime = pct * vid.duration;
      });
    }

    // ── Mute / unmute with volume control ──
    let savedVol = 0.8;
    const isSilent = () => vid.muted || vid.volume === 0;

    const setMuted = (mute) => {
      if (mute) {
        // Going silent: save current volume first
        if (vid.volume > 0) savedVol = vid.volume;
        vid.muted  = true;
        vid.volume = 0;
        if (volIcon)  volIcon.textContent  = '🔇';
        if (volLabel) volLabel.textContent = lang === 'en' ? 'Enable sound' : 'Activar sonido';
        if (volSlider) volSlider.classList.remove('visible');
      } else {
        // Going audible: restore saved volume
        vid.muted  = false;
        vid.volume = savedVol > 0 ? savedVol : 0.8;
        if (volIcon)  volIcon.textContent  = '🔊';
        if (volLabel) volLabel.textContent = lang === 'en' ? 'Mute' : 'Silenciar';
        if (volSlider) {
          volSlider.value = vid.volume;
          volSlider.classList.add('visible');
        }
      }
    };

    if (muteBtn) {
      // Toggle: if currently silent → unmute; if audible → mute
      muteBtn.addEventListener('click', () => setMuted(!isSilent()));
    }

    if (volSlider) {
      volSlider.addEventListener('input', () => {
        savedVol = parseFloat(volSlider.value);
        vid.volume = savedVol;
        vid.muted = savedVol === 0;
        if (volIcon) volIcon.textContent = savedVol === 0 ? '🔇' : '🔊';
      });
    }

    // ── Fullscreen ──
    if (fsBtn) {
      fsBtn.addEventListener('click', () => {
        const el = wrap;
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (el.requestFullscreen) {
          el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          el.webkitRequestFullscreen();
        }
      });
    }

    // ── Keyboard on video ──
    vid.setAttribute('tabindex', '0');
    vid.addEventListener('keydown', e => {
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        if (vid.paused) vid.play().catch(() => {}); else vid.pause();
      }
      if (e.key === 'm') setMuted(!isSilent());
      if (e.key === 'ArrowRight') vid.currentTime = Math.min(vid.duration, vid.currentTime + 5);
      if (e.key === 'ArrowLeft')  vid.currentTime = Math.max(0, vid.currentTime - 5);
    });
  })();

  /* Boot */
  init();
});
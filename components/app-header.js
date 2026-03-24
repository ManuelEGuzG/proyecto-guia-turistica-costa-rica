/**
 * <app-header> — Web Component Premium
 * IF7102 Multimedios | UCR Sede Guanacaste | I Ciclo 2026
 */

class AppHeader extends HTMLElement {
  static get observedAttributes() { return ['lang']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._lang = 'es';
  }

  connectedCallback() { this._render(); this._bindEvents(); }

  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'lang' && oldVal !== newVal) {
      this._lang = newVal;
      this._updateLang();
    }
  }

  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@200;300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :host {
          display: block;
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 1000;
        }

        /* ── Wrapper ── */
        header {
          position: relative;
          background: transparent;
          transition: background 0.5s ease, box-shadow 0.5s ease;
        }

        /* Scrolled state */
        header.scrolled {
          background: rgba(10, 20, 12, 0.88);
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
        }

        /* Gold top border — appears on scroll */
        header::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(201,168,76,0.3) 15%,
            rgba(232,213,163,0.9) 35%,
            #C9A84C 50%,
            rgba(232,213,163,0.9) 65%,
            rgba(201,168,76,0.3) 85%,
            transparent 100%);
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        header.scrolled::before { opacity: 1; }

        /* Bottom separator — always visible when scrolled */
        header::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg,
            transparent,
            rgba(201,168,76,0.12) 30%,
            rgba(201,168,76,0.12) 70%,
            transparent);
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        header.scrolled::after { opacity: 1; }

        /* ── Nav ── */
        nav {
          max-width: 1440px;
          margin: 0 auto;
          padding: 0 5vw;
          height: 76px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
        }

        /* ── LOGO ── */
        .logo {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          cursor: pointer;
          transition: opacity 0.25s ease;
          flex-shrink: 0;
          text-decoration: none;
        }
        .logo:hover { opacity: 0.85; }

        /* Logo image container */
        .logo-img-wrap {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          background: linear-gradient(135deg, #1B4332, #2D6A4F);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 2px 0 rgba(255,255,255,0.06) inset,
            0 3px 14px rgba(82,183,136,0.28),
            0 1px 4px rgba(0,0,0,0.4);
          position: relative;
          transition: box-shadow 0.3s ease;
        }
        .logo:hover .logo-img-wrap {
          box-shadow:
            0 2px 0 rgba(255,255,255,0.08) inset,
            0 6px 20px rgba(82,183,136,0.42),
            0 1px 4px rgba(0,0,0,0.4);
        }

        .logo-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        /* Fallback emoji if image fails */
        .logo-fallback {
          font-size: 1.3rem;
          display: none;
          position: absolute;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1;
          gap: 4px;
        }

        .logo-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.25rem;
          font-weight: 400;
          font-style: italic;
          color: #F7F3EB;
          letter-spacing: 0.03em;
          line-height: 1;
        }

        .logo-sub {
          font-family: 'Jost', sans-serif;
          font-size: 0.5rem;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: rgba(201,168,76,0.85);
          line-height: 1;
        }

        /* ── CENTER ORNAMENT ── */
        .nav-ornament {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 0.65rem;
          opacity: 0;
          transition: opacity 0.5s ease;
          pointer-events: none;
        }
        header.scrolled .nav-ornament { opacity: 1; }

        .orn-line {
          width: 48px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.35), transparent);
        }
        .orn-diamond {
          width: 5px; height: 5px;
          background: rgba(201,168,76,0.55);
          transform: rotate(45deg);
          flex-shrink: 0;
        }
        .orn-dot {
          width: 3px; height: 3px;
          border-radius: 50%;
          background: rgba(201,168,76,0.4);
          flex-shrink: 0;
        }

        /* ── RIGHT ACTIONS ── */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1.1rem;
          flex-shrink: 0;
        }

        /* Map / Explore button */
        .btn-map {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          font-family: 'Jost', sans-serif;
          font-size: 0.64rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(247,243,235,0.7);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(201,168,76,0.18);
          border-radius: 2px;
          padding: 0.6rem 1.3rem;
          cursor: pointer;
          transition: all 0.25s ease;
          white-space: nowrap;
          position: relative;
          overflow: hidden;
        }
        /* Shimmer on hover */
        .btn-map::before {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.08), transparent);
          transition: left 0.4s ease;
        }
        .btn-map:hover::before { left: 100%; }
        .btn-map:hover {
          background: rgba(201,168,76,0.1);
          border-color: rgba(201,168,76,0.45);
          color: #E8D5A3;
          box-shadow: 0 0 16px rgba(201,168,76,0.1);
        }
        .btn-icon { font-size: 0.85rem; }

        /* Separator */
        .v-sep {
          width: 1px; height: 20px;
          background: rgba(255,255,255,0.1);
          flex-shrink: 0;
        }

        /* ── LANGUAGE SWITCHER ── */
        .lang-group {
          display: flex;
          align-items: center;
          border: 1px solid rgba(201,168,76,0.18);
          border-radius: 2px;
          overflow: hidden;
          background: rgba(255,255,255,0.04);
          flex-shrink: 0;
        }
        .lang-btn {
          font-family: 'Jost', sans-serif;
          font-size: 0.64rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: rgba(247,243,235,0.4);
          background: transparent;
          border: none;
          padding: 0.55rem 0.9rem;
          cursor: pointer;
          transition: all 0.22s ease;
        }
        .lang-btn.active {
          background: #C9A84C;
          color: #0D1A0F;
          font-weight: 700;
        }
        .lang-btn:not(.active):hover {
          color: #E8D5A3;
          background: rgba(201,168,76,0.08);
        }
        .lang-sep {
          width: 1px; height: 14px;
          background: rgba(201,168,76,0.15);
          flex-shrink: 0;
        }

        /* ── MOBILE ── */
        @media (max-width: 600px) {
          nav { padding: 0 1.2rem; height: 64px; }
          .btn-map .btn-label { display: none; }
          .v-sep { display: none; }
          .logo-sub { display: none; }
          .logo-img-wrap { width: 38px; height: 38px; }
          .logo-name { font-size: 1.1rem; }
        }
      </style>

      <header id="header-el">
        <nav>

          <!-- LOGO -->
          <div class="logo" id="logo-btn" role="button" tabindex="0" aria-label="Ir al inicio">
            <div class="logo-img-wrap">
              <img
                class="logo-img"
                src="assets/img/logo-turismo.png"
                alt="Logo Guía Turística Costa Rica"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='block'"
              >
              <span class="logo-fallback">🌿</span>
            </div>
            <div class="logo-text">
              <span class="logo-name">Costa Rica</span>
              <span class="logo-sub" data-es="Guía Turística" data-en="Travel Guide">Guía Turística</span>
            </div>
          </div>

          <!-- CENTER ORNAMENT (visible on scroll) -->
          <div class="nav-ornament" aria-hidden="true">
            <div class="orn-line"></div>
            <div class="orn-dot"></div>
            <div class="orn-diamond"></div>
            <div class="orn-dot"></div>
            <div class="orn-line"></div>
          </div>

          <!-- ACTIONS -->
          <div class="nav-actions">
            <button class="btn-map" id="btn-map-action">
              <span class="btn-icon">🗺️</span>
              <span class="btn-label" data-es="Explorar Mapa" data-en="Explore Map">Explorar Mapa</span>
            </button>

            <div class="v-sep" aria-hidden="true"></div>

            <div class="lang-group" role="group" aria-label="Idioma / Language">
              <button class="lang-btn active" id="btn-es" data-lang="es" aria-pressed="true">ES</button>
              <div class="lang-sep" aria-hidden="true"></div>
              <button class="lang-btn" id="btn-en" data-lang="en" aria-pressed="false">EN</button>
            </div>
          </div>

        </nav>
      </header>
    `;
  }

  _bindEvents() {
    const root = this.shadowRoot;

    /* Scroll state */
    const headerEl = root.getElementById('header-el');
    window.addEventListener('scroll', () => {
      headerEl.classList.toggle('scrolled', window.scrollY > 50);
    }, { passive: true });

    /* Logo & map → navigate home */
    const goHome = () => this.dispatchEvent(
      new CustomEvent('navigate-home', { bubbles: true, composed: true })
    );
    const logoBtn = root.getElementById('logo-btn');
    logoBtn.addEventListener('click', goHome);
    logoBtn.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goHome(); }
    });
    root.getElementById('btn-map-action').addEventListener('click', goHome);

    /* Language */
    root.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('lang-change', {
          detail: { lang: btn.dataset.lang },
          bubbles: true,
          composed: true
        }));
      });
    });
  }

  _updateLang() {
    const root = this.shadowRoot;
    if (!root) return;
    root.querySelectorAll('.lang-btn').forEach(btn => {
      const active = btn.dataset.lang === this._lang;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
    root.querySelectorAll('[data-es]').forEach(el => {
      el.textContent = this._lang === 'en' ? el.dataset.en : el.dataset.es;
    });
  }
}

customElements.define('app-header', AppHeader);
/**
 * <galeria-imagenes> — Web Component
 * Galería de imágenes con navegación anterior/siguiente
 * IF7102 Multimedios | UCR
 */

class GaleriaImagenes extends HTMLElement {
  static get observedAttributes() {
    return ['imagenes', 'nombre'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._imagenes = [];
    this._index    = 0;
  }

  connectedCallback() { this._render(); }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === 'imagenes') {
      try { this._imagenes = JSON.parse(newVal || '[]'); }
      catch(e) { this._imagenes = []; }
      this._index = 0;
    }
    this._render();
  }

  _render() {
    const imgs  = this._imagenes;
    const idx   = this._index;
    const total = imgs.length;
    const nombre = this.getAttribute('nombre') || '';

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; width: 100%; }

        .galeria {
          position: relative;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          background: #1B4332;
          aspect-ratio: 16/9;
          box-shadow: 0 8px 32px rgba(27,67,50,0.25);
        }

        .slide {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: opacity 0.4s ease;
        }

        .slide img.loading { opacity: 0; }
        .slide img.loaded  { opacity: 1; }

        .slide-fallback {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #2D6A4F, #40916C);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 0.5rem;
          color: #B7E4C7;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.85rem;
        }

        .slide-fallback span:first-child { font-size: 3rem; }

        /* Overlay gradient */
        .overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(27,67,50,0.5) 0%,
            transparent 40%
          );
          pointer-events: none;
        }

        /* Navigation buttons */
        .btn-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          background: rgba(27,67,50,0.75);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(82,183,136,0.3);
          border-radius: 50%;
          color: #D8F3DC;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
        }

        .btn-nav:hover {
          background: rgba(64,145,108,0.9);
          border-color: rgba(82,183,136,0.7);
          transform: translateY(-50%) scale(1.05);
        }

        .btn-nav:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .btn-nav:disabled:hover {
          transform: translateY(-50%) scale(1);
          background: rgba(27,67,50,0.75);
        }

        #btn-prev { left: 12px; }
        #btn-next { right: 12px; }

        /* Counter */
        .counter {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(27,67,50,0.75);
          backdrop-filter: blur(6px);
          color: #D8F3DC;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          padding: 4px 10px;
          border-radius: 999px;
          z-index: 10;
        }

        /* Dots */
        .dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-top: 10px;
        }

        .dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #B7E4C7;
          opacity: 0.4;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .dot.active {
          opacity: 1;
          background: #40916C;
          transform: scale(1.3);
        }

        .empty-state {
          width: 100%;
          aspect-ratio: 16/9;
          background: linear-gradient(135deg, #2D6A4F, #40916C);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 0.5rem;
          color: #B7E4C7;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
        }

        .empty-state span:first-child { font-size: 3.5rem; }
      </style>

      ${total === 0 ? `
        <div class="empty-state" role="img" aria-label="${nombre}">
          <span>🌿</span>
          <span>Imagen próximamente</span>
        </div>
      ` : `
        <div class="galeria" aria-label="Galería de ${nombre}">
          <div class="slide">
            <img
              src="${imgs[idx]}"
              alt="${nombre} — imagen ${idx + 1} de ${total}"
              class="loading"
              id="main-img"
              onload="this.classList.remove('loading'); this.classList.add('loaded')"
              onerror="this.style.display='none'; document.querySelector('.slide-fallback').style.display='flex'"
            />
            <div class="slide-fallback" style="display:none">
              <span>🌿</span>
              <span>${nombre}</span>
            </div>
            <div class="overlay"></div>
          </div>

          ${total > 1 ? `
            <button class="btn-nav" id="btn-prev"
              aria-label="Imagen anterior"
              ${idx === 0 ? 'disabled' : ''}
            >‹</button>
            <button class="btn-nav" id="btn-next"
              aria-label="Imagen siguiente"
              ${idx === total - 1 ? 'disabled' : ''}
            >›</button>
            <div class="counter" aria-live="polite">${idx + 1} / ${total}</div>
          ` : ''}
        </div>

        ${total > 1 ? `
          <div class="dots" role="tablist" aria-label="Navegación de imágenes">
            ${imgs.map((_, i) => `
              <button class="dot ${i === idx ? 'active' : ''}"
                role="tab"
                aria-selected="${i === idx}"
                aria-label="Imagen ${i + 1}"
                data-i="${i}"
              ></button>
            `).join('')}
          </div>
        ` : ''}
      `}
    `;

    // Events
    if (total > 1) {
      const btnPrev = this.shadowRoot.getElementById('btn-prev');
      const btnNext = this.shadowRoot.getElementById('btn-next');

      if (btnPrev) btnPrev.addEventListener('click', () => this._goto(this._index - 1));
      if (btnNext) btnNext.addEventListener('click', () => this._goto(this._index + 1));

      this.shadowRoot.querySelectorAll('.dot').forEach(dot => {
        dot.addEventListener('click', () => this._goto(parseInt(dot.dataset.i)));
      });
    }

    // Keyboard navigation
    this.shadowRoot.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') this._goto(this._index - 1);
      if (e.key === 'ArrowRight') this._goto(this._index + 1);
    });
  }

  _goto(i) {
    const total = this._imagenes.length;
    if (i < 0 || i >= total) return;
    this._index = i;
    this._render();
  }
}

customElements.define('galeria-imagenes', GaleriaImagenes);
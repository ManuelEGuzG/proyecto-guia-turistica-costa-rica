/**
 * <destino-card> — Web Component
 * Tarjeta de destino turístico con imagen, nombre y actividades
 * IF7102 Multimedios | UCR
 */

class DestinoCard extends HTMLElement {
  static get observedAttributes() {
    return ['destino-id', 'nombre', 'nombre-en', 'imagen', 'descripcion', 'descripcion-en', 'actividades', 'actividades-en', 'lang', 'tiene-video'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this._render();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal !== newVal) this._render();
  }

  _render() {
    const id          = this.getAttribute('destino-id') || '';
    const nombre      = this.getAttribute('nombre') || '';
    const nombreEn    = this.getAttribute('nombre-en') || nombre;
    const imagen      = this.getAttribute('imagen') || '';
    const desc        = this.getAttribute('descripcion') || '';
    const descEn      = this.getAttribute('descripcion-en') || desc;
    const lang        = this.getAttribute('lang') || 'es';
    const tieneVideo  = this.getAttribute('tiene-video') === 'true';

    let actividades = [];
    let actividadesEn = [];
    try {
      actividades   = JSON.parse(this.getAttribute('actividades') || '[]');
      actividadesEn = JSON.parse(this.getAttribute('actividades-en') || '[]');
    } catch(e) {}

    const displayNombre = lang === 'en' ? nombreEn : nombre;
    const displayDesc   = lang === 'en' ? descEn : desc;
    const displayActs   = lang === 'en' ? actividadesEn : actividades;

    const actsHtml = displayActs.slice(0, 3).map(a =>
      `<span class="tag">${a}</span>`
    ).join('');

    const videoLabel = lang === 'en' ? 'Video' : 'Video';
    const verMas = lang === 'en' ? 'Explore' : 'Explorar';

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          height: 100%;
        }

        .card {
          height: 100%;
          background: #fff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(27,67,50,0.1);
          transition: transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
                      box-shadow 0.3s ease;
          cursor: pointer;
          display: flex;
          flex-direction: column;
        }

        .card:hover {
          transform: translateY(-6px);
          box-shadow: 0 16px 48px rgba(27,67,50,0.2);
        }

        .card:hover .img-wrapper img {
          transform: scale(1.06);
        }

        .img-wrapper {
          position: relative;
          height: 200px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .img-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .img-fallback {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #2D6A4F, #52B788);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
        }

        .video-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(27,67,50,0.85);
          color: #74C69D;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.65rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
          display: flex;
          align-items: center;
          gap: 4px;
          backdrop-filter: blur(6px);
        }

        .body {
          padding: 1.1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }

        .nombre {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.05rem;
          font-weight: 700;
          color: #1B4332;
          line-height: 1.25;
        }

        .desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          color: #5a5a5a;
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.35rem;
          margin-top: auto;
          padding-top: 0.5rem;
        }

        .tag {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem;
          color: #2D6A4F;
          background: #D8F3DC;
          padding: 3px 9px;
          border-radius: 999px;
          font-weight: 500;
        }

        .cta {
          margin-top: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 600;
          color: #40916C;
          transition: gap 0.2s ease;
        }

        .card:hover .cta {
          gap: 0.7rem;
        }

        .cta-arrow {
          transition: transform 0.2s ease;
        }

        .card:hover .cta-arrow {
          transform: translateX(4px);
        }
      </style>

      <article class="card" role="button" tabindex="0"
               aria-label="${displayNombre}"
               id="card-${id}">
        <div class="img-wrapper">
          ${imagen
            ? `<img src="${imagen}" alt="${displayNombre}" loading="lazy"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
               <div class="img-fallback" style="display:none">🌿</div>`
            : `<div class="img-fallback">🌿</div>`
          }
          ${tieneVideo ? `<div class="video-badge">▶ ${videoLabel}</div>` : ''}
        </div>
        <div class="body">
          <h3 class="nombre">${displayNombre}</h3>
          <p class="desc">${displayDesc}</p>
          <div class="tags">${actsHtml}</div>
          <div class="cta">
            <span>${verMas}</span>
            <span class="cta-arrow">→</span>
          </div>
        </div>
      </article>
    `;

    // Click & keyboard events
    const card = this.shadowRoot.querySelector('.card');
    const emit = () => {
      this.dispatchEvent(new CustomEvent('destino-selected', {
        detail: { id },
        bubbles: true,
        composed: true
      }));
    };

    card.addEventListener('click', emit);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); emit(); }
    });
  }
}

customElements.define('destino-card', DestinoCard);
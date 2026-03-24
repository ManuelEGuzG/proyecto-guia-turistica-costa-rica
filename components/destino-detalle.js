/**
 * <destino-detalle> — Web Component (Rediseñado)
 * Vista completa y rica de un destino turístico
 * IF7102 Multimedios | UCR
 */

class DestinoDetalle extends HTMLElement {
  static get observedAttributes() { return ['destino-json', 'lang']; }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._destino = null;
  }

  connectedCallback() { this._render(); }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === 'destino-json') {
      try { this._destino = JSON.parse(newVal); } catch(e) { this._destino = null; }
    }
    this._render();
  }

  set destino(obj) { this._destino = obj; this._render(); }

  _render() {
    const d    = this._destino;
    const lang = this.getAttribute('lang') || 'es';
    if (!d) { this.shadowRoot.innerHTML = `<style>:host{display:block}</style>`; return; }

    const es = lang === 'es';

    const nombre      = es ? d.nombre      : (d.nombre_en || d.nombre);
    const descripcion = es ? d.descripcion : (d.descripcion_en || d.descripcion);
    const actividades = es ? (d.actividades || []) : (d.actividades_en || d.actividades || []);
    const galeria     = d.galeria || (d.imagen_portada ? [d.imagen_portada] : []);
    const video       = d.video || '';
    const portada     = galeria[0] || '';

    const L = {
      back:      es ? 'Volver a la provincia' : 'Back to province',
      gallery:   es ? 'Galería de imágenes'   : 'Photo Gallery',
      about:     es ? 'Sobre este lugar'      : 'About this place',
      acts:      es ? 'Actividades'           : 'Activities',
      tips:      es ? 'Tips del viajero'      : 'Traveler Tips',
      video:     es ? 'Video del destino'     : 'Destination Video',
      coords:    es ? 'Ubicación'             : 'Location',
      explore:   es ? 'Ver en Google Maps'    : 'View on Google Maps',
      photos:    es ? 'fotos'                 : 'photos',
      dest:      es ? 'Destino'               : 'Destination',
      pv:        es ? '🌿 Pura Vida'          : '🌿 Pura Vida',
    };

    const tips = es ? [
      { icon: '🌤️', title: 'Mejor época para visitar',
        text: 'La temporada seca (diciembre–abril) es ideal para senderismo y actividades al aire libre. En temporada lluviosa el paisaje es más verde y hay menos turistas.' },
      { icon: '🚗', title: 'Cómo llegar',
        text: 'Se recomienda vehículo 4×4 para acceder a destinos de montaña y zonas remotas. Muchos parques tienen buses desde San José.' },
      { icon: '🎒', title: 'Qué llevar',
        text: 'Repelente de insectos, bloqueador solar, agua suficiente, calzado impermeable y una chaqueta liviana para cambios de temperatura.' },
    ] : [
      { icon: '🌤️', title: 'Best season to visit',
        text: 'Dry season (Dec–Apr) is ideal for hiking and outdoor activities. Rainy season brings lush landscapes and fewer tourists.' },
      { icon: '🚗', title: 'Getting there',
        text: 'A 4×4 vehicle is recommended for mountain destinations and remote areas. Many parks have buses from San José.' },
      { icon: '🎒', title: 'What to bring',
        text: 'Insect repellent, sunscreen, enough water, waterproof footwear and a light jacket for temperature changes.' },
    ];

    const actsHtml = actividades.map(a =>
      `<span class="act-pill">${a}</span>`
    ).join('');

    const tipsHtml = tips.map(t =>
      `<div class="tip-card">
        <div class="tip-icon">${t.icon}</div>
        <div>
          <div class="tip-title">${t.title}</div>
          <div class="tip-text">${t.text}</div>
        </div>
      </div>`
    ).join('');

    const mapsUrl = d.lat && d.lng
      ? `https://www.google.com/maps?q=${d.lat},${d.lng}`
      : null;

    this.shadowRoot.innerHTML = `
      <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :host { display: block; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── TOPBAR ── */
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 2rem;
          margin-bottom: 2.5rem;
          border-bottom: 1px solid rgba(45,106,79,0.12);
          animation: fadeUp 0.5s ease both;
        }
        .btn-back {
          display: inline-flex;
          align-items: center;
          gap: 0.7rem;
          font-family: 'Jost','DM Sans',sans-serif;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #2D6A4F;
          background: transparent;
          border: 1px solid rgba(45,106,79,0.3);
          border-radius: 2px;
          padding: 0.6rem 1.25rem;
          cursor: pointer;
          transition: all 0.22s ease;
        }
        .btn-back:hover { background: #2D6A4F; color: white; border-color: #2D6A4F; }
        .btn-back:hover .arrow { transform: translateX(-4px); }
        .arrow { display: inline-block; transition: transform 0.22s ease; }

        .breadcrumb {
          font-family: 'Jost','DM Sans',sans-serif;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          color: rgba(13,26,15,0.3);
          text-transform: uppercase;
        }
        .breadcrumb strong { color: rgba(13,26,15,0.55); font-weight: 500; }

        /* ── HERO GRID ── */
        .hero {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 3.5rem;
          margin-bottom: 4rem;
          animation: fadeUp 0.55s 0.08s ease both;
        }
        @media (max-width: 740px) { .hero { grid-template-columns: 1fr; gap: 2rem; } }

        .hero-img {
          position: relative;
          aspect-ratio: 4/3;
          border-radius: 3px;
          overflow: hidden;
          background: linear-gradient(135deg,#2D6A4F,#40916C);
        }
        .hero-img img {
          width:100%; height:100%;
          object-fit: cover;
          display: block;
          transition: transform 0.5s ease;
        }
        .hero-img:hover img { transform: scale(1.04); }
        .photo-badge {
          position: absolute; bottom:12px; right:12px;
          background: rgba(13,26,15,0.72); backdrop-filter: blur(6px);
          color: rgba(255,255,255,0.82);
          font-family: 'Jost',sans-serif; font-size: 0.65rem;
          letter-spacing: 0.08em; padding: 0.3rem 0.7rem;
        }

        .hero-info { display: flex; flex-direction: column; justify-content: center; gap: 1.4rem; }

        .eyebrow {
          font-family:'Jost',sans-serif; font-size:0.6rem; font-weight:600;
          letter-spacing:0.22em; text-transform:uppercase; color:#C9A84C;
          display:flex; align-items:center; gap:0.65rem;
        }
        .eyebrow::before { content:''; display:block; width:20px; height:1px; background:#C9A84C; }

        .dest-title {
          font-family:'Cormorant Garamond','Playfair Display',Georgia,serif;
          font-size: clamp(2rem,3.8vw,3.2rem);
          font-weight:300; color:#0D1A0F;
          line-height:1.05; letter-spacing:-0.02em;
        }

        .divider { width:36px; height:2px; background:linear-gradient(90deg,#2D6A4F,#52B788); }

        .desc {
          font-family:'Jost','DM Sans',sans-serif;
          font-size:0.93rem; font-weight:300;
          line-height:1.82; color:rgba(13,26,15,0.62);
        }

        /* Activities */
        .acts-block { display:flex; flex-direction:column; gap:0.55rem; }
        .acts-lbl {
          font-family:'Jost',sans-serif; font-size:0.58rem; font-weight:600;
          letter-spacing:0.2em; text-transform:uppercase; color:#2D6A4F;
        }
        .pills { display:flex; flex-wrap:wrap; gap:0.35rem; }
        .act-pill {
          font-family:'Jost',sans-serif; font-size:0.7rem; font-weight:400;
          color:#2D6A4F; background:rgba(82,183,136,0.09);
          border:1px solid rgba(82,183,136,0.22); border-radius:2px;
          padding:0.28rem 0.75rem; transition:all 0.18s ease;
        }
        .act-pill:hover { background:#2D6A4F; color:white; border-color:#2D6A4F; }

        /* Location */
        .loc-row {
          display:flex; align-items:center; justify-content:space-between;
          flex-wrap:wrap; gap:0.6rem;
          padding-top:1rem; border-top:1px solid rgba(45,106,79,0.1);
        }
        .coords {
          font-family:monospace; font-size:0.7rem;
          color:rgba(13,26,15,0.38);
        }
        .btn-maps {
          display:inline-flex; align-items:center; gap:0.4rem;
          font-family:'Jost',sans-serif; font-size:0.65rem; font-weight:500;
          letter-spacing:0.1em; text-transform:uppercase;
          color:white; background:#2D6A4F; border:none; border-radius:2px;
          padding:0.5rem 1rem; cursor:pointer; text-decoration:none;
          transition:background 0.2s ease;
        }
        .btn-maps:hover { background:#1B4332; }

        /* ── SECTION TEMPLATE ── */
        .section { margin-bottom: 3.5rem; animation: fadeUp 0.55s ease both; }
        .sec-header { margin-bottom:1.4rem; }
        .sec-lbl {
          font-family:'Jost',sans-serif; font-size:0.6rem; font-weight:600;
          letter-spacing:0.22em; text-transform:uppercase; color:#2D6A4F;
          display:flex; align-items:center; gap:0.6rem;
        }
        .sec-lbl::before { content:''; display:block; width:18px; height:1px; background:#52B788; }

        /* ── GALLERY ── */
        galeria-imagenes { display:block; }
        .thumbs {
          display:grid;
          grid-template-columns: repeat(auto-fill, minmax(130px,1fr));
          gap:0.5rem; margin-top:0.6rem;
        }
        .thumb {
          aspect-ratio:4/3; overflow:hidden; background:#1B4332;
          border:none; padding:0; cursor:pointer; border-radius:2px;
          position:relative; transition:transform 0.2s ease;
        }
        .thumb::after {
          content:''; position:absolute; inset:0;
          background:rgba(13,26,15,0); transition:background 0.2s ease;
        }
        .thumb:hover { transform:scale(1.025); }
        .thumb:hover::after { background:rgba(13,26,15,0.18); }
        .thumb img { width:100%; height:100%; object-fit:cover; display:block; }

        /* ── TIPS ── */
        .tips-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
        @media (max-width:700px) { .tips-grid { grid-template-columns:1fr; } }
        .tip-card {
          background:white; border:1px solid rgba(45,106,79,0.1);
          border-radius:3px; padding:1.4rem 1.25rem;
          display:flex; gap:0.9rem; align-items:flex-start;
          transition:box-shadow 0.22s ease, transform 0.22s ease;
        }
        .tip-card:hover { box-shadow:0 6px 28px rgba(13,26,15,0.09); transform:translateY(-3px); }
        .tip-icon { font-size:1.5rem; flex-shrink:0; line-height:1; padding-top:0.1rem; }
        .tip-title {
          font-family:'Jost',sans-serif; font-size:0.73rem; font-weight:600;
          letter-spacing:0.06em; color:#0D1A0F; text-transform:uppercase;
          margin-bottom:0.45rem;
        }
        .tip-text {
          font-family:'Jost',sans-serif; font-size:0.78rem; font-weight:300;
          line-height:1.65; color:rgba(13,26,15,0.52);
        }

        /* ── MAP ── */
        .map-visual {
          width:100%; height:280px; border-radius:3px; overflow:hidden;
          background:linear-gradient(150deg,#162117,#2D6A4F);
          display:flex; align-items:center; justify-content:center;
          position:relative;
        }
        /* Faux grid lines */
        .map-visual::before {
          content:''; position:absolute; inset:0;
          background-image:
            linear-gradient(rgba(82,183,136,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(82,183,136,0.07) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .map-center { display:flex; flex-direction:column; align-items:center; gap:0.9rem; position:relative; z-index:1; }
        .map-pin {
          width:44px; height:44px;
          background:rgba(201,168,76,0.9); border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 4px 16px rgba(0,0,0,0.35);
          animation:pinBounce 2.2s ease-in-out infinite;
        }
        .map-pin::after {
          content:''; display:block; width:16px; height:16px;
          background:#162117; border-radius:50%; transform:rotate(45deg);
          margin:14px 0 0 14px;
        }
        @keyframes pinBounce {
          0%,100%{ transform:rotate(-45deg) translateY(0); }
          50%    { transform:rotate(-45deg) translateY(-7px); }
        }
        .map-place-name {
          font-family:'Cormorant Garamond',Georgia,serif;
          font-size:1.1rem; font-weight:300; color:rgba(255,255,255,0.82);
        }
        .map-coords-txt {
          font-family:monospace; font-size:0.72rem;
          color:rgba(255,255,255,0.4); letter-spacing:0.05em;
        }

        /* ── BOTTOM NAV ── */
        .bottom-nav {
          display:flex; align-items:center; justify-content:space-between;
          padding-top:2.5rem;
          border-top:1px solid rgba(45,106,79,0.12);
          margin-top:1rem;
          animation: fadeUp 0.55s 0.1s ease both;
        }
        .btn-back-bottom {
          display:inline-flex; align-items:center; gap:0.7rem;
          font-family:'Jost','DM Sans',sans-serif; font-size:0.7rem; font-weight:500;
          letter-spacing:0.18em; text-transform:uppercase;
          color:#2D6A4F; background:transparent;
          border:1px solid rgba(45,106,79,0.3); border-radius:2px;
          padding:0.65rem 1.4rem; cursor:pointer;
          transition:all 0.22s ease;
        }
        .btn-back-bottom:hover { background:#2D6A4F; color:white; border-color:#2D6A4F; }
        .btn-back-bottom:hover .arrow2 { transform:translateX(-4px); }
        .arrow2 { display:inline-block; transition:transform 0.22s ease; }
        .bottom-pv {
          font-family:'Cormorant Garamond',Georgia,serif;
          font-size:0.9rem; font-style:italic;
          color:rgba(13,26,15,0.28);
        }
      </style>

      <div class="detalle">

        <!-- TOP BAR -->
        <div class="topbar">
          <button class="btn-back" id="btn-top" aria-label="${L.back}">
            <span class="arrow">←</span> ${L.back}
          </button>
          <div class="breadcrumb">
            Costa Rica &nbsp;/&nbsp; <strong>${nombre}</strong>
          </div>
        </div>

        <!-- HERO -->
        <div class="hero">
          <div class="hero-img">
            ${portada ? `<img src="${portada}" alt="${nombre}" onerror="this.style.display='none'">` : ''}
            ${galeria.length > 1 ? `<div class="photo-badge">📸 ${galeria.length} ${L.photos}</div>` : ''}
          </div>
          <div class="hero-info">
            <div class="eyebrow">${L.dest}</div>
            <h2 class="dest-title">${nombre}</h2>
            <div class="divider"></div>
            <p class="desc">${descripcion}</p>
            <div class="acts-block">
              <div class="acts-lbl">⚡ ${L.acts}</div>
              <div class="pills">${actsHtml}</div>
            </div>
            ${d.lat && d.lng ? `
              <div class="loc-row">
                <span class="coords">📍 ${d.lat.toFixed(4)}, ${d.lng.toFixed(4)}</span>
                ${mapsUrl ? `<a class="btn-maps" href="${mapsUrl}" target="_blank" rel="noopener">🗺️ ${L.explore}</a>` : ''}
              </div>` : ''}
          </div>
        </div>

        <!-- GALLERY -->
        ${galeria.length > 0 ? `
          <div class="section" style="animation-delay:0.15s">
            <div class="sec-header"><div class="sec-lbl">📸 ${L.gallery}</div></div>
            <galeria-imagenes
              imagenes='${JSON.stringify(galeria).replace(/'/g,"&#39;")}'
              nombre="${nombre}">
            </galeria-imagenes>
            ${galeria.length > 1 ? `
              <div class="thumbs" id="thumbs-row">
                ${galeria.map((src,i) => `
                  <button class="thumb" data-idx="${i}" aria-label="Imagen ${i+1}">
                    <img src="${src}" alt="Imagen ${i+1}" loading="lazy"
                         onerror="this.parentElement.style.display='none'">
                  </button>`).join('')}
              </div>` : ''}
          </div>` : ''}

        <!-- TIPS -->
        <div class="section" style="animation-delay:0.25s">
          <div class="sec-header"><div class="sec-lbl">💡 ${L.tips}</div></div>
          <div class="tips-grid">${tipsHtml}</div>
        </div>

        <!-- VIDEO -->
        ${video ? `
          <div class="section" style="animation-delay:0.32s">
            <div class="sec-header"><div class="sec-lbl">🎬 ${L.video}</div></div>
            <video-destino src="${video}" label="${nombre}" lang="${lang}"></video-destino>
          </div>` : ''}

        <!-- MAP -->
        ${d.lat && d.lng ? `
          <div class="section" style="animation-delay:0.38s">
            <div class="sec-header"><div class="sec-lbl">🧭 ${L.coords}</div></div>
            <div class="map-visual">
              <div class="map-center">
                <div class="map-pin"></div>
                <div class="map-place-name">${nombre}</div>
                <div class="map-coords-txt">${d.lat.toFixed(4)}° N &nbsp;·&nbsp; ${Math.abs(d.lng).toFixed(4)}° O</div>
                ${mapsUrl ? `<a class="btn-maps" href="${mapsUrl}" target="_blank" rel="noopener" style="margin-top:0.25rem">🗺️ ${L.explore}</a>` : ''}
              </div>
            </div>
          </div>` : ''}

        <!-- BOTTOM NAV -->
        <div class="bottom-nav">
          <button class="btn-back-bottom" id="btn-bottom">
            <span class="arrow2">←</span> ${L.back}
          </button>
          <span class="bottom-pv">${L.pv}</span>
        </div>

      </div>
    `;

    // Events
    const fire = () => this.dispatchEvent(
      new CustomEvent('back-to-provincia', { bubbles: true, composed: true })
    );
    this.shadowRoot.getElementById('btn-top').addEventListener('click', fire);
    this.shadowRoot.getElementById('btn-bottom').addEventListener('click', fire);

    // Thumbnail → galería sync
    this.shadowRoot.querySelectorAll('.thumb').forEach(btn => {
      btn.addEventListener('click', () => {
        const gal = this.shadowRoot.querySelector('galeria-imagenes');
        if (gal) gal._goto(parseInt(btn.dataset.idx));
      });
    });
  }
}

customElements.define('destino-detalle', DestinoDetalle);
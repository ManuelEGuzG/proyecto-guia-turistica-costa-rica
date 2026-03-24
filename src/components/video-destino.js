/**
 * <video-destino> — Web Component
 * Reproductor de video personalizado con controles
 * IF7102 Multimedios | UCR
 */

class VideoDestino extends HTMLElement {
  static get observedAttributes() {
    return ['src', 'poster', 'label', 'lang'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._playing = false;
    this._muted   = false;
  }

  connectedCallback() { this._render(); }
  attributeChangedCallback(o, ov, nv) { if (ov !== nv) this._render(); }

  _render() {
    const src    = this.getAttribute('src') || '';
    const poster = this.getAttribute('poster') || '';
    const label  = this.getAttribute('label') || 'Video';
    const lang   = this.getAttribute('lang') || 'es';

    const playLabel  = lang === 'en' ? 'Play video' : 'Reproducir video';
    const labelText  = lang === 'en' ? 'Destination Video' : 'Video del Destino';

    if (!src) {
      this.shadowRoot.innerHTML = `<style>:host{display:none}</style>`;
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; width: 100%; }

        .video-wrap {
          position: relative;
          width: 100%;
          border-radius: 16px;
          overflow: hidden;
          background: #0a1a10;
          box-shadow: 0 8px 32px rgba(27,67,50,0.3);
        }

        video {
          width: 100%;
          display: block;
          aspect-ratio: 16/9;
          object-fit: cover;
        }

        .controls {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 1rem;
          background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transition: opacity 0.3s ease;
        }

        .video-wrap:not(:hover) .controls {
          opacity: 0;
        }

        .video-wrap:hover .controls,
        .video-wrap.paused .controls {
          opacity: 1;
        }

        .btn-play {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: rgba(82,183,136,0.9);
          border: none;
          color: white;
          font-size: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s ease, transform 0.2s ease;
        }

        .btn-play:hover {
          background: rgba(64,145,108,1);
          transform: scale(1.08);
        }

        .progress-wrap {
          flex: 1;
          height: 4px;
          background: rgba(255,255,255,0.25);
          border-radius: 2px;
          cursor: pointer;
          position: relative;
        }

        .progress-bar {
          height: 100%;
          background: #52B788;
          border-radius: 2px;
          width: 0%;
          transition: width 0.1s linear;
          pointer-events: none;
        }

        .time {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          color: rgba(255,255,255,0.85);
          white-space: nowrap;
          min-width: 64px;
          text-align: right;
        }

        .btn-mute {
          background: none;
          border: none;
          color: rgba(255,255,255,0.8);
          font-size: 1rem;
          cursor: pointer;
          padding: 4px;
          flex-shrink: 0;
          transition: color 0.2s ease;
        }

        .btn-mute:hover { color: #74C69D; }

        /* Big play button overlay */
        .play-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.3s ease;
        }

        .play-overlay:hover { background: rgba(0,0,0,0.1); }

        .play-big {
          width: 72px;
          height: 72px;
          background: rgba(82,183,136,0.9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          transition: transform 0.2s ease, background 0.2s ease;
          box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        }

        .play-overlay:hover .play-big {
          transform: scale(1.1);
          background: rgba(64,145,108,0.95);
        }

        .play-overlay.hidden { display: none; }

        .video-label {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(27,67,50,0.8);
          color: #74C69D;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 999px;
          backdrop-filter: blur(6px);
          pointer-events: none;
        }
      </style>

      <div class="video-wrap paused" id="wrap">
        <video
          id="vid"
          ${poster ? `poster="${poster}"` : ''}
          preload="metadata"
          aria-label="${label}"
          playsinline
        >
          <source src="${src}" type="video/mp4">
          Tu navegador no soporta video HTML5.
        </video>

        <div class="video-label">▶ ${labelText}</div>

        <div class="play-overlay" id="overlay" aria-label="${playLabel}">
          <div class="play-big">▶</div>
        </div>

        <div class="controls">
          <button class="btn-play" id="btn-play" aria-label="${playLabel}">▶</button>
          <div class="progress-wrap" id="progress-wrap">
            <div class="progress-bar" id="progress-bar"></div>
          </div>
          <span class="time" id="time">0:00 / 0:00</span>
          <button class="btn-mute" id="btn-mute" aria-label="Silenciar/Activar sonido">🔊</button>
        </div>
      </div>
    `;

    this._bindVideoEvents();
  }

  _bindVideoEvents() {
    const root       = this.shadowRoot;
    const vid        = root.getElementById('vid');
    const btnPlay    = root.getElementById('btn-play');
    const overlay    = root.getElementById('overlay');
    const wrap       = root.getElementById('wrap');
    const progressW  = root.getElementById('progress-wrap');
    const progressB  = root.getElementById('progress-bar');
    const timeEl     = root.getElementById('time');
    const btnMute    = root.getElementById('btn-mute');

    const fmt = t => {
      const m = Math.floor(t / 60);
      const s = Math.floor(t % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    };

    const toggle = () => {
      if (vid.paused) {
        vid.play();
        btnPlay.textContent = '⏸';
        overlay.classList.add('hidden');
        wrap.classList.remove('paused');
      } else {
        vid.pause();
        btnPlay.textContent = '▶';
        overlay.classList.remove('hidden');
        wrap.classList.add('paused');
      }
    };

    btnPlay.addEventListener('click', toggle);
    overlay.addEventListener('click', toggle);

    vid.addEventListener('timeupdate', () => {
      if (!vid.duration) return;
      const pct = (vid.currentTime / vid.duration) * 100;
      progressB.style.width = `${pct}%`;
      timeEl.textContent = `${fmt(vid.currentTime)} / ${fmt(vid.duration)}`;
    });

    vid.addEventListener('ended', () => {
      btnPlay.textContent = '▶';
      overlay.classList.remove('hidden');
      wrap.classList.add('paused');
    });

    progressW.addEventListener('click', e => {
      const rect = progressW.getBoundingClientRect();
      const pct  = (e.clientX - rect.left) / rect.width;
      vid.currentTime = pct * vid.duration;
    });

    btnMute.addEventListener('click', () => {
      vid.muted = !vid.muted;
      btnMute.textContent = vid.muted ? '🔇' : '🔊';
    });

    vid.addEventListener('loadedmetadata', () => {
      timeEl.textContent = `0:00 / ${fmt(vid.duration)}`;
    });
  }
}

customElements.define('video-destino', VideoDestino);
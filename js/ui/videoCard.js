import { escapeHTML } from '../utils.js';
import { renderEmpty } from './feedback.js';

/** muestro un aviso si el video no existe. */
export function createVideoCard(video) {
  const card = document.createElement('article');
  card.className = 'video-card';

  const tag = video.tag || video.season;
  const src = video.src.includes('#') ? video.src : `${video.src}#t=0.5`;

  card.innerHTML = `
    <div class="vc-media">
      <video controls preload="metadata" playsinline
        ${video.poster ? `poster="${escapeHTML(video.poster)}"` : ''}
        src="${escapeHTML(src)}"
        aria-label="${escapeHTML(video.title)}"></video>
      <div class="vc-error" hidden>
        <strong>no se encontro el video</strong>
        <span><code>${escapeHTML(video.src)}</code></span>
      </div>
    </div>
    <div class="vc-body">
      ${tag ? `<span class="chip chip-static">${escapeHTML(tag)}</span>` : ''}
      <h3>${escapeHTML(video.title)}</h3>
      <p>${escapeHTML(video.description)}</p>
    </div>`;

  const player = card.querySelector('video');
  player.addEventListener('error', () => {
    player.hidden = true;
    card.querySelector('.vc-error').hidden = false;
  });

  return card;
}

export function renderVideoGrid(container, videos) {
  container.replaceChildren();

  if (!videos.length) {
    renderEmpty(container, { icon: '🎬', title: 'no hay videos en esta seccion' });
    return;
  }

  const fragment = document.createDocumentFragment();
  videos.forEach((video) => fragment.append(createVideoCard(video)));
  container.append(fragment);

  // al reproducir un video se pausan los demas
  if (!container.dataset.playBound) {
    container.dataset.playBound = 'true';
    container.addEventListener('play', (event) => {
      container.querySelectorAll('video').forEach((player) => {
        if (player !== event.target) player.pause();
      });
    }, true);
  }
}

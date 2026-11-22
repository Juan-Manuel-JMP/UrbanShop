import { getVideos } from '../services/api.js';
import { renderVideoGrid } from '../ui/videoCard.js';
import { renderError } from '../ui/feedback.js';

export async function init() {
  const box = document.getElementById('localVideos');

  try {
    const videos = await getVideos();
    renderVideoGrid(box, videos.filter((video) => video.category === 'local'));
  } catch (error) {
    console.error(error);
    renderError(box, 'no cargaron los videos.');
  }
}

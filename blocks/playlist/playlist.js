import { decorateIcons, loadCSS } from '../../scripts/lib-franklin.js';
import { htmlToElement, decoratePlaceholders } from '../../scripts/scripts.js';
import { Playlist, LABELS } from './playlist-utils.js';

/**
 * convert seconds to time in minutes in the format of 'mm:ss'
 * @param {string} seconds
 */
function toTimeInMinutes(seconds) {
  const secondsNumber = parseInt(seconds, 10);
  const minutes = Math.floor(secondsNumber / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

/**
 * Update the query string parameter with the given key and value
 */
function updateQueryStringParameter(key, value) {
  const url = new URL(window.location.href);
  // do not update if same value
  if (url.searchParams.get(key) === value) return;
  url.searchParams.set(key, value);
  window.history.pushState({ [key]: value }, '', url);
}

/**
 * Get the query string parameter with the given key
 */
function getQueryStringParameter(key) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(key);
}

/**
 * create an icon span (to be used with decorateIcons())
 */
function iconSpan(icon) {
  return `<span class="icon icon-${icon}"></span>`;
}

/**
 * @param {Video} video
 * @param {Playlist} playlist
 * @returns {HTMLElement}
 */
function newPlayer(playlist) {
  const video = playlist.getActiveVideo();
  if (!video) return null;
  const { src, autoplay = false, title, description, transcriptUrl, currentTime = 0, thumbnailUrl } = video;
  const iframeAllowOptions = [
    'fullscreen',
    'accelerometer',
    'encrypted-media',
    'gyroscope',
    'picture-in-picture',
    'autoplay',
  ];

  const transcriptLoading = [100, 100, 100, 80, 70, 40]
    .map((i) => `<p class="loading-shimmer" style="--placeholder-width: ${i}%"></p>`)
    .join('');

  const player = htmlToElement(`
        <div class="playlist-player" data-playlist-player>
            <div class="playlist-player-video">
              <div class="playlist-player-video-overlay" style="background:url(${thumbnailUrl})">
                <button aria-label="play" class="playlist-player-video-overlay-play"><div class="playlist-player-video-overlay-circle"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" class="playlist-player-video-overlay-icon"><path d="M8 5v14l11-7z"></path> <path d="M0 0h24v24H0z" fill="none"></path></svg></div></button>
              </div>
                <template id="video-iframe-template">
                  <iframe
                      src="${src}?t=${currentTime}&autoplay=${autoplay}" 
                      autoplay="${autoplay}"
                      frameborder="0" 
                      allow="${iframeAllowOptions.join('; ')}">
                  </iframe>
                </template>
            </div>
            <div class="playlist-player-info">
                <h3 class="playlist-player-info-title">${title}</h3>
                <p class="playlist-player-info-description">${description}</p>
                <details class="playlist-player-info-transcript" data-playlist-player-info-transcript="${transcriptUrl}">
                  <summary>
                    <span data-placeholder="${LABELS.transcript}">Transcript</span>
                  </summary>
                  ${transcriptLoading}
                </details>
            </div>
        </div>
    `);

  decoratePlaceholders(player);

  const showIframe = () => {
    const iframeTemplate = player.querySelector('#video-iframe-template');
    const iframe = iframeTemplate.content.firstElementChild.cloneNode(true);
    player.querySelector('.playlist-player-video').append(iframe);
    player.querySelector('.playlist-player-video-overlay').replaceWith(iframe);
    iframeTemplate.remove();
    // wait for loaded
    iframe.addEventListener('load', () => {
      iframe.contentWindow.postMessage({ type: 'mpcAction', action: 'play' }, '*');
    });
  };

  if (autoplay) showIframe();
  else {
    player.querySelector('.playlist-player-video-overlay').addEventListener('click', () => {
      showIframe();
    });
  }
  return player;
}

/**
 * @param {HTMLElement} block
 * @param {Playlist} playlist
 */
function decoratePlaylistHeader(block, playlist) {
  const playlistSection = block.closest('.section');
  const defaultContent = playlistSection.querySelector('.default-content-wrapper');

  // set title and description
  const playlistTitleH = defaultContent.querySelector('h1, h2, h3, h4, h5, h6');
  const playlistDescriptionP = defaultContent.querySelector('p');
  playlist.title = playlistTitleH?.textContent || '';
  playlist.description = playlistDescriptionP?.textContent || '';

  defaultContent.setAttribute('data-playlist-progress-box', '');

  const playlistInfo = htmlToElement(`<div class="playlist-info">
    <b><span data-placeholder="${LABELS.playlist}">Playlist<span></b>
    <div>${iconSpan('list')} ${playlist.length} <span data-placeholder="${LABELS.tutorials}">Tutorials<span></div>
    <button data-playlist-action-button class="playlist-action-button" aria-expanded="false">⋮</button>
  </div>`);

  defaultContent.prepend(playlistInfo);

  const nowViewing = htmlToElement(`<div class="playlist-now-viewing">
    <b><span data-placeholder="${LABELS.nowViewing}">NOW VIEWING</span></b>
    <b><span class="playlist-now-viewing-count" data-playlist-now-viewing-count>${
      playlist.getActiveVideoIndex() + 1
    }</span> OF ${playlist.length}</b>
  </div>`);
  defaultContent.append(nowViewing);

  // Load actions Menu
  loadCSS('/blocks/playlist/playlist-action-menu.css');
  import('./playlist-action-menu.js').then((mod) =>
    mod.default(playlistSection.querySelector('[data-playlist-action-button]'), playlist),
  );
}

/** @param {string} transcriptUrl */
async function getCaptionParagraphs(transcriptUrl) {
  window.playlistCaptions = window.playlistCaptions || {};
  if (window.playlistCaptions[transcriptUrl]) return window.playlistCaptions[transcriptUrl];
  const response = await fetch(transcriptUrl);
  const transcriptJson = await response.json();
  const captions = transcriptJson?.captions || [];
  const paragraphs = [];
  let currentParagraph = '';
  captions.forEach(({ content, startOfParagraph }) => {
    if (startOfParagraph) {
      paragraphs.push(currentParagraph);
      currentParagraph = content;
    } else {
      currentParagraph += ` ${content}`;
    }
  });
  paragraphs.push(currentParagraph);

  window.playlistCaptions[transcriptUrl] = paragraphs;
  return paragraphs;
}

function updateTranscript(transcriptDetail) {
  const transcriptUrl = transcriptDetail.getAttribute('data-playlist-player-info-transcript');
  transcriptDetail.addEventListener('toggle', (event) => {
    if (event.target.open && transcriptDetail.dataset.ready !== 'true') {
      getCaptionParagraphs(transcriptUrl).then((paragraphs) => {
        [...transcriptDetail.querySelectorAll('p')].forEach((p) => p.remove());
        paragraphs.forEach((paragraph) => transcriptDetail.append(htmlToElement(`<p>${paragraph}</p>`)));
        transcriptDetail.dataset.ready = 'true';
      });
    }
  });
}

/**
 * Shows the video at the given count
 * @param {import('./mpc-util.js').Video} video
 */
function updatePlayer(playlist) {
  const video = playlist.getActiveVideo();
  if (!video) return;
  const exisatingPlayer = document.querySelector('[data-playlist-player]');
  if (exisatingPlayer?.querySelector('iframe')?.src?.startsWith(video.src)) return;
  const player = newPlayer(playlist);
  if (!player) return;
  const playerContainer = document.querySelector('[data-playlist-player-container]');
  const transcriptDetail = player.querySelector('[data-playlist-player-info-transcript]');
  updateTranscript(transcriptDetail);
  playerContainer.innerHTML = '';
  playerContainer.append(player);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 *
 * @param {number} videoIndex
 * @param {import('./mpc-util.js').Video} video
 * @param {import('./mpc-util.js').Playlist} playlist
 */
function updateProgress(videoIndex, playlist) {
  const { el, currentTime, duration, completed } = playlist.getVideo(videoIndex);
  // now viewing count
  const nowViewingCount = document.querySelector('[data-playlist-now-viewing-count]');
  if (nowViewingCount) nowViewingCount.textContent = parseInt(videoIndex, 10) + 1;
  // progress bar
  const progressBox = el.querySelector('[data-playlist-item-progress-box]');
  progressBox.style.setProperty('--playlist-item-progress', `${((currentTime || 0) / duration) * 100}%`);

  // update overall progress
  const playlistProgressBox = document.querySelector('[data-playlist-progress-box]');
  const completedVideos = playlist.getVideos().filter((v) => v.currentTime >= v.duration - 1).length;
  playlistProgressBox.style.setProperty('--playlist-progress', `${(completedVideos / playlist.length) * 100}%`);

  // update completed status - completed means a vides has been watched till the end, at-least once.
  if (currentTime >= duration - 1 && !completed) {
    playlist.updateVideoByIndex(videoIndex, { completed: true });
  }

  let progressStatus;
  if (completed) {
    progressStatus = 'completed';
  } else if (currentTime >= duration - 1) {
    progressStatus = 'not-started';
  } else {
    progressStatus = 'in-progress';
  }
  [...el.querySelectorAll('[data-progress-status]')].forEach((status) => {
    status.style.display = 'none';
    if (status.getAttribute('data-progress-status') === progressStatus) {
      status.style.display = 'block';
    }
  });
}

const playlist = new Playlist();
playlist.onVideoChange((videos, vIndex) => {
  const currentVideo = videos[vIndex];
  const { active = false, el } = currentVideo;
  const activeStatusChanged = currentVideo.active !== currentVideo?.el?.classList?.contains('active');
  el.classList.toggle('active', active);
  if (active && activeStatusChanged) el.parentElement.scrollTop = el.offsetTop - el.clientHeight / 2;
  updatePlayer(playlist);
  updateQueryStringParameter('video', playlist.getActiveVideoIndex());
  updateProgress(vIndex, playlist);
  return true;
});

/**
 * @param {HTMLElement} block
 */
export default function decorate(block) {
  const main = document.querySelector('main');
  main.classList.add('playlist-page');
  const playlistSection = block.closest('.section');
  const playerContainer = htmlToElement(`<div class="playlist-player-container" data-playlist-player-container></div>`);
  playlistSection.parentElement.prepend(playerContainer);

  const playlistOptions = htmlToElement(`<div class="playlist-options">
    <div class="playlist-options-autoplay">
        <input type="checkbox" id="playlist-options-autoplay" checked=${playlist?.options?.autoplayNext || true}>
        <label for="playlist-options-autoplay">
          <span data-placeholder="${LABELS.autoPlayNextVideo}">Auto Play Next Video</span>
        </label>
    </div>
  </div>`);
  // bottom options
  block.parentElement.append(playlistOptions);

  document.querySelector('#playlist-options-autoplay').addEventListener('change', (event) => {
    playlist.updateOptions({ autoplayNext: event.target.checked });
  });

  const activeVideoIndex = getQueryStringParameter('video') || 0;

  decoratePlaylistHeader(block, playlist);

  [...block.children].forEach((videoRow, videoIndex) => {
    videoRow.classList.add('playlist-item');
    const [videoCell, videoDataCell, jsonLdCell] = videoRow.children;
    videoCell.classList.add('playlist-item-thumbnail');
    videoCell.setAttribute('data-playlist-item-progress-box', '');
    videoDataCell.classList.add('playlist-item-content');

    const [srcP, pictureP] = videoCell.children;
    const [titleH, descriptionP, durationP, transcriptP] = videoDataCell.children;
    titleH.classList.add('playlist-item-title');
    const { src } = pictureP.querySelector('img');
    pictureP.replaceWith(...pictureP.childNodes);

    const video = {
      src: srcP.textContent,
      title: titleH.textContent,
      description: descriptionP.textContent,
      duration: durationP.textContent,
      transcriptUrl: transcriptP.textContent,
      thumbnailUrl: src,
      el: videoRow,
    };

    // remove elements that don't need to show here.
    srcP.remove();
    descriptionP.remove();
    durationP.remove();
    transcriptP.remove();

    jsonLdCell?.replaceWith(htmlToElement(`<script type="application/ld+json">${jsonLdCell.textContent}</script>`));

    // item bottom status
    videoDataCell.append(
      htmlToElement(`<div class="playlist-item-meta">
              <div data-progress-status="not-started"></div>
              <div data-progress-status="in-progress">${iconSpan('check')} In Progress</div>
              <div data-progress-status="completed">${iconSpan('check-filled')} Completed</div>
              <div>${iconSpan('time')} ${toTimeInMinutes(video.duration)} MIN</div>
          </div>`),
    );

    videoRow.addEventListener('click', () => {
      playlist.activateVideoByIndex(videoIndex);
    });

    // always do this at the end.
    playlist.updateVideoByIndex(videoIndex, video);
  });

  decorateIcons(playlistSection);
  decoratePlaceholders(playlistSection);
  playlist.activateVideoByIndex(activeVideoIndex);

  // // handle browser back within history changes
  // window.addEventListener('popstate', (event) => {
  //   if (event.state?.video) {
  //     playlist.activateVideoByIndex(event.state.video);
  //   }
  // });
}

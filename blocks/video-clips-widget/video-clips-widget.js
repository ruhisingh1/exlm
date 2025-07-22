import { fetchLanguagePlaceholders, htmlToElement } from '../../scripts/scripts.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

function openVideoModal(block, placeholders, videoUrl, sourceUrl, sourcePageTitle) {
  document.body.style.overflow = 'hidden';

  let modal = block.querySelector('.video-modal-wrapper');
  let iframeContainer;

  if (!modal) {
    modal = document.createElement('div');
    modal.classList.add('video-modal-wrapper');

    const modalContent = document.createElement('div');
    modalContent.classList.add('video-modal-container');

    const closeBtn = document.createElement('span');
    closeBtn.classList.add('icon', 'icon-close-black');
    closeBtn.addEventListener('click', () => {
      document.body.style.overflow = '';
      modal.style.display = 'none';
      if (iframeContainer) iframeContainer.innerHTML = '';
    });

    iframeContainer = document.createElement('div');
    iframeContainer.classList.add('video-modal');

    modalContent.appendChild(closeBtn);
    modalContent.appendChild(iframeContainer);
    modal.appendChild(modalContent);
    decorateIcons(modal);
    block.appendChild(modal);
  } else {
    iframeContainer = modal.querySelector('.video-modal');
    modal.style.display = 'flex';
  }

  if (iframeContainer && videoUrl) {
    iframeContainer.innerHTML = `<iframe src="${videoUrl}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
    iframeContainer.appendChild(
      htmlToElement(`<div class="video-meta">
          <p class="clipped-from">${placeholders?.clippedFrom || 'Clipped from'} <em>${sourcePageTitle}</em></p>
          <a class="watch-full-video" href="${sourceUrl}" target="_blank" rel="noopener noreferrer">${
            placeholders?.watchFullVideo || 'Watch full video'
          }</a>
        </div>`),
    );
  }
}

export default async function decorate(block) {
  const UEAuthorMode = window.hlx.aemRoot || window.location.href.includes('.html');
  let placeholders = {};
  try {
    placeholders = await fetchLanguagePlaceholders();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching placeholders:', err);
  }

  const ul = document.createElement('ul');
  ul.classList.add('video-list');

  [...block.children].forEach((column) => {

    const [videoTitleEl, videoUrlEl, sourceUrlEl, sourceTitleEl] = column.children;
    const title = videoTitleEl?.textContent?.trim();
    const videoUrl = videoUrlEl?.querySelector('a')?.href;
    const sourceUrl = sourceUrlEl?.querySelector('a')?.href;
    const sourcePageTitle = sourceTitleEl?.textContent?.trim();

    if (!title || !videoUrl || !sourceUrl) return;

    const id = title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');

    const li = htmlToElement(`
      <li>
        <a id="${id}" class="video-modal-trigger" href="#">${title}</a>
      </li>
    `);

    li.querySelector('a').addEventListener('click', (e) => {
      e.preventDefault();
      openVideoModal(block, placeholders, videoUrl, sourceUrl, sourcePageTitle);
    });

    ul.appendChild(li);
  });

  // Check for block heading in first row
  const firstRow = block.children[0];
  const heading = firstRow?.children[0];

  // Clone original content and append heading + list
  const originalContent = [...block.children].map((child) => child.cloneNode(true));
  
  // In author mode, hide original content; in non-author mode, exclude it
  const contentToKeep = [];
  
  if (UEAuthorMode) {
    originalContent.forEach((child) => {
      child.style.display = 'none';
    });
    contentToKeep.push(...originalContent);
  }
  
  if (heading) {
    contentToKeep.push(heading);
  }
  contentToKeep.push(ul);
  
  block.replaceChildren(...contentToKeep);
}

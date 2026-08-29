import { decorateIcons } from '../../scripts/lib-franklin.js';

function buildHeader(rows) {
  const [eyebrowRow, titleRow, descRow] = rows;
  const hasEyebrow = eyebrowRow?.textContent.trim();
  const hasTitle = titleRow?.textContent.trim();
  const hasDesc = descRow?.textContent.trim();

  if (!hasEyebrow && !hasTitle && !hasDesc) return null;

  const header = document.createElement('div');
  header.classList.add('video-podcast-header', 'block-header');

  if (hasEyebrow) {
    eyebrowRow.classList.add('video-podcast-eyebrow');
    header.appendChild(eyebrowRow);
  }
  if (hasTitle) {
    const heading = document.createElement('h2');
    heading.classList.add('video-podcast-title', 'h1');
    heading.innerHTML = titleRow.textContent;
    header.appendChild(heading);
  }
  if (hasDesc) {
    descRow.classList.add('video-podcast-description');
    header.appendChild(descRow);
  }
  return header;
}

function decorateButton(cell, ...classes) {
  const anchor = cell?.querySelector('a');
  if (!anchor?.href) return null;
  anchor.classList.add('button', ...classes);
  return anchor;
}

function buildFeatured(row) {
  const [imageCell, titleCell, descCell, ctaCell] = row.children;
  const card = document.createElement('div');
  card.classList.add('video-podcast-featured', 'glass-bg');

  const picture = imageCell?.querySelector('picture');
  if (picture) {
    picture.classList.add('video-podcast-featured-image');
    card.appendChild(picture);
  }

  const body = document.createElement('div');
  body.classList.add('video-podcast-featured-body');

  if (titleCell?.textContent.trim()) {
    const heading = document.createElement('h3');
    heading.classList.add('video-podcast-featured-title');
    heading.innerHTML = titleCell.textContent;
    body.appendChild(heading);
  }
  if (descCell?.textContent.trim()) {
    descCell.classList.add('video-podcast-featured-desc');
    body.appendChild(descCell);
  }

  const cta = decorateButton(ctaCell, 'accent');
  if (cta) {
    const ctaWrapper = document.createElement('div');
    ctaWrapper.classList.add('video-podcast-featured-cta');
    ctaWrapper.appendChild(cta);
    body.appendChild(ctaWrapper);
  }

  card.appendChild(body);
  return card;
}

function buildPlaylistItem(row) {
  const [imageCell, titleCell, durationCell, linkCell] = row.children;
  const item = document.createElement('div');
  item.classList.add('video-podcast-item');

  const thumb = document.createElement('div');
  thumb.classList.add('video-podcast-item-thumb');
  const picture = imageCell?.querySelector('picture');
  if (picture) thumb.appendChild(picture);

  const durationText = durationCell?.textContent.trim();
  if (durationText) {
    const duration = document.createElement('span');
    duration.classList.add('video-podcast-item-duration');
    duration.textContent = durationText;
    thumb.appendChild(duration);
  }

  const title = document.createElement('h3');
  title.classList.add('video-podcast-item-title');
  title.innerHTML = titleCell?.textContent ?? '';

  const anchor = linkCell?.querySelector('a');
  if (anchor?.href) {
    anchor.textContent = '';
    anchor.classList.add('video-podcast-item-link');
    anchor.append(thumb, title);
    item.appendChild(anchor);
  } else {
    item.append(thumb, title);
  }
  return item;
}

export default function decorate(block) {
  const rows = [...block.children];
  const pictureRows = rows.filter((row) => row.querySelector('picture'));
  const firstPic = rows.indexOf(pictureRows[0]);
  const lastPic = rows.indexOf(pictureRows[pictureRows.length - 1]);

  const headerRows = firstPic > 0 ? rows.slice(0, firstPic) : [];
  const featuredRow = rows[firstPic];
  const playlistRows = rows.slice(firstPic + 1, lastPic + 1);
  const trailingRows = rows.slice(lastPic + 1);

  const header = buildHeader(headerRows);

  const columns = document.createElement('div');
  columns.classList.add('video-podcast-columns');

  columns.appendChild(buildFeatured(featuredRow));

  const playlist = document.createElement('div');
  playlist.classList.add('video-podcast-playlist');
  playlistRows.forEach((row) => {
    playlist.appendChild(buildPlaylistItem(row));
    const divider = document.createElement('hr');
    divider.classList.add('video-podcast-divider');
    playlist.appendChild(divider);
  });

  const seeMore = decorateButton(trailingRows.find((row) => row.querySelector('a')), 'outline');
  if (seeMore) {
    const seeMoreWrapper = document.createElement('div');
    seeMoreWrapper.classList.add('video-podcast-see-more');
    seeMoreWrapper.appendChild(seeMore);
    playlist.appendChild(seeMoreWrapper);
  }

  columns.appendChild(playlist);

  block.textContent = '';
  if (header) block.appendChild(header);
  block.appendChild(columns);

  decorateIcons(block);
}

import { decorateIcons } from '../../scripts/lib-franklin.js';

const CATEGORY_RE = /#([\w-]+)/g;

// Pulls `#tag` tokens out of the description text and returns the cleaned text
// plus the list of categories authored for the item.
function extractCategories(descCell) {
  const categories = [];
  const raw = descCell.textContent;
  let match = CATEGORY_RE.exec(raw);
  while (match) {
    categories.push(match[1].toLowerCase());
    match = CATEGORY_RE.exec(raw);
  }

  if (categories.length) {
    descCell.querySelectorAll('p, li').forEach((node) => {
      // Remove each `#tag` along with any trailing comma/whitespace separators.
      node.innerHTML = node.innerHTML.replace(/#[\w-]+\s*,?\s*/g, '').trim();
      if (!node.textContent.trim()) node.remove();
    });
  }

  return categories;
}

function buildHeader(block, rows) {
  const [eyebrowRow, titleRow, descRow] = rows;
  const hasEyebrow = eyebrowRow?.textContent.trim();
  const hasTitle = titleRow?.textContent.trim();
  const hasDesc = descRow?.textContent.trim();

  if (!hasEyebrow && !hasTitle && !hasDesc) {
    rows.forEach((row) => row?.remove());
    return;
  }

  const headerDiv = document.createElement('div');
  headerDiv.classList.add('portfolios-header', 'block-header');

  if (hasEyebrow) {
    eyebrowRow.classList.add('portfolios-eyebrow');
    headerDiv.appendChild(eyebrowRow);
  } else {
    eyebrowRow?.remove();
  }

  if (hasTitle) {
    const heading = document.createElement('h2');
    heading.classList.add('portfolios-title', 'h1');
    heading.innerHTML = titleRow.textContent;
    titleRow.replaceWith(heading);
    headerDiv.appendChild(heading);
  } else {
    titleRow?.remove();
  }

  if (hasDesc) {
    descRow.classList.add('portfolios-description');
    headerDiv.appendChild(descRow);
  } else {
    descRow?.remove();
  }

  block.prepend(headerDiv);
}

function trackClick(block, anchor, title, index) {
  anchor.addEventListener('click', async () => {
    const { pushComponentClick, generateComponentID } = await import('../../scripts/analytics/lib-analytics.js');
    const componentID = generateComponentID(block, 'portfolios');
    const section = block.closest('.section');
    const sectionID = section?.dataset?.sectionId;

    const data = {
      component: 'portfolios',
      componentID,
      linkTitle: title,
      linkType: title,
      destinationDomain: anchor.href,
      position: index + 1,
    };
    if (sectionID) data.sectionID = sectionID;
    pushComponentClick(data);
  });
}

function buildFilterBar(block, cardsContainer, categories) {
  if (!categories.size) return;

  const filterBar = document.createElement('div');
  filterBar.classList.add('portfolios-filters');
  filterBar.setAttribute('role', 'group');
  filterBar.setAttribute('aria-label', 'Filter portfolios by category');

  const makeButton = (label, value, active) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.classList.add('portfolios-filter');
    btn.textContent = label;
    btn.dataset.filter = value;
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    if (active) btn.classList.add('is-active');
    return btn;
  };

  filterBar.appendChild(makeButton('All', 'all', true));
  [...categories].sort().forEach((cat) => {
    filterBar.appendChild(makeButton(cat, cat, false));
  });

  filterBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.portfolios-filter');
    if (!btn) return;

    filterBar.querySelectorAll('.portfolios-filter').forEach((b) => {
      const isActive = b === btn;
      b.classList.toggle('is-active', isActive);
      b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    const { filter } = btn.dataset;
    cardsContainer.querySelectorAll('.portfolios-card').forEach((card) => {
      const cats = (card.dataset.categories || '').split(' ');
      card.hidden = filter !== 'all' && !cats.includes(filter);
    });
  });

  block.insertBefore(filterBar, cardsContainer);
}

export default function decorate(block) {
  const rows = [...block.children];

  // Item rows contain a picture in the first cell; anything before them is header content.
  const firstItemIndex = rows.findIndex((row) => row.querySelector(':scope > div picture'));
  const headerRows = firstItemIndex > 0 ? rows.slice(0, firstItemIndex) : [];
  const itemRows = firstItemIndex >= 0 ? rows.slice(firstItemIndex) : rows;

  const cardsContainer = document.createElement('div');
  cardsContainer.classList.add('portfolios-grid');

  const allCategories = new Set();

  itemRows.forEach((row, index) => {
    const [imageCell, titleCell, descCell, ctaCell] = row.children;
    const picture = imageCell?.querySelector('picture');
    const categories = descCell ? extractCategories(descCell) : [];
    categories.forEach((cat) => allCategories.add(cat));

    row.classList.add('portfolios-card', 'glass-bg');
    row.dataset.cardPosition = index + 1;
    if (categories.length) row.dataset.categories = categories.join(' ');

    const heading = document.createElement('h3');
    heading.classList.add('portfolios-card-title');
    heading.innerHTML = titleCell?.textContent ?? '';

    const content = document.createElement('div');
    content.classList.add('portfolios-card-content');
    content.append(heading);
    if (descCell) {
      descCell.classList.add('portfolios-card-description');
      content.append(descCell);
    }

    row.textContent = '';

    const anchor = ctaCell?.querySelector('a');
    if (anchor?.href) {
      anchor.textContent = '';
      anchor.classList.add('portfolios-card-link');
      if (picture) anchor.appendChild(picture);
      anchor.appendChild(content);
      row.appendChild(anchor);
      trackClick(block, anchor, heading.textContent.trim(), index);
    } else {
      if (picture) row.appendChild(picture);
      row.appendChild(content);
    }

    cardsContainer.appendChild(row);
  });

  buildHeader(block, headerRows);
  block.appendChild(cardsContainer);
  buildFilterBar(block, cardsContainer, allCategories);

  decorateIcons(block);
}

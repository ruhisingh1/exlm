import BrowseCardsDelegate from '../../scripts/browse-card/browse-cards-delegate.js';
import { htmlToElement } from '../../scripts/scripts.js';
import { buildCard } from '../../scripts/browse-card/browse-card.js';
import BrowseCardShimmer from '../../scripts/browse-card/browse-card-shimmer.js';
import { COVEO_SORT_OPTIONS } from '../../scripts/browse-card/browse-cards-constants.js';
import { extractCapability, removeProductDuplicates } from '../../scripts/browse-card/browse-card-utils.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';
/**
 * Decorate function to process and log the mapped data.
 * @param {HTMLElement} block - The block of data to process.
 */
export default async function decorate(block) {
  // Extracting elements from the block
  const [headingElement, toolTipElement, linkElement, ...configs] = [...block.children].map(
    (row) => row.firstElementChild,
  );
  const [contentType, capabilities, role, level, authorType, sortBy] = configs.map((cell) =>
    cell.textContent.trim(),
  );
  const sortCriteria = COVEO_SORT_OPTIONS[sortBy?.toUpperCase() ?? 'RELEVANCE'];
  const noOfResults = 4;
  const { products, features, versions } = extractCapability(capabilities);

  // Clearing the block's content
  block.innerHTML = '';
  block.classList.add('browse-cards-block');

  const headerDiv = htmlToElement(`
    <div class="browse-cards-block-header">
      <div class="browse-cards-block-title">
        ${headingElement.innerHTML}
      </div>
      <div class="browse-cards-block-view">${linkElement.innerHTML}</div>
    </div>
  `);

  if (toolTipElement?.textContent?.trim()) {
    const tooltip = htmlToElement(`
    <div class="tooltip-placeholder">
    <div class="tooltip tooltip-right">
      <span class="icon icon-info"></span><span class="tooltip-text">${toolTipElement.textContent.trim()}</span>
    </div>
    </div>
  `);
    decorateIcons(tooltip);
    headerDiv.querySelector('h1,h2,h3,h4,h5,h6')?.insertAdjacentElement('afterend', tooltip);
  }

  // Appending header div to the block
  block.appendChild(headerDiv);

  const param = {
    contentType: contentType && contentType.toLowerCase().split(','),
    product: products.length ? removeProductDuplicates(products) : null,
    feature: features.length ? [...new Set(features)] : null,
    version: versions.length ? [...new Set(versions)] : null,
    role: role && role.toLowerCase().split(','),
    level: level && level.toLowerCase().split(','),
    authorType: authorType && authorType.split(','),
    sortCriteria,
    noOfResults,
    context: {
      interests: userInterests.length ? userInterests : null,
      role: userRole.length ? userRole : null,
      solutionLevels: userExpLevel.length ? userExpLevel : null,
    },
  };

  const buildCardsShimmer = new BrowseCardShimmer();
  buildCardsShimmer.addShimmer(block);

  const browseCardsContent = BrowseCardsDelegate.fetchCardData(param);
  browseCardsContent
    .then((data) => {
      buildCardsShimmer.removeShimmer();
      if (data?.length) {
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('browse-cards-block-content');

        for (let i = 0; i < Math.min(noOfResults, data.length); i += 1) {
          const cardData = data[i];
          const cardDiv = document.createElement('div');
          buildCard(contentDiv, cardDiv, cardData);
          contentDiv.appendChild(cardDiv);
        }
        block.appendChild(contentDiv);
      }
    })
    .catch((err) => {
      buildCardsShimmer.removeShimmer();
      /* eslint-disable-next-line no-console */
      console.error(err);
    });
}

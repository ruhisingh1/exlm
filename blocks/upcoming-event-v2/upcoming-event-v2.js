import BrowseCardsDelegate from '../../scripts/browse-card/browse-cards-delegate.js';
import { fetchLanguagePlaceholders, htmlToElement } from '../../scripts/scripts.js';
import { buildCard } from '../../scripts/browse-card/browse-card.js';
import BrowseCardShimmer from '../../scripts/browse-card/browse-card-shimmer.js';
import { CONTENT_TYPES } from '../../scripts/data-service/coveo/coveo-exl-pipeline-constants.js';
import BrowseCardViewSwitcher from '../../scripts/browse-card/browse-cards-view-switcher.js';
import { loadCSS } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  let placeholders = {};
  try {
    placeholders = await fetchLanguagePlaceholders();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching placeholders:', err);
  }

  const [headingElement, descriptionElement] = [...block.children].map((row) => row.firstElementChild);

  // Clear the block content
  block.innerHTML = '';
  block.classList.add('upcoming-event-block');
  block.classList.add('browse-cards-block');

  const headerDiv = htmlToElement(`
    <div class="browse-cards-block-header">
      <div class="browse-cards-block-title">
        ${headingElement?.innerHTML || ''}
      </div>
      <div class="browse-card-description-text">
        ${descriptionElement?.innerHTML || ''}
      </div>
    </div>
  `);

  block.appendChild(headerDiv);

  // Create and initialize the view switcher
  BrowseCardViewSwitcher.create({ block }).then((viewSwitcher) => {
    viewSwitcher.appendTo(headerDiv);
  });

  await loadCSS(`${window.hlx.codeBasePath}/scripts/browse-card/browse-card-upcoming-events.css`);

  const contentDiv = document.createElement('div');
  contentDiv.classList.add('browse-cards-block-content');

  const buildCardsShimmer = new BrowseCardShimmer();
  buildCardsShimmer.addShimmer(block);

  const renderNoResults = () => {
    const noResultsText =
      placeholders.noResultsTextBrowse ||
      'We are sorry, no results found matching the criteria. Try adjusting your search to view more content.';
    const noResultsMsg = htmlToElement(`<div class="event-no-results">${noResultsText}</div>`);
    contentDiv.appendChild(noResultsMsg);
    block.appendChild(contentDiv);
  };

  const parameters = {
    contentType: [CONTENT_TYPES.UPCOMING_EVENT_V2.MAPPING_KEY],
    sortCriteria: 'date ascending',
  };

  BrowseCardsDelegate.fetchCardData(parameters)
    .then((results) => {
      buildCardsShimmer.removeShimmer();

      if (!results?.length) {
        renderNoResults();
        return;
      }

      results.forEach((cardData) => {
        const cardDiv = document.createElement('div');
        buildCard(cardDiv, cardData);
        contentDiv.appendChild(cardDiv);
      });
      block.appendChild(contentDiv);
    })
    .catch((err) => {
      buildCardsShimmer.removeShimmer();
      // eslint-disable-next-line no-console
      console.error('Error loading upcoming event cards:', err);
      renderNoResults();
    });
}

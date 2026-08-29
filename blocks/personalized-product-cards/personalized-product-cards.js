import { fetchLanguagePlaceholders, htmlToElement } from '../../scripts/scripts.js';
import { buildCard, buildNoResultsContent } from '../../scripts/browse-card/browse-card.js';
import BrowseCardsTargetDataAdapter from '../../scripts/browse-card/browse-cards-target-data-adapter.js';
import BrowseCardShimmer from '../../scripts/browse-card/browse-card-shimmer.js';
import defaultAdobeTargetClient from '../../scripts/adobe-target/adobe-target.js';
import { setTargetDataAsBlockAttribute } from '../../scripts/utils/analytics-utils.js';

const NUM_CARDS = 4;

export default async function decorate(block) {
  const [headingRow, descriptionRow, scopeRow] = [...block.children];
  const authoredHeading = headingRow?.firstElementChild?.innerHTML?.trim() || '';
  const authoredDescription = descriptionRow?.firstElementChild?.innerHTML?.trim() || '';
  const authoredScope = scopeRow?.firstElementChild?.textContent?.trim() || '';
  const targetScope = authoredScope || block.dataset.targetScope || '';

  let placeholders = {};
  try {
    placeholders = await fetchLanguagePlaceholders();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching placeholders:', err);
  }

  block.innerHTML = '';
  block.classList.add('browse-cards-block');

  const headerDiv = htmlToElement(`
    <div class="browse-cards-block-header personalized-product-cards-header">
      <div class="browse-cards-block-title personalized-product-cards-title">
        <h2>${authoredHeading}</h2>
      </div>
      <div class="personalized-product-cards-description">${authoredDescription}</div>
    </div>
  `);
  const titleEl = headerDiv.querySelector('.personalized-product-cards-title');
  const descriptionEl = headerDiv.querySelector('.personalized-product-cards-description');
  if (!authoredHeading) titleEl.remove();
  if (!authoredDescription) descriptionEl.remove();
  block.appendChild(headerDiv);

  const contentDiv = document.createElement('div');
  contentDiv.classList.add('browse-cards-block-content', 'personalized-product-cards-content');
  block.appendChild(contentDiv);

  const noResultsText =
    placeholders?.personalizedProductCardsNoResultsText ||
    placeholders?.noResultsText ||
    'No personalized recommendations are available right now.';

  const showNoResults = () => {
    contentDiv.innerHTML = '';
    buildNoResultsContent(contentDiv, true, noResultsText);
  };

  const renderCards = async (response) => {
    const rawResults = Array.isArray(response?.data) ? response.data : [];
    if (!rawResults.length) {
      showNoResults();
      return;
    }

    // Update header copy from Target metadata when provided.
    if (response?.meta?.heading && titleEl) {
      titleEl.querySelector('h2').innerHTML = response.meta.heading;
      if (!titleEl.isConnected) headerDiv.prepend(titleEl);
    }
    if (response?.meta?.subheading && descriptionEl) {
      descriptionEl.innerHTML = response.meta.subheading;
      if (!descriptionEl.isConnected) headerDiv.appendChild(descriptionEl);
    }
    setTargetDataAsBlockAttribute(block, response);

    const cardModels = await BrowseCardsTargetDataAdapter.mapResultsToCardsData(rawResults.slice(0, NUM_CARDS));
    if (!cardModels.length) {
      showNoResults();
      return;
    }

    contentDiv.innerHTML = '';
    const wrappers = cardModels.map((model) => {
      const cardWrapper = document.createElement('div');
      cardWrapper.classList.add('card-wrapper');
      const shimmer = new BrowseCardShimmer(1);
      shimmer.addShimmer(cardWrapper);
      contentDiv.appendChild(cardWrapper);
      return { cardWrapper, model, shimmer };
    });

    await Promise.all(
      wrappers.map(async ({ cardWrapper, model, shimmer }) => {
        const cardDiv = document.createElement('div');
        await buildCard(cardDiv, model);
        shimmer.removeShimmer();
        cardWrapper.appendChild(cardDiv);
      }),
    );
  };

  const renderFromScope = async (scope) => {
    if (!scope) {
      showNoResults();
      return;
    }
    try {
      const response = await defaultAdobeTargetClient.getTargetData(scope);
      await renderCards(response);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error rendering personalized product cards:', err);
      showNoResults();
    }
  };

  const targetSupported = await defaultAdobeTargetClient.checkTargetSupport();
  if (!targetSupported) {
    showNoResults();
    return;
  }

  renderFromScope(targetScope);
}

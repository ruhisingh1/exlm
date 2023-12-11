import { decorateIcons } from '../../scripts/lib-franklin.js';
import BrowseCardsDelegate from '../../scripts/browse-card/browse-cards-delegate.js';
import { htmlToElement, loadIms } from '../../scripts/scripts.js';
import buildCard from '../../scripts/browse-card/browse-card.js';
import CONTENT_TYPES from '../../scripts/browse-card/browse-cards-constants.js';
/**
 * Decorate function to process and log the mapped data.
 * @param {HTMLElement} block - The block of data to process.
 */
export default async function decorate(block) {
  // Extracting elements from the block
  const headingElement = block.querySelector('div:nth-child(1) > div');
  const toolTipElement = block.querySelector('div:nth-child(2) > div');
  const linkTextElement = block.querySelector('div:nth-child(3) > div > a');
  const allSolutions = block.querySelector('div:nth-child(4) > div').textContent.trim();
  const solutions = block.querySelector('div:nth-child(5) > div').textContent.trim();
  const noOfResults = 4;
  const solutionsParam = allSolutions === 'true' ? '' : solutions;
  const contentType = CONTENT_TYPES.LIVE_EVENTS.MAPPING_KEY;

  // Clearing the block's content
  block.innerHTML = '';

  const headerDiv = htmlToElement(`
    <div class="events-cards-header">
      <div class="events-cards-title">
          <h4>${headingElement?.textContent.trim()}</h4>
          <div class="tooltip">
            <span class="icon icon-info"></span><span class="tooltip-text">${toolTipElement?.textContent.trim()}</span>
          </div>
      </div>
      <div class="events-cards-view">${linkTextElement?.outerHTML}</div>
      <div>All Solutions: ${allSolutions}</div>
      <div>Solutions: ${solutions}</div>
      <div>Solutions Param: ${solutionsParam}</div>
    </div>
  `);
  // Appending header div to the block
  block.appendChild(headerDiv);

  try {
    await loadIms();
  } catch {
    // eslint-disable-next-line no-console
    console.warn('Adobe IMS not available.');
  }

  const param = {
    solutionsParam,
    noOfResults,
    contentType,
  };

  const browseCardsContent = BrowseCardsDelegate.fetchCardData(param);
  browseCardsContent.then((data) => {
    // eslint-disable-next-line no-use-before-define
    fetchFilteredCardData(data);
    if (data?.length) {
      const contentDiv = document.createElement('div');
      contentDiv.classList.add('events-cards-content');
      // eslint-disable-next-line no-use-before-define, no-param-reassign

      for (let i = 0; i < Math.min(noOfResults, data.length); i += 1) {
        const cardData = data[i];
        const cardDiv = document.createElement('div');
        buildCard(cardDiv, cardData);
        contentDiv.appendChild(cardDiv);
      }

      block.appendChild(contentDiv);
      decorateIcons(block);
    }
  });

  const fetchFilteredCardData = async (data) => {
    const eventData = data; // (your JSON data)

    // Function to filter events based on product focus
    function filterEventsByProduct(product) {
      // Check if eventList and events properties exist
      if (eventData.eventList && eventData.eventList.events) {
        return eventData.eventList.events.filter((event) => event.productFocus.includes(product));
      }
      return []; // Return an empty array if the structure is not as expected
    }

    // Example: Filtering events for "Workfront"
    const workfrontEvents = filterEventsByProduct(solutionsParam);

    return workfrontEvents;
  };
}

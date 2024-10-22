import { getConfig, fetchLanguagePlaceholders, htmlToElement } from '../../scripts/scripts.js';
import {
  handleTargetEvent,
  checkTargetSupport,
  targetDataAdapter,
  updateCopyFromTarget,
  setTargetDataAsBlockAttribute,
} from '../../scripts/target/target.js';
import BuildPlaceholder from '../../scripts/browse-card/browse-card-placeholder.js';
import { buildCard, buildNoResultsContent } from '../../scripts/browse-card/browse-card.js';
import Swiper from '../../scripts/swiper/swiper.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';

const UEAuthorMode = window.hlx.aemRoot || window.location.href.includes('.html');
const { targetCriteriaIds } = getConfig();
let placeholders = {};
let displayBlock = false;

function renderNavigationArrows(titleContainer) {
  const navigationElements = htmlToElement(`
        <div class="recently-viewed-nav-section">
            <button class="prev-nav" disabled>
                <span class="icon icon-chevron-gray"></span>
            </button>
            <button class="next-nav" disabled>
                <span class="icon icon-chevron-gray"></span>
            </button
        </div>
    `);
  decorateIcons(navigationElements);
  titleContainer.appendChild(navigationElements);
}

export default async function decorate(block) {
  try {
    placeholders = await fetchLanguagePlaceholders();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching placeholders:', err);
  }

  checkTargetSupport().then((targetSupport) => {
    const [headingElement, descriptionElement] = [...block.children].map((row) => row.firstElementChild);
    headingElement.classList.add('recently-reviewed-header');
    descriptionElement.classList.add('recently-reviewed-description');

    const titleContainer = document.createElement('div');
    const navContainer = document.createElement('div');
    const contentDiv = document.createElement('div');
    contentDiv.className = 'browse-cards-block-content';
    const buildCardsShimmer = new BuildPlaceholder();

    function appendNavAndContent() {
      navContainer.classList.add('recently-viewed-nav-container');
      navContainer.appendChild(titleContainer);
      titleContainer.appendChild(headingElement);
      titleContainer.appendChild(descriptionElement);
      renderNavigationArrows(navContainer);
      block.appendChild(navContainer);
      block.appendChild(contentDiv);
    }

    if (UEAuthorMode) {
      displayBlock = true;
      appendNavAndContent();
      buildCardsShimmer.add(block);
      const authorInfo = 'Based on profile context, if the customer has enabled the necessary cookies';
      buildNoResultsContent(contentDiv, true, authorInfo);
      buildCardsShimmer.remove();
    }

    if (targetSupport) {
      handleTargetEvent(targetCriteriaIds.recentlyViewed).then((resp) => {
        updateCopyFromTarget(resp, headingElement, descriptionElement);
        if (resp?.data.length) {
          displayBlock = true;
          appendNavAndContent();
          buildCardsShimmer.add(block);

          resp.data.forEach((item) => {
            const cardData = targetDataAdapter(item, placeholders);
            const cardDiv = document.createElement('div');
            buildCard(contentDiv, cardDiv, cardData);
            contentDiv.appendChild(cardDiv);
          });

          const prevButton = block.querySelector('.recently-viewed-nav-section > .prev-nav');
          const nextButton = block.querySelector('.recently-viewed-nav-section > .next-nav');
          const items = contentDiv.querySelectorAll('.browse-cards-block-content > div');
          // eslint-disable-next-line no-new
          new Swiper(contentDiv, items, true, null, prevButton, nextButton);
          setTargetDataAsBlockAttribute(resp, block);
        } else {
          buildNoResultsContent(contentDiv, true);
        }
        buildCardsShimmer.remove();
      });
    }
  });

  if (!UEAuthorMode && !displayBlock) {
    block.parentElement.remove();
    document.querySelectorAll('.section:not(.profile-rail-section)').forEach((element) => {
      if (element.textContent.trim() === '') {
        element.remove();
      }
    });
  }
}

/* eslint-disable no-lonely-if */
import { loadCSS } from '../../scripts/lib-franklin.js';
import { sendNotice } from '../../scripts/toast/toast.js';
import { defaultProfileClient, isSignedInUser } from '../../scripts/auth/profile.js';
import buildProductCard from '../../scripts/profile/profile-interests.js';
import eventHandler from '../../scripts/profile/profile-interests-event.js';
import { htmlToElement, fetchLanguagePlaceholders } from '../../scripts/scripts.js';

loadCSS(`${window.hlx.codeBasePath}/scripts/toast/toast.css`);

let placeholders = {};
try {
  placeholders = await fetchLanguagePlaceholders();
} catch (err) {
   // eslint-disable-next-line no-console
  console.error('Error fetching placeholders:', err);
}

export default async function decorate(block) {

  const [headingElement, descElement] = [...block.children].map((row) => row.firstElementChild);
  const headingContent = headingElement?.textContent?.trim() || '';
  const descContent = descElement?.textContent?.trim() || '';

  const styledHeader = headingElement?.firstElementChild === null ? `<h3>${headingContent}</h3>` : headingElement.innerHTML;

  block.innerHTML = '';

  const headerDiv = htmlToElement(`
    <div class="block-header">
      <div class="block-title">${styledHeader}</div>
      ${descContent !== '' ? `<div class="block-description">${descElement.innerHTML}</div>` : ''}
    </div>
  `);
  block.appendChild(headerDiv);
 
  const contentDiv = document.createElement('div');
  contentDiv.classList.add('block-cards-content');

  // Array of products with selection status
  const products = [
    { product: 'Analytics', isSelected: true },
    { product: 'Workfront', isSelected: true },
    { product: 'Target', isSelected: false },
  ];
  
  products.forEach((product) => {
    buildProductCard(block, contentDiv, product);
  });

  block.appendChild(contentDiv);

  // eventHandler();

  const isSignedIn = await isSignedInUser();
  if (isSignedIn) {
    const profileData = await defaultProfileClient.getMergedProfile();
    const solutionLevels = profileData?.solutionLevels || [];

    solutionLevels.forEach((el) => {
        const solutionName = el.split(',')[0];
        const checkBox = block.querySelector(`input[data-name="${solutionName}"]`);
        if (checkBox) {
            checkBox.checked = true;
            checkBox.closest('.profile-interest-card').classList.add('profile-interest-card--selected');
        }
    });
}

  const updatedSolutionLevels = [];
  block.querySelectorAll('.profile-interest-card').forEach((card) => {
    const checkbox = card.querySelector('input[type="checkbox"]');
    const dropdown = card.querySelector('.custom-filter-dropdown');

    checkbox.addEventListener('change', () => {
      if (isSignedIn) {
        const solution = checkbox.getAttribute('data-name');
        const level = dropdown.getAttribute('data-selected');
        const index = updatedSolutionLevels.findIndex((item) => item.solution === solution);
        if (checkbox.checked) {
          // Add or update the solution level
          if (index !== -1) {
            updatedSolutionLevels[index].level = level;
          } else {
            updatedSolutionLevels.push({ solution, level });
          }
        } else {
          // Remove the solution level if unchecked
          if (index !== -1) {
            updatedSolutionLevels.splice(index, 1);
          }
        }
        defaultProfileClient
          .updateProfile("solutionLevels", updatedSolutionLevels)
          .then(() => sendNotice(placeholders?.profileUpdated || 'Your profile changes have been saved!'))
          .catch(() => sendNotice(placeholders?.profileNotUpdated || 'Your profile changes have not been saved!'));
      }
    });
  });
}

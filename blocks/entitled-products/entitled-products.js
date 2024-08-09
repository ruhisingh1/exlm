/* eslint-disable no-lonely-if */
import { loadCSS } from '../../scripts/lib-franklin.js';
import { sendNotice } from '../../scripts/toast/toast.js';
import { defaultProfileClient, isSignedInUser } from '../../scripts/auth/profile.js';
import buildProductCard from '../../scripts/profile/profile-interests.js';
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

  const styledHeader =
    headingElement?.firstElementChild === null ? `<h3>${headingContent}</h3>` : headingElement.innerHTML;

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
}

import { decorateIcons, loadCSS } from '../lib-franklin.js';
import Dropdown from '../dropdown/dropdown.js';
import { htmlToElement, fetchLanguagePlaceholders } from '../scripts.js';
import getSolutionByName from '../../blocks/toc/toc-solutions.js';

loadCSS(`${window.hlx.codeBasePath}/scripts/profile/profile-interests.css`);
loadCSS(`${window.hlx.codeBasePath}/scripts/toast/toast.css`);

let placeholders = {};
try {
  placeholders = await fetchLanguagePlaceholders();
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('Error fetching placeholders:', err);
}

const options = [
  {
    value: 'Beginner',
    title: placeholders.profileExpLevelBeginner || 'Beginner',
  },
  {
    value: 'Intermediate',
    title: placeholders.profileExpLevelIntermediate || 'Intermediate',
  },
  {
    value: 'Advanced',
    title: placeholders.profileExpLevelExperienced || 'Experienced',
  },
];

// eslint-disable-next-line import/prefer-default-export
export default async function buildProductCard(container, element, model) {
  const { product = 'Acrobat', isSelected = false } = model;

  // Create card container
  const card = document.createElement('div');
  card.className = `profile-interest-card ${isSelected ? 'profile-interest-card--selected' : ''}`;
  const { class: solutionInfoClassName } = getSolutionByName(product);

  // Header
  const header = htmlToElement(`
        <div class="profile-interest-header">
            <div class="profile-interest-logo-wrapper">
                <span class="icon profile-interest-logo"></span>
                <span class="profile-interest-logo-text">${placeholders.myAdobeproduct || 'My Adobe product'}</span>
            </div>
            <h3>${product}</h3>
        </div>
    `);

  const iconEl = header.querySelector('span');
  iconEl.classList.add(`icon-${solutionInfoClassName}`);

  // Content
  const content = htmlToElement(`
        <div class="profile-interest-content">
            <label for="experience-level">${
              placeholders.selectYourExperienceLevel || 'Select your experience level'
            }</label>
        </div>
    `);

  // eslint-disable-next-line no-new
  new Dropdown(content, 'Beginner', options);

  // Checkbox
  const checkboxContainer = htmlToElement(`
        <div class="profile-interest-checkbox">
            <input type="checkbox" data-name="${product}">
            <label for="${product}" class="subtext">${placeholders.selectThisProduct || 'Select this product'}</label>
        </div>`);

  const checkbox = checkboxContainer.querySelector('input');
  checkbox.checked = isSelected;

  // Change handler function
  const changeHandler = () => {
    const { checked } = checkbox;
    card.classList.toggle('profile-interest-card--selected', checked);
  };

  // Click event listener for the entire card
  card.addEventListener('click', () => {
    checkbox.checked = !checkbox.checked;
    changeHandler();
  });

  // Click event listener for the checkbox
  checkbox.addEventListener('change', () => {
    changeHandler();
  });

  // Prevent checkbox click from propagating to card
  checkbox.addEventListener('click', (event) => {
    event.stopPropagation();
  });

  // Assemble card
  card.appendChild(header);
  decorateIcons(header, 'solutions/');
  card.appendChild(content);
  decorateIcons(content);
  card.appendChild(checkboxContainer);

  // Add to DOM
  element.appendChild(card);
}

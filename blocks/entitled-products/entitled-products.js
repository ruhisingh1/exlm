import { decorateIcons } from '../../scripts/lib-franklin.js';

export default async function decorate(block) {
  const entitlementsDOM = document.createRange().createContextualFragment(`
  <div class="product-card">
            <h2 class="product-title">Analytics</h2>
            <p class="product-subtitle">My Adobe product</p>
            <label for="analytics-level">Select your experience level</label>
            <select id="analytics-level" class="experience-level">
                <option value="beginner">Beginner</option>
            </select>
            <div class="select-product">
                <input type="checkbox" id="analytics-select" checked>
                <label for="analytics-select">Select this product</label>
            </div>
        </div>
  `);

  block.textContent = '';
  block.append(entitlementsDOM);
  await decorateIcons(block);
}

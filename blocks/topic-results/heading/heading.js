import { loadCSS } from '../../../scripts/lib-franklin.js';
import { htmlToElement, decoratePlaceholders } from '../../../scripts/scripts.js';

/**
 * Creates and returns a heading element for topic results.
 * This function dynamically loads a CSS file for styling the heading and constructs
 * the heading HTML structure with provided data.
 *
 * @param {Object} params - The parameters for creating the heading.
 * @param {string} params.title - The title to display in the heading.
 * @param {string} params.heading - The main heading text.
 * @param {number} params.resultCount - The number of results currently being displayed.
 * @param {number} params.resultTotal - The total number of available results.
 * @param {string} params.viewMoreResultsLabel - The label for the 'View More Results' link.
 * @param {string} params.viewMoreResultsUrl - The URL for the 'View More Results' link.
 * @returns {HTMLElement} The constructed heading element.
 */
function createHeading({
  title,
  heading,
  resultCount = '',
  resultTotal = '',
  viewMoreResultsLabel = '',
  viewMoreResultsUrl = '',
}) {
  loadCSS(`${window.hlx.codeBasePath}../blocks/topic-results/heading/heading.css`);

  return htmlToElement(`
  <div class="topics-header">
    <div class="topics-header-heading">
      <h6>${title}</h6>
      <h2>${heading}</h2>
    </div>
    <div class="topics-header-result">
      <div class="topics-header-result-count">
        <span data-placeholder="topic-results-showing">Showing</span> 
      <span class='result-count'>${resultCount}</span> 
      <span data-placeholder="topic-results-of">of</span> 
      <span class='result-count'>${resultTotal}</span> 
      <span data-placeholder="topic-results-results">results</span>
      </div>
      <div class="topics-header-result-view-more">
        <a href="${viewMoreResultsUrl}">${viewMoreResultsLabel}</a>
      </div>
    </div>
    
  </div>
`);
}
export function updateHeading(resultTotal, resultCount) {
  const resultContainer = document.querySelector('.topics-header-result-count');

  if (resultContainer) {
    resultContainer.innerHTML = `<p>
      <span data-placeholder="topic-results-showing">Showing</span> 
      <span class='result-count'>${Math.min(resultCount, resultTotal)}</span> 
      <span data-placeholder="topic-results-of">of</span> 
      <span class='result-count'>${resultTotal}</span> 
      <span data-placeholder="topic-results-results">results</span>
    </p>`;
    decoratePlaceholders(resultContainer);
  }
}

export default createHeading;

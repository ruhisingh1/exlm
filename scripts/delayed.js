// eslint-disable-next-line import/no-cycle
import { loadCSS } from './lib-franklin.js';
// eslint-disable-next-line import/no-cycle
import loadGainsight from './gainsight/gainsight.js';
import loadQualtrics from './qualtrics.js';
import { sendCoveoPageViewEvent } from './coveo-analytics.js';

// add more delayed functionality here

/**
 * Loads prism for syntax highlighting
 * @param {Document} document
 */
// eslint-disable-next-line import/prefer-default-export
export async function loadPrism(document) {
  const highlightable = document.querySelector(
    'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code',
  );
  if (!highlightable) return Promise.resolve(null); // exit, no need to load prism if nothing to highlight
  if (window.PrismLoadPromise) {
    return window.PrismLoadPromise;
  }
  // see: https://prismjs.com/docs/Prism.html#.manual
  window.Prism = window.Prism || {};
  window.Prism.manual = true;
  window.PrismLoadPromise = import('./prism.js')
    .then(() => {
      // see: https://prismjs.com/plugins/autoloader/
      window.Prism.plugins.autoloader.languages_path = '/scripts/prism-grammars/';
      // Insert button in toolbar
      window.Prism.plugins.toolbar.registerButton('toggle-wrap', (env) => {
        const button = document.createElement('button');
        const span = document.createElement('span');
        span.textContent = 'Toggle Text Wrapping';
        button.appendChild(span);
        button.addEventListener('click', () => {
          const block = env.element.parentNode;
          block.classList.toggle('code-wrap');
          window.Prism.highlightElement(env.element);
          return false;
        });
        return button;
      });
      // run prism in async mode; uses webworker.
      window.Prism.highlightAll(true);
    })
    // eslint-disable-next-line no-console
    .catch((err) => console.error(err));
  return window.PrismLoadPromise;
}

loadCSS(`${window.hlx.codeBasePath}/styles/print/print.css`);

loadPrism(document);

// disable martech if martech=off is in the query string, this is used for testing ONLY
if (window.location.search?.indexOf('martech=off') === -1) {
  loadGainsight();
  loadQualtrics();
  sendCoveoPageViewEvent();
}

window.dispatchEvent(new Event('delayed-load'));

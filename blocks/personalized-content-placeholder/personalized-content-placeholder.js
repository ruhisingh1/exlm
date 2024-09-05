import { getPathDetails, htmlToElement } from '../../scripts/scripts.js';
import { defaultProfileClient } from '../../scripts/auth/profile.js';
import { loadBlocks, decorateSections, decorateBlocks, decorateIcons } from '../../scripts/lib-franklin.js';

const fetchPageContent = async (url, loader) => {
    try {
      const response = await fetch(`${url}.plain.html`);
      if (response.ok) {
        const pageContent = await response.text();
        const container = document.createElement('div');
        container.innerHTML = pageContent;
        decorateSections(container);
        decorateBlocks(container);
        await loadBlocks(container);
        await decorateIcons(container);
        Array.from(container.children).forEach((section) => {
          loader.insertAdjacentElement('beforebegin', section);
        });
      }
    } catch (err) {
      /* eslint-disable-next-line no-console */
      console.log(err);
    }
  };

export default async function decorate(block) {
    const [completePageURL, incompletePageURL] = [...block.children].map((row) => row.querySelector('a')?.href);
    const currentSection = block.parentElement.parentElement;
        document.body.classList.add('profile-home-page');
    const loader = htmlToElement('<div class="section profile-shimmer"><span></span></div>');
    currentSection.insertAdjacentElement('beforebegin', loader);
    defaultProfileClient.getMergedProfile().then(async (profileData) => {
        if (profileData.interests.length) {
          await fetchPageContent(completePageURL, loader);
        } else {
          await fetchPageContent(incompletePageURL, loader);
        }
      });
    loader.remove();
}
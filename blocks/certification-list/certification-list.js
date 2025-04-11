import { isSignedInUser } from '../../scripts/auth/profile.js';

const certificationUrl = 'https://51837-converter-dev.adobeioruntime.net/api/v1/web/main/rockwell/certifications';

/**
 * Render a list of certifications by fetching data from a JSON file.
 * @param {HTMLElement} block - The block element where the list will be rendered.
 */
export default async function decorate(block) {
  // Extracting elements from the block
  const [headingElement, descriptionElement] = [...block.children].map((row) => row.firstElementChild);
  block.textContent = '';

  block.appendChild(headingElement);
  block.appendChild(descriptionElement);

  try {
    let res;
    if (await isSignedInUser()) {
      res = await fetch(certificationUrl, {
        headers: {
          'x-ims-token': await window.adobeIMS?.getAccessToken().token,
        },
      });
    } else {
      res = await fetch(`${certificationUrl}`);
    }
    res = await res.json();
    // eslint-disable-next-line no-console
    console.log(res);

    if (res) {
      // limiting to 30 results as there is no pagination
      const data = res.data.slice(0, 100);

      // Create a container for the list
      const listContainer = document.createElement('ul');
      listContainer.classList.add('certification-list-cards-container');

      // Iterate through the certifications and create list items
      data.forEach((certification) => {
        const listItem = document.createElement('li');
        listItem.classList.add('certification-item');

        // Add certification details
        listItem.innerHTML = `
          <h3>${certification.title}</h3>
          <p><strong>Code:</strong> ${certification.code}</p>
          <p><strong>Expiration Date:</strong> ${certification.expirationDate}</p>
        `;

        listContainer.appendChild(listItem);
      });
      block.appendChild(listContainer);
    } else {
      block.innerHTML += `<p class="error">No certifications available.</p>`;
    }

    // Append the list to the block
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error rendering certification list:', error);
    block.innerHTML = `<p class="error">Unable to load certifications. Please try again later.</p>`;
  }
}

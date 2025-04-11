/**
 * Render a list of certifications by fetching data from a JSON file.
 * @param {HTMLElement} block - The block element where the list will be rendered.
 */
export default async function decorate(block) {
  // Extracting elements from the block
  const [headingElement, descriptionElement, profileContext] = [...block.children].map(
    (row) => row.firstElementChild,
  );
  block.textContent = ""
  console.log(headingElement, descriptionElement, profileContext)

  try {
      // Dynamically import the JSON data
      const response = await import('./certification-data.js');
      const data = response.default.data.slice(0, 30);
  
      // Create a container for the list
      const listContainer = document.createElement('ul');
      listContainer.classList.add('certification-list');
  
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
  
      // Append the list to the block
    } catch (error) {
      console.error('Error rendering certification list:', error);
      block.innerHTML = `<p class="error">Unable to load certifications. Please try again later.</p>`;
    }
  }
  
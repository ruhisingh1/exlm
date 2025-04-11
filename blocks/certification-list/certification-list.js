// const certificationUrl = "";

/**
 * Check if the user is signed in.
 * @returns {Promise<boolean>} True if the user is signed in, false otherwise.
 */
const isUserSignedIn = async () => {
    try {
      // Assuming adobeIMS is globally available
      const status = await window?.adobeIMS?.isSignedInUser();
      return status;
    } catch (error) {
      console.error('Error checking user sign-in status:', error);
      return false;
    }
  };

/**
 * Fetch the user's email from adobeIms.
 * @returns {Promise<string>} The user's email address.
 */
const getUserEmail = async () => {
    try {
      // Assuming adobeIMS is globally available
      const userProfile = await window?.adobeIMS?.getProfile();
      return userProfile.email || 'Email not available';
    } catch (error) {
      console.error('Error fetching user email:', error);
      return 'Error fetching email';
    }
  }

/**
 * Render a list of certifications by fetching data from a JSON file.
 * @param {HTMLElement} block - The block element where the list will be rendered.
 */
export default async function decorate(block) {
    // Extracting elements from the block
    const [headingElement, descriptionElement, ModifiedAfterFilter, profileContext] = [...block.children].map(
      (row) => row.firstElementChild,
    );
    block.textContent = "";
    console.log(headingElement, descriptionElement, profileContext, ModifiedAfterFilter);

    block.appendChild(headingElement);
    block.appendChild(descriptionElement);
    
    try {
    let response;
      if (profileContext?.textContent.trim().toLowerCase() === "true") {
        const signedIn = await isUserSignedIn();
        if (signedIn) {
          const email = await getUserEmail();
          console.log("User Email:", email);
        //   const response = await fetch(`https://example.com/api/certifications?email=${email}`);
        } else {
         block.innerHTML += `<p class="error">Please sign in to get profile specific certificates</p>`;
          console.log("User is not signed in.");
        }
      } else {
        // Dynamically import the JSON data
        response = await import("./certification-data.js");
      }

      if(response) {
        
      // limiting to 30 results as there is no pagination
      const data = response.default.data.slice(0, 30);
  
      // Create a container for the list
      const listContainer = document.createElement("ul");
      listContainer.classList.add("certification-list-cards-container");
  
      // Iterate through the certifications and create list items
      data.forEach((certification) => {
        const listItem = document.createElement("li");
        listItem.classList.add("certification-item");
  
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
      console.error("Error rendering certification list:", error);
      block.innerHTML = `<p class="error">Unable to load certifications. Please try again later.</p>`;
    }
  }
  
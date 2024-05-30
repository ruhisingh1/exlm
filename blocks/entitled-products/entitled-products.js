import { decorateIcons } from '../../scripts/lib-franklin.js';
import { sendNotice } from '../../scripts/toast/toast.js';
import { fetchLanguagePlaceholders } from '../../scripts/scripts.js';
import { defaultProfileClient, isSignedInUser } from '../../scripts/auth/profile.js';

loadCSS(`${window.hlx.codeBasePath}/scripts/toast/toast.css`);

let placeholders = {};
try {
  placeholders = await fetchLanguagePlaceholders();
} catch (err) {
  /* eslint-disable-next-line no-console */
  console.error('Error fetching placeholders:', err);
}

export default async function decorate(block) {
  const entitlementsDOM = document.createRange().createContextualFragment(`
  <div class="product-card">
            <div class="product">
            <span class="icon"></span>
            <p class="product-subtitle">My Adobe product</p>
            </div>
            <div class="product-title">Analytics</div>
            <div class="product-selection">
            <span>Select your experience level</span>
            <select class="experience-level">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Experienced">Experienced</option>
            </select>
            <div class="select-product">
                <span class="checkbox">
            <input data-name="emailOptIn" id="emailOptIn" type="checkbox">
            <label for="emailOptIn" class="subtext">Select this product</label>
          </span>
            </div>
            </div>
        </div>
  `);

  block.textContent = '';
  block.append(entitlementsDOM);
  await decorateIcons(block);

  const isSignedIn = await isSignedInUser();
  if (isSignedIn) {
    const profileData = await defaultProfileClient.getMergedProfile();
    const userOrgs = profileData?.orgs;
    for (let userOrg of userOrgs) {
      try {
          // Call the switchProfile function to get the access token
          const accessToken = await adobeIMS.switchProfile(userOrg.userId);
          
          // Define the API endpoint with the specific organization ID
          const apiUrl = `https://bps-il.adobe.io/jil-api/v2/organizations/${userOrg.orgId}/products`;
          
          // Fetch products data with the access token
          const response = await fetch(apiUrl, {
              method: 'GET',
              headers: {
                  'Authorization': `Bearer ${accessToken}`
              }
          });

          // Check if the response is ok (status code 200-299)
          if (!response.ok) {
              throw new Error(`Error fetching products for ${user.orgName}: ${response.statusText}`);
          }

          // Parse and log the product data
          const productData = await response.json();
          console.log(`Product data for ${user.orgName}:`, productData);

      } catch (error) {
          console.error(`Failed to fetch products for ${user.orgName}:`, error);
      }
  }
    
  }
}


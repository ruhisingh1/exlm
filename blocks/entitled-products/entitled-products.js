import { decorateIcons } from '../../scripts/lib-franklin.js';
import { sendNotice } from '../../scripts/toast/toast.js';
import { fetchLanguagePlaceholders, getConfig } from '../../scripts/scripts.js';
import { defaultProfileClient, isSignedInUser } from '../../scripts/auth/profile.js';

// loadCSS(`${window.hlx.codeBasePath}/scripts/toast/toast.css`);

let placeholders = {};
try {
  placeholders = await fetchLanguagePlaceholders();
} catch (err) {
  /* eslint-disable-next-line no-console */
  console.error('Error fetching placeholders:', err);
}

const { jilAPi, ims } = getConfig();

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
  // await decorateIcons(block);

  const isSignedIn = await isSignedInUser();
  if (isSignedIn) {
    const profileData = await defaultProfileClient.getMergedProfile();
    const userOrgs = profileData?.orgs;
    for (let userOrg of userOrgs) {
      try {
          // Call the switchProfile function to get the access token
          const newProfile = await adobeIMS.switchProfile(userOrg.userId);
    const accessToken = newProfile.tokenInfo.token;
    sessionStorage.setItem('JIL-token', 'Bearer ' + newProfile.tokenInfo.token);
    let productEndPoint = jilAPi.replace('#ORG_ID', userOrg.orgId);
    let requestHeaders = {};
    requestHeaders['x-api-key'] = ims.client_id;
          requestHeaders.Authorization = sessionStorage.getItem('JIL-token') || '';
          
          // Fetch products data with the access token
          const response = await fetch(productEndPoint, {
            headers: {...requestHeaders},
            params: {},
            key: 'jil-product-list'
          })

          // Check if the response is ok (status code 200-299)
          if (!response.ok) {
              throw new Error(`Error fetching products for ${userOrg.orgName}: ${response.statusText}`);
          }

          // Parse and log the product data
          const productData = await response.json();
          console.log(`Product data for ${userOrg.orgName}:`, productData);

      } catch (error) {
          console.error(`Failed to fetch products for ${userOrg.orgName}:`, error);
      }
  }
    
  }
}


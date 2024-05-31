import { decorateIcons } from '../../scripts/lib-franklin.js';
import { sendNotice } from '../../scripts/toast/toast.js';
import { fetchLanguagePlaceholders, getConfig } from '../../scripts/scripts.js';
import { defaultProfileClient, isSignedInUser } from '../../scripts/auth/profile.js';

// loadCSS(`${window.hlx.codeBasePath}/scripts/toast/toast.css`);

let placeholders = {};
try {
  placeholders = await fetchLanguagePlaceholders();
} catch (err) {
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
    try {
      const profileData = await defaultProfileClient.getMergedProfile();
      const userOrgs = profileData?.orgs || [];

      await Promise.all(userOrgs.map(async (userOrg) => {
        try {
          const newProfile = await window.adobeIMS.switchProfile(userOrg.userId);
          const accessToken = newProfile.tokenInfo.token;
          sessionStorage.setItem('JIL-token', `Bearer ${accessToken}`);

          const productEndPoint = jilAPi.replace('#ORG_ID', userOrg.orgId);
          const requestHeaders = {
            'x-api-key': ims.client_id,
            Authorization: sessionStorage.getItem('JIL-token') || '',
          };

          const response = await fetch(productEndPoint, {
            headers: { ...requestHeaders },
          });

          if (!response.ok) {
            throw new Error(`Error fetching products for ${userOrg.orgName}: ${response.statusText}`);
          }

          const productData = await response.json();
          console.log(`Product data for ${userOrg.orgName}:`, productData);
        } catch (error) {
          console.error(`Failed to fetch products for ${userOrg.orgName}:`, error);
        }
      }));
    } catch (error) {
      console.error('Error processing user organizations:', error);
    }
  }
}

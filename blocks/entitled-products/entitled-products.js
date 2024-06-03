import { decorateIcons, loadCSS } from '../../scripts/lib-franklin.js';
import { sendNotice } from '../../scripts/toast/toast.js';
import { getConfig } from '../../scripts/scripts.js';
import { defaultProfileClient, isSignedInUser } from '../../scripts/auth/profile.js';
import buildProductCard from '../../scripts/profile/profile-interests.js';
import eventHandler from '../../scripts/profile/profile-interests-event.js';

loadCSS(`${window.hlx.codeBasePath}/scripts/toast/toast.css`);

export default async function decorate(block, model) {
  const [headingElement, descElement] = [...block.children].map((row) => row.firstElementChild);
  const headingContent = headingElement?.textContent?.trim() ?? '';
  const descContent = descElement?.textContent?.trim() ?? '';
  
  const styledHeader = headingElement.firstElementChild === null 
    ? `<h3>${headingContent}</h3>` 
    : headingElement.innerHTML;
  
  const entitlementsDOM = document.createRange().createContextualFragment(`
    ${styledHeader ? `<div class="heading">${styledHeader}</div>` : ''}
    ${descContent ? `<div class="description">${descContent}</div>` : ''}
  `);
  const { product = 'Target', isSelected = false } = model;
  console.log(`Product: ${product}, Is Selected: ${isSelected}`);
  entitlementsDOM.append(await buildProductCard(block, model));
  
  block.innerHTML = '';
  block.append(entitlementsDOM);
  
  eventHandler();
  // await decorateIcons(block);

  // const isSignedIn = await isSignedInUser();
  // if (isSignedIn) {
  //   const profileData = await defaultProfileClient.getMergedProfile();
  //   const solutionLevels = profileData?.solutionLevels || [];
  //   defaultProfileClient
  //     .updateProfile("solutionLevels", isChecked)
  //     .then(() => sendNotice(PROFILE_UPDATED))
  //     .catch(() => sendNotice(PROFILE_NOT_UPDATED));
  // }

  // if (isSignedIn) {
  //   const preferenceName = checkbox.getAttribute('data-name');
  //   defaultProfileClient
  //     .updateProfile(preferenceName, isChecked)
  //     .then(() => sendNotice(PROFILE_UPDATED))
  //     .catch(() => sendNotice(PROFILE_NOT_UPDATED));
  // }
}

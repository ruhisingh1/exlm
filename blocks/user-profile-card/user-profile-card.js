import { decorateIcons } from '../../scripts/lib-franklin.js';
import { generateProfileDOM } from '../../scripts/profile/profile.js';
import getEmitter from '../../scripts/events.js';

const profileEventEmitter = getEmitter('profile');

function loadCommunityAccountDOM(block) {
  const profileFlags = ['communityProfile'];
  generateProfileDOM(profileFlags).then(async ({ communityAccountDOM }) => {
    const communityAccountElement = block.querySelector('.profile-row.community-account');
    if (communityAccountElement) {
      const communityProfileFragment = document.createRange().createContextualFragment(communityAccountDOM);
      decorateIcons(communityProfileFragment);
      communityAccountElement.replaceWith(communityProfileFragment);
    }
  });
}

async function decorateUserProfileCard(block) {
  const profileFlags = ['exlProfile'];
  const profileInfoPromise = generateProfileDOM(profileFlags);

  const userProfileDOM = document.createRange().createContextualFragment(`
    <div class="user-profile-card-box">
      <div class="profile-row adobe-account loading">
        <div class="adobe-account-logo profile-row-shimmer"></div>
        <div class="adobe-account-text profile-row-shimmer"></div>
      </div>
      <div class="profile-row community-account loading">
        <div class="profile-row-shimmer"></div>
      </div>
      <div class="profile-row additional-data loading profile-row-shimmer"></div>
    </div>
  `);

  block.textContent = '';
  block.append(userProfileDOM);

  loadCommunityAccountDOM(block);
  profileInfoPromise.then(async ({ adobeAccountDOM, additionalProfileInfoDOM }) => {
    const adobeAccountElement = block.querySelector('.profile-row.adobe-account');
    const additionalProfileElement = block.querySelector('.profile-row.additional-data');
    if (adobeAccountDOM && adobeAccountElement) {
      const profileFragment = document.createRange().createContextualFragment(adobeAccountDOM);
      decorateIcons(profileFragment);
      adobeAccountElement.replaceWith(profileFragment);
    }

    if (additionalProfileInfoDOM && additionalProfileElement) {
      const profileFragment = document.createRange().createContextualFragment(additionalProfileInfoDOM);
      decorateIcons(profileFragment);
      additionalProfileElement.replaceWith(profileFragment);
    }
  });
}

export default async function decorate(block) {
  const blockInnerHTML = block.innerHTML;
  await decorateUserProfileCard(block);

  profileEventEmitter.on('profileDataUpdated', async () => {
    block.innerHTML = blockInnerHTML;
    await decorateUserProfileCard(block);
  });
}

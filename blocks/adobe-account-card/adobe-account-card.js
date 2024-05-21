import { fetchLanguagePlaceholders, decorateExternalLinks } from '../../scripts/scripts.js';
import { defaultProfileClient, isSignedInUser } from '../../scripts/auth/profile.js';

let placeholders = {};
try {
  placeholders = await fetchLanguagePlaceholders();
} catch (err) {
  /* eslint-disable-next-line no-console */
  console.error('Error fetching placeholders:', err);
}
const adobeAccountLink = 'https://account.adobe.com/';
const ADOBE_ACCOUNT = placeholders?.myAdobeAccount || 'My Adobe Account';
const MAKE_CHANGES_TEXT = placeholders?.makeChanges || 'Make changes';

let displayName = '';
let email = '';
let company = '';
let profileImg = ''; // default initials or placeholder

const isSignedIn = await isSignedInUser();
if (isSignedIn) {
  const profileData = JSON.parse(sessionStorage.getItem('profile')) || {};
  displayName = profileData.displayName || '';
  email = profileData.email || '';
  company = profileData.company || '';
  profileImg = await defaultProfileClient.getPPSProfile().then((ppsProfile) => {
    const profilePicture = ppsProfile?.images['50'];
    if (profilePicture) {
      return `<img class="profile-picture" src="${profilePicture}" alt="profile picture" />`;
    } 
  });
}

export default async function decorate(block) {
  const accountCardDOM = document.createRange().createContextualFragment(`
    <div class="card-header">
        <h3>${ADOBE_ACCOUNT}</h3>
        <a href="${adobeAccountLink}" class="make-changes external">${MAKE_CHANGES_TEXT}</a>
      </div>
      <div class="card-body">
        <div class="avatar">${profileImg}</div>
        <div class="user-info">
          <h4>${displayName}</h4>
          <p>${company}</p>
          <p>${email}</p>
        </div>
      </div>
  `);

  block.textContent = '';
  block.append(accountCardDOM);
  decorateExternalLinks(block);
}

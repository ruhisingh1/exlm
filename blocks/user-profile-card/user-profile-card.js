import { decorateIcons } from '../../scripts/lib-franklin.js';
import { fetchLanguagePlaceholders } from '../../scripts/scripts.js';
import { defaultProfileClient, isSignedInUser } from '../../scripts/auth/profile.js';

let placeholders = {};
try {
  placeholders = await fetchLanguagePlaceholders();
} catch (err) {
  /* eslint-disable-next-line no-console */
  console.error('Error fetching placeholders:', err);
}
const adobeAccountLink = 'https://account.adobe.com/';
const communityAccountLink = 'https://account.adobe.com/';

export default async function decorate(block) {
  let displayName = '';
  let company = '';
  let email = '';
  let profilePicture = '';
  let roles = '';
  let industry = '';
  let interests = '';

  const isSignedIn = await isSignedInUser();
  if (isSignedIn) {
    const profileData = await defaultProfileClient.getMergedProfile();
    displayName = profileData?.displayName || '';
    email = profileData?.email || '';
    industry = profileData?.industryInterests || '';
    const profileRoles = profileData?.role || '';
    const profileInterests = profileData?.interests || '';

    if (profileRoles.length > 0) {
      roles = profileRoles.join('  ');
    }
    
    if (profileInterests.length > 0) {
      interests = profileInterests.join('  ');
    }

    const ppsProfileData = await defaultProfileClient.getPPSProfile();
    profilePicture = ppsProfileData?.images?.['100'] || '';
    company = ppsProfileData?.company || '';
  }

  const userProfileDOM = document.createRange().createContextualFragment(`
      <div class="row adobe-account">
        <div class="card-header">
          <div class="my-adobe-account">${placeholders?.myAdobeAccount || 'My Adobe Account'}</div>
          <div class="manage-adobe-account">
            <span class="icon icon-new-tab"></span>
            <a href="${adobeAccountLink}" target="_blank">${placeholders?.manageAdobeAccount || 'Manage Adobe account'}</a>
          </div>
        </div>
        <div class="card-body">
          <div class="avatar">
            ${
              profilePicture
                ? `<img class="profile-picture" src="${profilePicture}" alt="profile picture" />`
                : '<span class="icon icon-profile"></span>'
            }
          </div>
          <div class="user-info">
            <div class="display-name">${displayName}</div>
            <div class="company">${company}</div>
            <div class="email">${email}</div>
          </div>
        </div>
      </div>
      <div class="row community-account">
        <div class="card-header">
          <div class="my-community-account">${placeholders?.myCommunityAccount || 'My Community Profile'}</div>
          <div class="manage-community-account">
            <span class="icon icon-new-tab"></span>
            <a href="${communityAccountLink}" target="_blank">${placeholders?.updateProfile || 'Update profile'}</a>
          </div>
        </div>
        <div class="card-body">
          <div class="user-info">
            <div class="display-name">@RyPot478</div>
            <div class="title"><span class="heading">TITLE:</span> Head of Experience Design</div>
            <div class="location"><span class="heading">LOCATION:</span> Salt Lake City, UT</div>
          </div>
        </div>
      </div>
      <div class="row additional-data">
        <div class="card-body">
          <div class="user-info">
            <div class="role"><span class="heading">My Role:</span> ${roles}</div>
            <div class="industry"><span class="heading">My Industry:</span> ${industry}</div>
            <div class="interests"><span class="heading">My Interests:</span> ${interests}</div>
          </div>
        </div>
      </div>
`);

  block.textContent = '';
  block.append(userProfileDOM);
  await decorateIcons(block);
}

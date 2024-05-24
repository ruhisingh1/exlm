import { fetchLanguagePlaceholders } from '../scripts.js';
import { defaultProfileClient, isSignedInUser } from '../auth/profile.js';

let placeholders = {};
try {
  placeholders = await fetchLanguagePlaceholders();
} catch (err) {
  /* eslint-disable-next-line no-console */
  console.error('Error fetching placeholders:', err);
}

const adobeAccountLink = 'https://account.adobe.com/';
const communityAccountLink = '';

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
  const profileRoles = profileData?.role || [];
  const profileInterests = profileData?.interests || [];

  if (profileRoles.length > 0) {
    roles = profileRoles.join('&nbsp;&nbsp;');
  }

  if (profileInterests.length > 0) {
    interests = profileInterests.join('&nbsp;&nbsp;');
  }

  const ppsProfileData = await defaultProfileClient.getPPSProfile();
  profilePicture = ppsProfileData?.images?.['100'] || '';
  company = ppsProfileData?.company || '';
}

export const adobeAccountDOM = `<div class="row adobe-account">
  <div class="card-header adobe-account-header">
    <div class="my-adobe-account">${placeholders?.myAdobeAccount || 'My Adobe Account'}</div>
    <div class="manage-adobe-account">
      <span class="icon icon-new-tab"></span>
      <a href="${adobeAccountLink}" target="_blank">${placeholders?.manageAdobeAccount || 'Manage Adobe account'}</a>
    </div>
  </div>
  <div class="card-body adobe-account-body">
    <div class="avatar">
      ${profilePicture ? `<img class="profile-picture" src="${profilePicture}" alt="Profile Picture" />` : '<span class="icon icon-profile"></span>'}
    </div>
    <div class="user-info">
      <div class="display-name adobe-display-name">${displayName}</div>
      <div class="user-company">${company}</div>
      <div class="user-email">${email}</div>
    </div>
  </div>
</div>`;

export const communityAccountDOM = `<div class="row community-account">
  <div class="card-header community-account-header">
    <div class="my-community-account">${placeholders?.myCommunityAccount || 'My Community Profile'}</div>
    <div class="manage-community-account">
      <span class="icon icon-new-tab"></span>
      <a href="${communityAccountLink}" target="_blank">${placeholders?.updateCommunityProfile || 'Update profile'}</a>
    </div>
  </div>
  <div class="card-body community-account-body">
    <div class="user-info">
      <div class="display-name community-display-name">@RyPot478</div>
      <div class="community-title"><span class="heading">${placeholders?.title || 'Title'}: </span><span>Head of Experience Design</span></div>
      <div class="community-location"><span class="heading">${placeholders?.location || 'Location'}: </span><span>Salt Lake City, UT</span></div>
    </div>
  </div>
</div>`;

export const additionalProfileInfoDOM = `<div class="row additional-data">
  <div class="card-body additional-data-body">
    <div class="user-info">
      <div class="user-role"><span class="heading">${placeholders?.myRole || 'My Role'}: </span><span>${roles}</span></div>
      <div class="user-industry"><span class="heading">${placeholders?.myIndustry || 'My Industry'}: </span><span>${industry}</span></div>
      <div class="user-interests"><span class="heading">${placeholders?.myInterests || 'My interests'}: </span><span>${interests}</span></div>
    </div>
  </div>
</div>`;

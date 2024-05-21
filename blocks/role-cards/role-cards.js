import { htmlToElement, fetchLanguagePlaceholders } from '../../scripts/scripts.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';
import { sendNotice } from '../../scripts/toast/toast.js';
import { loadCSS } from '../../scripts/lib-franklin.js';
import { defaultProfileClient, isSignedInUser } from '../../scripts/auth/profile.js';
loadCSS(`${window.hlx.codeBasePath}/scripts/toast/toast.css`);

let placeholders = {};
try {
  placeholders = await fetchLanguagePlaceholders();
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('Error fetching placeholders:', err);
}

const PROFILE_UPDATED = placeholders?.profileUpdated || 'Your profile changes have been saved!';
const PROFILE_NOT_UPDATED = placeholders?.profileNotUpdated || 'Your profile changes have not been saved!';

export default async function decorate(block) {
  block.textContent = '';

  const roleCardsData = [
    {
      title: placeholders.filterRoleUserTitle,
      icon: 'business-user',
      description: placeholders.filterRoleUserDescription,
      selectionDefault: '',
    },
    {
      title: placeholders.filterRoleDeveloperTitle,
      icon: 'developer',
      description: placeholders.filterRoleDeveloperDescription,
      selectionDefault: '',
    },
    {
      title: placeholders.filterRoleAdminTitle,
      icon: 'admin',
      description: placeholders.filterRoleAdminDescription,
      selectionDefault: '',
    },
    {
      title: placeholders.filterRoleLeaderTitle,
      icon: 'business-leader',
      description: placeholders.filterRoleLeaderDescription,
      selectionDefault: '',
    },
  ];

  const roleCardsDiv = htmlToElement(`
    <div class="role-cards-container">
      ${roleCardsData
        .map((card, index) => {
          return `
        <div class="role-cards-block">
        <div class="role-cards-description">
        <span class="icon icon-${card.icon}"></span>
        <h3>${card.title}</h3>
        <p>${card.description}</p>
        </div>
        <div class="role-cards-selectiondefault">
        <p>${card.selectionDefault}</p>
        <span class="role-cards-checkbox">
        <input name="selectRole" type="checkbox" id="selectRole-${index}">
        <label class="subText" for="selectRole-${index}">Select this role</label>
        </span>
        </div>
        </div>`;
        })
        .join('')}
    </div>
  `);

  block.append(roleCardsDiv);
  decorateIcons(block);

  const isSignedIn = await isSignedInUser();
  if (isSignedIn) {
    const profileData = await defaultProfileClient.getMergedProfile();
    const role = profileData?.role;

    const roleMapping = {
      User: 0,
      Developer: 1,
      Admin: 2,
      Leader: 3,
    };

    role.forEach((el) => {
      const index = roleMapping[el];
      if (index !== undefined) {
        const checkBox = document.getElementById(`selectRole-${index}`);
        if (checkBox) {
          checkBox.checked = true;
          checkBox.closest('.role-cards-block').classList.toggle('highlight', checkBox.checked);
        }
      }
    });
  }

  block.querySelectorAll('.role-cards-block').forEach((card) => {
    const checkbox = card.querySelector('input[type="checkbox"]');

    card.addEventListener('click', (e) => {
      const isLabelClicked = e.target.tagName === 'LABEL' || e.target.classList.contains('subText');
      if (e.target !== checkbox && !isLabelClicked) {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    checkbox.addEventListener('change', (e) => {
      e.preventDefault();
      const isChecked = checkbox.checked;
      checkbox.closest('.role-cards-block').classList.toggle('highlight', isChecked);

      if (isSignedIn) {
        const preferenceName = checkbox.getAttribute('name');
        defaultProfileClient
          .updateProfile(preferenceName, isChecked)
          .then(() => sendNotice(PROFILE_UPDATED))
          .catch(() => sendNotice(PROFILE_NOT_UPDATED));
      }
    });
  });
}

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
const SELECT_ROLE = placeholders?.selectRole || 'Select this role';

export default async function decorate(block) {
  block.textContent = '';
  const isSignedIn = await isSignedInUser();

  const roleCardsData = [
    {
      title: placeholders.filterRoleUserTitle || 'Business User',
      icon: 'business-user',
      description:
        placeholders.filterRoleUserDescription ||
        `Responsible for utilizing Adobe solutions to achieve daily job functions, complete tasks, and achieve business objectives.`,
      selectionDefault: placeholders.noSelectionDefault || '(No selection default)',
    },
    {
      title: placeholders.filterRoleDeveloperTitle || 'Developer',
      icon: 'developer',
      description:
        placeholders.filterRoleDeveloperDescription ||
        `Responsible for engineering Adobe solutions' implementation, integration, data-modeling, data engineering, and other technical skills.`,
      selectionDefault: '',
    },
    {
      title: placeholders.filterRoleAdminTitle || 'Administrator',
      icon: 'admin',
      description:
        placeholders.filterRoleAdminDescription ||
        `Responsible for the technical operations, configuration, permissions, management, and support needs of Adobe solutions.`,
      selectionDefault: '',
    },
    {
      title: placeholders.filterRoleLeaderTitle || 'Business Leader',
      icon: 'business-leader',
      description:
        placeholders.filterRoleLeaderDescription ||
        `Responsible for owning the digital strategy and accelerating value through Adobe solutions.`,
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
        <div class="role-cards-icon">
        <span class="icon icon-${card.icon}"></span>
        <h3>${card.title}</h3>
        </div>
        <p>${card.description}</p>
        </div>
        <div class="role-cards-selectiondefault">
        ${isSignedIn ? `<p>${card.selectionDefault}</p>` : ''}
        <span class="role-cards-checkbox">
        <input name="selectRole-${index}" type="checkbox" id="selectRole-${index}">
        <label class="subText" for="selectRole-${index}">${SELECT_ROLE}</label>
        </span>
        </div>
        </div>`;
        })
        .join('')}
    </div>
  `);

  block.append(roleCardsDiv);
  decorateIcons(block);

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

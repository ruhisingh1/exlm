import { defaultProfileClient, isSignedInUser } from '../../scripts/auth/profile.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';
import { getPathDetails, htmlToElement } from '../../scripts/scripts.js';

const UEAuthorMode = window.hlx.aemRoot || window.location.href.includes('.html');
const { lang } = getPathDetails();

const awardsPage = '/home/awards';
const navPage = `${lang}/home/nav`;
const profileSettingsPage = `/${lang}/home/profile-settings`;
const navURL = `${window.location.origin}/${navPage}`;

const isSignedIn = await isSignedInUser();
let awards = false;
if (isSignedIn) {
  const profileData = await defaultProfileClient.getMergedProfile();
  const skills = profileData?.skills;
  const awardedSkills = skills.filter((skill) => skill.award === true);
  if (awardedSkills.length) {
    awards = true;
  }
}

async function fetchNavContent() {
  try {
    const response = await fetch(`${navURL}.plain.html`);
    if (response.ok) {
      const pageContent = await response.text();
      return pageContent;
    }
  } catch (err) {
    /* eslint-disable-next-line no-console */
    console.log(err);
  }
  return '';
}

export default async function ProfileRail(block) {
  const content = await fetchNavContent();
  if (content) {
    block.innerHTML = content;
  } else {
    throw new Error(`Failed to fetch content from ${navURL}`);
  }

  block.querySelectorAll('.profile-rail > div > *').forEach((navItem) => {
    if (navItem.tagName === 'UL') {
      navItem.classList.add('profile-rail-links');
    } else {
      navItem.classList.add('profile-rail-heading');
    }
  });

  block.querySelectorAll('.profile-rail-links > li').forEach((navLink) => {
    // In case of no awards for the profile
    if (!awards && !UEAuthorMode) {
      // remove the Awards link from left rail
      const awardsLink = navLink.querySelector(`a[href*="${awardsPage}"]`);
      if (awardsLink) {
        navLink.remove();
      }
      // redirect awards page to profile-settings page
      if (window.location.pathname === `/${lang}${awardsPage}`) {
        window.location.pathname = `${profileSettingsPage}`;
      }
    }
    const link = navLink.querySelector('a');
    const icon = navLink.querySelector('span.icon');
    if (link && icon) link.prepend(icon);
    if (link && link.href === `${window.location.origin}${window.location.pathname}`) {
      link.href = '#';
      link.classList.add('active');
      link.appendChild(htmlToElement('<span class="icon icon-chevron-down"></span>'));
    }
  });

  const dynamicLinks = 
  `<p class="profile-rail-heading">JUMP TO SECTION</p>
  <ul class="profile-rail-links jump-to-section">
  </ul>`;
  const staticLinks =
    `<p class="profile-rail-heading">ALL LEARNING RESOURCES</p>
    <ul class="profile-rail-links">
    <li><a target="_blank" href="/en/docs/home-tutorials" title="Tutorials">Tutorials</a></li>
    <li><a target="_blank" href="/en/docs/home-tutorials" title="Documentation">Documentation</a></li>
    <li><a target="_blank" href="/en/docs/home-tutorials" title="Community">Community</a></li>
    <li><a target="_blank" href="/en/docs/home-tutorials" title="Events">Events</a></li>
    <li><a target="_blank" href="/en/docs/home-tutorials" title="Certifications">Certifications</a></li>
    </ul>`;
  const profileRailLinks = block.querySelectorAll('.profile-home-page .profile-rail-links');
  if (profileRailLinks.length > 0) {
   
    profileRailLinks[profileRailLinks.length - 1].insertAdjacentHTML('afterend', staticLinks);
    profileRailLinks[profileRailLinks.length - 1].insertAdjacentHTML('afterend', dynamicLinks);
  }

  // generate jump to section links dynamically
  const jumpLinksContainer = document.querySelector('.profile-rail-links.jump-to-section');
  if (!jumpLinksContainer) return; // Ensure the container exists

  let isAnchorScroll = false;
  const sections = [];
  let activeLink = null;

  // Find all elements with recommended-content-header and recently-reviewed-header classes
  document.querySelectorAll('.recommended-content-header, .recently-reviewed-header').forEach((header) => {
    if (!header.id) {
      header.id = header.textContent.trim().toLowerCase().replace(/\s+/g, '-');
    }

    sections.push({
      text: header.textContent,
      id: header.id,
      element: header
    });
  });

  // Generate jump links dynamically
  if (sections.length > 0) {
    const jumpLinksHTML = sections.map((section) => {
      return `<li><a href="#${section.id}">${section.text}</a></li>`;
    }).join('');

    jumpLinksContainer.insertAdjacentHTML('beforeend', jumpLinksHTML);
  }

  const anchors = document.querySelectorAll('.jump-to-section a');

  // Function to highlight active link
  function highlightActiveLink() {
    if (isAnchorScroll) return;

    let scrollPosition = window.scrollY + 100; // Adjust for header offset

    let activeSection = sections.find(({ element }) => {
      return element.offsetTop <= scrollPosition && element.offsetTop + element.offsetHeight > scrollPosition;
    });

    if (activeSection) {
      anchors.forEach((a) => a.classList.remove('is-active'));
      let newActiveLink = [...anchors].find(a => a.hash === `#${activeSection.id}`);
      if (newActiveLink) {
        newActiveLink.classList.add('is-active');
        activeLink = newActiveLink;
      }
    }
  }

  // Smooth scrolling and active link handling
  anchors.forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        isAnchorScroll = true;
        window.scrollTo({
          top: targetElement.offsetTop - 20,
          behavior: 'smooth',
        });

        anchors.forEach((a) => a.classList.remove('is-active'));
        anchor.classList.add('is-active');

        setTimeout(() => {
          isAnchorScroll = false;
        }, 1000);
      }
    });
  });

  // Debounced scroll event for active section highlighting
  function debounce(func, wait) {
    let timeout;
    return function () {
      clearTimeout(timeout);
      timeout = setTimeout(func, wait);
    };
  }

  window.addEventListener('scroll', debounce(highlightActiveLink, 10));
  
  const inActiveLinks = block.querySelectorAll('.profile-rail-links > li > a:not(.active)');
  const profileRailOverlay = document.createElement('div');
  profileRailOverlay.classList.add('profile-rail-overlay', 'hidden');
  inActiveLinks.forEach((link) => {
    profileRailOverlay.appendChild(link.cloneNode(true));
  });
  block.append(profileRailOverlay);

  document.addEventListener('click', (event) => {
    if (event.target.closest('.profile-rail-links > li > a.active')) {
      if (!window.matchMedia('(min-width: 1024)').matches) {
        event.preventDefault();
        event.target.classList.toggle('overlay-active');
        profileRailOverlay.classList.toggle('hidden');
      }
    } else {
      profileRailOverlay.classList.add('hidden');
      block.querySelector('.profile-rail-links > li > a.active')?.classList.remove('overlay-active');
    }
  });

  decorateIcons(block);
}

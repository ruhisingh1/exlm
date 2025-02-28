import { defaultProfileClient, isSignedInUser } from '../../scripts/auth/profile.js';
import { decorateIcons } from '../../scripts/lib-franklin.js';
import { getPathDetails, htmlToElement, fetchLanguagePlaceholders } from '../../scripts/scripts.js';

const UEAuthorMode = window.hlx.aemRoot || window.location.href.includes('.html');
const { lang } = getPathDetails();

function debounce(func, delay) {
  let timer;
  return function debouncedFunction(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

const formatId = (text) =>
  text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

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

function getHeadings() {
  const headings = Array.from(
    document.querySelectorAll('.recommendation-marquee-header, .recommended-content-header, .recently-reviewed-header'),
  ).filter((heading) => heading.textContent.trim());
  return headings;
}

export default async function ProfileRail(block) {
  let placeholders = {};
  try {
    placeholders = await fetchLanguagePlaceholders();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching placeholders:', err);
  }
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
    if (link?.href.includes('#_blank')) {
      link.href = link.href.replace('#_blank', '');
      link.setAttribute('target', '_blank');
    }
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

  const firstUl = block.querySelector('ul');
  const heading = document.createElement('p');
  heading.classList.add('profile-rail-heading', 'hidden');
  heading.textContent = `${placeholders?.jumpToSection || 'Jump to section'}`;
  firstUl.insertAdjacentElement('afterend', heading);

  const newUl = document.createElement('ul');
  newUl.classList.add('profile-rail-links', 'hidden');
  heading.insertAdjacentElement('afterend', newUl);

  let activeLink = null;
  let isAnchorScroll = false;

  function updateList() {
    newUl.innerHTML = '';
    const headings = getHeadings();
    const hasHeadings = headings.length > 0;
    heading.classList.toggle('hidden', !hasHeadings);
    newUl.classList.toggle('hidden', !hasHeadings);
    if (!hasHeadings) return;

    headings.forEach((h) => {
      const sectionId = formatId(h.textContent.trim());
      if (!h.id) {
        h.id = sectionId;
      }
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.textContent = h.textContent.trim();
      a.href = `#${h.getAttribute('id')}`;
      li.appendChild(a);
      newUl.appendChild(li);
    });

    const navLinks = Array.from(newUl.querySelectorAll('a'));

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.forEach((a) => a.classList.remove('active'));
        link.classList.add('active');
        activeLink = link;
        isAnchorScroll = true;
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        targetElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setTimeout(() => {
          isAnchorScroll = false;
        }, 1000);
      });
      if (activeLink && link.href === activeLink.href) {
        link.classList.add('active');
      }
    });

    function handleScroll() {
      if (isAnchorScroll) return;

      let mostVisibleSection = null;
      const viewportHeight = window.innerHeight;
      const topThreshold = viewportHeight * 0.2;

      function getCurrentActiveLink() {
        const currentActiveLink = newUl.querySelector('a.active');
        return currentActiveLink ? currentActiveLink.getAttribute('href').substring(1) : null;
      }

      const currentActive = getCurrentActiveLink();
      let sectionInViewport = false;

      headings.forEach((el) => {
        const parentSection = el.closest('.block');
        if (!parentSection) return;

        const firstDivChild = parentSection.querySelector('.rec-block-header');
        if (!firstDivChild) return;

        const id = firstDivChild.getAttribute('id');
        const rect = parentSection.getBoundingClientRect();

        if (rect.top <= topThreshold && rect.bottom > 0) {
          mostVisibleSection = id;
          sectionInViewport = true;
        }
      });

      if (!mostVisibleSection) {
        mostVisibleSection = currentActive;
      }

      if (!sectionInViewport) {
        mostVisibleSection = null;
      }

      navLinks.forEach((link) => link.classList.remove('active'));

      if (mostVisibleSection) {
        const activeSection = navLinks.find((link) => link.getAttribute('href') === `#${mostVisibleSection}`);
        activeSection?.classList.add('active');
      }
    }

    const debouncedHandleScroll = debounce(() => {
      if (!isAnchorScroll) handleScroll();
    }, 50);
    window.addEventListener('scroll', debouncedHandleScroll);
  }

  const pageNavLink = [...document.querySelectorAll('.profile-rail-links a')].find(
    (link) => link.href.split('#')[0] === window.location.href.split('#')[0],
  );

  pageNavLink?.addEventListener('click', () => {
    document.body.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  const observerConfig = { childList: true, subtree: true, characterData: true };

  const mutationObserver = new MutationObserver(debounce(updateList, 100));

  document.querySelectorAll('.profile-section').forEach((el) => mutationObserver.observe(el, observerConfig));

  decorateIcons(block);
}

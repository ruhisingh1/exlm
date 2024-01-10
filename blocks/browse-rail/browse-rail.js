import ffetch from '../../scripts/ffetch.js';
import { getMetadata, fetchPlaceholders } from '../../scripts/lib-franklin.js';

const placeholders = await fetchPlaceholders();

// Function to check if the element is visible on page.
function isVisible(element) {
  const style = getComputedStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

// Function to create dynamic list items
function createListItem(item) {
  const li = document.createElement('li');
  li.innerHTML = `<a href="${item.path}">${item.title}</a>`;
  return li;
}

// Function to toggle visibility of items
function toggleItemVisibility(itemList, startIndex, show) {
  // eslint-disable-next-line no-plusplus
  for (let i = startIndex; i < itemList.length; i++) {
    itemList[i].classList.toggle('hidden', !show);
  }
}

// Function to set link visibility
function setLinkVisibility(linkId, show) {
  const linkElement = document.getElementById(linkId);
  if (linkElement) {
    linkElement.style.display = show ? 'block' : 'none';
  }
}

// Function to handle "View More" click
function handleViewMoreClick() {
  const itemList = document.querySelectorAll('.products > li > ul > li');
  toggleItemVisibility(itemList, 12, true);
  setLinkVisibility('viewMoreLink', false);
  setLinkVisibility('viewLessLink', true);
}

// Function to handle "View Less" click
function handleViewLessClick() {
  const itemList = document.querySelectorAll('.products > li > ul > li');
  toggleItemVisibility(itemList, 12, false);
  setLinkVisibility('viewMoreLink', true);
  setLinkVisibility('viewLessLink', false);
}

function createPagesStructure(data) {
  const pagesMap = {};

  data.forEach((item) => {
    const pathSegments = item.path.split('/').filter((segment) => segment !== '');
    let currentLevel = pagesMap;

    pathSegments.forEach((segment) => {
      if (!currentLevel[segment]) {
        currentLevel[segment] = {};
      }
      currentLevel = currentLevel[segment];
    });

    currentLevel.title = item.title;
    currentLevel.theme = item.theme;
    currentLevel.path = item.path;
  });

  return pagesMap;
}

function getFirstLevelChildren(json, path) {
  const pathSegments = path.split('/').filter((segment) => segment !== '');
  console.log(pathSegments);
  let current = json;

  // eslint-disable-next-line no-restricted-syntax
  for (const segment of pathSegments) {
    if (current[segment] && typeof current[segment] === 'object' && !Array.isArray(current[segment])) {
      current = current[segment];
    } else {
      return null; // Path not found or doesn't lead to an object
    }
  }

  if (typeof current === 'object') {
    return Object.entries(current)
      .filter(([key, value]) => typeof value === 'object' && !Array.isArray(value) && key !== null)
      .reduce((result, [key, value]) => {
        result[key] = value;
        return result;
      }, {});
  }

  return null; // Path does not lead to an object
}

export default async function decorate(block) {
  const theme = getMetadata('theme');
  const label = getMetadata('og:title');

  // Browse By
  const browseByUL = document.createElement('ul');
  browseByUL.classList.add('browse-by');
  const browseByLI = document.createElement('li');
  const browseByLinkText = theme === 'browse-all' ? `${label} content` : `All ${label} Content`;
  browseByLI.innerHTML = `<a href="#">${placeholders.browseBy}</a><ul><li><a href="#">${browseByLinkText}</a></li></ul>`;
  browseByUL.append(browseByLI);
  block.append(browseByUL);

  // Products
  const results = await ffetch('/browse-index.json').all();
  console.log(results);
  const pagesStructure = createPagesStructure(results);
  const data = JSON.stringify(pagesStructure, null, 2);
  const data1 = JSON.parse(data);
  console.log(data1);
  const browserPagePath = window.location.pathname;
  console.log(browserPagePath);

  if (theme === 'browse-all') {
    const productsUL = document.createElement('ul');
    productsUL.classList.add('products');
    const productsLI = document.createElement('li');
    productsLI.innerHTML = `<a href="#">${placeholders.products}</a>`;

    const ul = document.createElement('ul');
    const firstLevelChildren = getFirstLevelChildren(data1, browserPagePath);
    console.log(firstLevelChildren);
    if (firstLevelChildren) {
      Object.values(firstLevelChildren).forEach((item) => {
        const li = createListItem(item);
        ul.appendChild(li);
      });
    }

    productsLI.append(ul);
    productsUL.append(productsLI);

    block.append(productsUL);

    // "View More" and "View Less" links
    const viewMoreDiv = document.createElement('div');
    viewMoreDiv.innerHTML = `<a id="viewMoreLink">${placeholders.viewMore}</a>`;
    block.append(viewMoreDiv);

    const viewLessDiv = document.createElement('div');
    viewLessDiv.innerHTML = `<a id="viewLessLink" style="display: none;">${placeholders.viewLess}</a>`;
    block.append(viewLessDiv);
    // Check if there are less than 12 items, and hide the "View More" link accordingly
    if (ul.children.length <= 12) {
      document.getElementById('viewMoreLink').style.display = 'none';
    }
    toggleItemVisibility(ul.children, 12, false);

    // Event listeners for "View More" and "View Less" links
    document.getElementById('viewMoreLink').addEventListener('click', handleViewMoreClick);
    document.getElementById('viewLessLink').addEventListener('click', handleViewLessClick);
  }

  if (theme !== 'browse-all') {
    // Topics
    const browseTopicsContainer = document.querySelector('.browse-topics-container');
    if (browseTopicsContainer !== null) {
      const ulElement = document.createElement('ul');
      // Get all the topic elements inside the container
      const topicElements = browseTopicsContainer.querySelectorAll('.browse-topics.topic');

      // Loop through each topic element and create a li element for each
      topicElements.forEach((topicElement) => {
        if (isVisible(topicElement)) {
          const liElement = document.createElement('li');
          liElement.innerHTML = `<a href="#">${topicElement.textContent}</a>`;
          ulElement.appendChild(liElement);
        }
      });

      const topicsUL = document.createElement('ul');
      topicsUL.classList.add('topics');
      const topicsLI = document.createElement('li');
      topicsLI.innerHTML = `<a href="#">${label} ${placeholders.topics}</a>`;
      topicsLI.append(ulElement);
      topicsUL.append(topicsLI);
      block.append(topicsUL);
    }
    // Add "Browse more products" link
    const browseMoreProducts = document.createElement('div');
    browseMoreProducts.classList.add('browse-more-products');
    browseMoreProducts.innerHTML = `<a href="/en/browse">${placeholders.browseMoreProducts}</a>`;
    block.prepend(browseMoreProducts);
  }
}

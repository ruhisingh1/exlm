import { loadCSS, decorateIcons } from '../lib-franklin.js';
import { htmlToElement } from '../scripts.js';

export const DROPDOWN_VARIANTS = {
  DEFAULT: 'default',
  ANCHOR: 'anchor-menu',
};

await loadCSS(`${window.hlx.codeBasePath}/scripts/dropdown/dropdown.css`);

export default class Dropdown {
  /**
   * Constructor for initializing dropdown.
   *
   * @param {HTMLFormElement} parentFormElement - Parent form element
   * @param {String} defaultValue - Dropdown default value
   * @param {Array} optionsArray - Array of options list
   * @param {String} variant - Dropdown variant
   * @param {Number} id - Unique dropdown id
   * @param {Boolean} isMultiSelect - Enable multi-select mode
   */
  constructor(parentFormElement, defaultValue, optionsArray, variant = DROPDOWN_VARIANTS.DEFAULT, id = null, isMultiSelect = false) {
    this.parentFormElement = parentFormElement;
    this.defaultValue = defaultValue;
    this.optionsArray = optionsArray;
    this.id = id || document.querySelectorAll('.custom-filter-dropdown').length;
    this.variant = variant;
    this.isMultiSelect = isMultiSelect;
    this.initFormElements();
    this.handleClickEvents();
  }

  /**
   * Updates the dropdown value in multi-select mode.
   *
   * @param {Array} values - Array of selected values.
   */
  updateMultiSelectValues(values) {
    const selectedValues = Array.isArray(values) ? values : [values];
    const selectedLabels = [];

    this.dropdown.querySelectorAll('.custom-checkbox input[type="checkbox"]').forEach((checkbox) => {
      if (selectedValues.includes(checkbox.value)) {
        checkbox.checked = true;
        selectedLabels.push(checkbox.dataset.label);
      } else {
        checkbox.checked = false;
      }
    });

    this.dropdown.dataset.selected = selectedValues.join(',');
    const label = this.dropdown.querySelector('button > span');
    label.innerText = selectedLabels.join(', ') || this.defaultValue;
  }

  /**
   * Retrieves the selected values in multi-select mode.
   *
   * @returns {Array} - Array of selected values.
   */
  getSelectedValues() {
    const selectedValues = [];
    this.dropdown.querySelectorAll('.custom-checkbox input[type="checkbox"]').forEach((checkbox) => {
      if (checkbox.checked) {
        selectedValues.push(checkbox.value);
      }
    });
    return selectedValues;
  }

  /**
   * Closes all open dropdowns.
   */
  static closeAllDropdowns() {
    document.querySelectorAll('.custom-filter-dropdown.open').forEach((dropdown) => {
      dropdown.classList.remove('open');
      dropdown.children[1].style.display = 'none';
    });
  }

  /**
   * Handle click events and perform actions based on the event target.
   */
  handleClickEvents() {
    if (!Dropdown.isClickHandlerAdded) {
      document.removeEventListener('click', this.constructor.handleDocumentClick); // Remove existing listener
      document.addEventListener('click', this.constructor.handleDocumentClick); // Add new listener
      Dropdown.isClickHandlerAdded = true;
    }
  }

  /**
   * Event handler for document click events with multi-select support.
   *
   * @param {Event} event - The click event
   */
  static handleDocumentClick(event) {
    if (!event.target.closest('.custom-filter-dropdown')) {
      Dropdown.closeAllDropdowns();
    }

    if (event.target.closest('.custom-filter-dropdown > button')) {
      const button = event.target.closest('.custom-filter-dropdown > button');
      const dropdown = button.parentElement;

      if (dropdown.classList.contains('open')) {
        dropdown.classList.remove('open');
        button.nextElementSibling.style.display = 'none';
      } else {
        Dropdown.closeAllDropdowns();
        dropdown.classList.add('open');
        button.nextElementSibling.style.display = 'block';
      }
    }

    if (event.target.closest('.custom-checkbox')) {
      const dropdown = event.target.closest('.custom-filter-dropdown');
      const button = dropdown.children[0];
      const isMultiSelect = dropdown.dataset.isMultiSelect === 'true';

      if (isMultiSelect) {
        const selectedValues = [];
        const selectedLabels = [];

        dropdown.querySelectorAll('.custom-checkbox input[type="checkbox"]').forEach((checkbox) => {
          if (checkbox.checked) {
            selectedValues.push(checkbox.value);
            selectedLabels.push(checkbox.dataset.label);
          }
        });

        dropdown.dataset.selected = selectedValues.join(',');
        button.children[0].textContent = selectedLabels.join(', ') || dropdown.dataset.filterType;
      } else {
        dropdown.querySelectorAll('.custom-checkbox input[type="checkbox"]').forEach((checkbox) => {
          if (event.target.value !== checkbox.value) checkbox.checked = false;
        });

        dropdown.dataset.selected = event.target.value;
        button.children[0].textContent = event.target.dataset.label;

        if (dropdown.classList.contains('open')) {
          dropdown.classList.remove('open');
          button.nextElementSibling.style.display = 'none';
        }
      }
    }
  }

  /**
   * Initialize form elements with multi-select support.
   */
  initFormElements() {
    this.parentFormElement.addEventListener('submit', (event) => event.preventDefault());

    const dropdown = document.createElement('div');
    dropdown.classList.add('custom-filter-dropdown');
    dropdown.dataset.filterType = this.defaultValue;
    dropdown.dataset.variant = this.variant;
    dropdown.dataset.isMultiSelect = this.isMultiSelect;
    this.dropdown = dropdown;

    dropdown.appendChild(
      htmlToElement(`
        <button>
          <span class="custom-filter-dropdown-name">${this.defaultValue}</span>
          <span class="icon icon-chevron"></span>
        </button>
      `),
    );
    decorateIcons(dropdown);

    const dropdownContent = document.createElement('div');
    dropdownContent.classList.add('filter-dropdown-content');
    dropdown.appendChild(dropdownContent);

    this.optionsArray.forEach((item, itemIndex) => {
      const dropdownItem = htmlToElement(
        ` <div class="custom-checkbox">
              <input type="checkbox" id="option-${this.id}-${itemIndex + 1}" value="${item.value || item.title}" data-label="${item.title}">
              <label for="option-${this.id}-${itemIndex + 1}">
                <span class="title">${item.title}</span>
                ${item.description ? `<span class="description">${item.description}</span>` : ''}
                <span class="icon icon-checked"></span>
              </label>
          </div>`,
      );
      decorateIcons(dropdownItem);
      dropdownContent.appendChild(dropdownItem);
    });

    this.parentFormElement.appendChild(dropdown);
  }
}

// Static property to track if the click handler has been added
Dropdown.isClickHandlerAdded = false;

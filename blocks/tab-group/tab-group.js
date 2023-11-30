import { generateTabBlock } from '../tabs/tabs.js';

export default function decorate(block) {
  // each row is an accordion entry
  const tabs = [...block.children];

  // loop through all accordion blocks
  [...tabs].forEach((tab) => {
    // generate the accordion
    const tabDOM = generateTabBlock(tab);
    // empty the content ,keep root element with UE instrumentation
    tab.textContent = '';
    // add block classes
    tab.classList.add('tab', 'block');
    tab.append(tabDOM);
  });

  // use same styling as shade-box from /docs
  // block.classList.add('shade-box');
}

import { decorateIcons } from '../../scripts/lib-franklin.js';

export default function decorate(block) {
  const [noteTypeElement] = [...block.children].map((row) => row.firstElementChild);

  // Shouldn't apply to MD Github pages
  if (noteTypeElement && !noteTypeElement.querySelector('span.icon')) {
    const noteType = noteTypeElement?.textContent.trim().toLowerCase();
    const iconSpan = document.createElement('span');
    iconSpan.className = `icon icon-${noteType}`;
    noteTypeElement.prepend(iconSpan);
    block.classList.add('note', noteType);
    decorateIcons(block);
  }
}

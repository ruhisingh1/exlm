export default function decorate(block) {
  const [style, text] = [...block.children].map((row) => row.firstElementChild);

  const blockStyle = style.textContent().trim() || '';
  const blockText = text.textContent().trim() || '';

  block.innerHTML = '';
  const contentDiv = document.createElement('div');
  contentDiv.innerHTML = text.innerHTML
  block.append(contentDiv);
  block.classList.add('block-quote-content-test', blockStyle);
}

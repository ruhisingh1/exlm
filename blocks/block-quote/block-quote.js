export default function decorate(block) {
  const [style, text] = [...block.children].map((row) => row.firstElementChild);

  const blockStyle = style.textContent().trim() || '';
  const blockText = text.textContent().trim() || '';

  block.innerHTML = '';
  block.innerHTML = blockText.innerHTML;
  block.classList.add('block-quote-content-test', blockStyle);
}

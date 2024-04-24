export function extractAuthorInfo(block) {
  const authorInfo = [...block.children].map((row) => row.firstElementChild);
  return {
    authorImage: authorInfo[0] ?? '',
    authorName: authorInfo[1] ?? '',
    authorTitle: authorInfo[2] ?? '',
    authorCompany: authorInfo[3] ?? '',
    authorDescription: authorInfo[4] ?? '',
    authorSocialLinkText: authorInfo[5] ?? '',
    authorSocialLinkURL: authorInfo[6] ?? '',
  };
}

export async function fetchAuthorBio(anchor) {
  const link = anchor.href ? anchor.href : anchor;
  return fetch(link)
    .then((response) => response.text())
    .then((html) => {
      const parser = new DOMParser();
      const htmlDoc = parser.parseFromString(html, 'text/html');
      return extractAuthorInfo(htmlDoc.querySelector('.author-bio'));
    })
    .catch((error) => {
      console.error(error);
    });
}
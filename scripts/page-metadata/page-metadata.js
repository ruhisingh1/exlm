import { isArticleLandingPage, isArticlePage } from '../scripts.js';

function formatPageMetaTags(inputString) {
  return inputString
    .replace(/exl:[^/]*\/*/g, '')
    .split(',')
    .map((part) => part.trim());
}

function decodePageMetaTags() {
  const solutionMeta = document.querySelector(`meta[name="coveo-solution"]`);
  const roleMeta = document.querySelector(`meta[name="role"]`);
  const levelMeta = document.querySelector(`meta[name="level"]`);

  const solutions = solutionMeta ? formatPageMetaTags(solutionMeta.content) : [];
  const roles = roleMeta ? formatPageMetaTags(roleMeta.content) : [];
  const experienceLevels = levelMeta ? formatPageMetaTags(levelMeta.content) : [];

  const decodedSolutions = solutions.map((solution) => {
    // In case of sub-solutions. E.g. exl:solution/campaign/standard
    const parts = solution.split('/');
    const decodedParts = parts.map((part) => atob(part));

    // If it's a sub-solution, create a version meta tag
    if (parts.length > 1) {
      const versionMeta = document.createElement('meta');
      versionMeta.name = 'version';
      versionMeta.content = atob(parts.slice(1).join('/'));
      document.head.appendChild(versionMeta);
    }

    return decodedParts[0];
  });
  const decodedRoles = roles.map((role) => atob(role));
  const decodedLevels = experienceLevels.map((level) => atob(level));

  if (solutionMeta) {
    solutionMeta.content = decodedSolutions.join(',');
  }
  if (roleMeta) {
    roleMeta.content = decodedRoles.join(',');
  }
  if (levelMeta) {
    levelMeta.content = decodedLevels.join(',');
  }
}
if (
  document.documentElement.classList.contains('adobe-ue-edit') ||
  document.documentElement.classList.contains('adobe-ue-preview')
) {
  if (isArticleLandingPage() || isArticlePage()) {
    decodePageMetaTags();
  }
}

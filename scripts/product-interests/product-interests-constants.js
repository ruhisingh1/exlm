/* Component Mapping Config Keys & Labels (Placeholder values) */

import { fetchLanguagePlaceholders } from '../scripts.js';

let placeholders = {};
try {
  placeholders = await fetchLanguagePlaceholders();
} catch (err) {
  // eslint-disable-next-line no-console
  console.error('Error fetching placeholders:', err);
}

/**
 * Array containing expLevel (Experience Level) with associated metadata.
 * Each contentType object includes a id, value, title and description.
 * The title and description are fetched from language placeholders or falls back to a default description.
 */
const expLevel = [
  {
    id: 'Beginner',
    value: 'Beginner',
    title: 'Beginner'
  },
  {
    id: 'Intermediate',
    value: 'Intermediate',
    title: 'Intermediate'
  },
  {
    id: 'Experienced',
    value: 'Experienced',
    title: 'Experienced'
  },
].map((role) => ({
  ...role,
  ...(placeholders[`filterExpLevel${role.id}Title`] && { title: placeholders[`filterExpLevel${role.id}Title`] }),
  ...(placeholders[`filterExpLevel${role.id}Description`] && {
    description: placeholders[`filterExpLevel${role.id}Description`],
  }),
}));
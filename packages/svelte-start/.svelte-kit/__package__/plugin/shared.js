import { fileURLToPath } from 'node:url';
import path from 'pathe';
// svelte-package mirrors src/ into dist/ 1:1 (transpiling .ts to .js), so from
// dist/plugin/shared.js the default entries live one level up in
// dist/default-entry/. This differs from vue-start, whose custom vite build
// copies the raw sources to dist/plugin/default-entry instead.
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const defaultEntryDir = path.resolve(currentDir, '..', 'default-entry');
export const svelteStartDefaultEntryPaths = {
    client: path.resolve(defaultEntryDir, 'client.js'),
    server: path.resolve(defaultEntryDir, 'server.js'),
    start: path.resolve(defaultEntryDir, 'start.js'),
};

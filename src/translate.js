/**
 * translate.js — entry point for translate.html
 * Boots the shared app shell with the translate mode controller.
 */

import { initApp } from './appShell.js';
import { createTranslateMode } from './translateMode.js';

initApp(createTranslateMode());

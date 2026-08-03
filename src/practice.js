/**
 * practice.js — entry point for practice.html
 * Boots the shared app shell with the practice mode controller.
 */

import { initApp } from './appShell.js';
import { createPracticeMode } from './practiceMode.js';

initApp(createPracticeMode());

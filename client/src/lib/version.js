// Build stamp, replaced at compile time by the `define` in vite.config.js — so
// every server deploy re-dates itself with no code edit. Set VITE_APP_VERSION
// in the environment to pin it instead (reproducible builds).
export const APP_VERSION = `v.${import.meta.env.VITE_APP_VERSION}`;

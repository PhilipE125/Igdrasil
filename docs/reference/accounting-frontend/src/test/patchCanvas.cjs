'use strict';
// Preload script (--require): patches Node's module loader before jsdom starts.
// jsdom calls require.resolve("canvas") first (succeeds — package exists), then
// calls require("canvas") outside a try/catch, which crashes when the native
// canvas.node binary is missing. Returning {} makes jsdom treat canvas as
// unavailable and fall back gracefully (Canvas.createCanvas won't be defined).
const Module = require('module');
const originalLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'canvas') {
    return {};
  }
  return originalLoad.apply(this, arguments);
};

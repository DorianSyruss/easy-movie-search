'use strict';

import { minYear, maxYear } from './config';

function parseHtml(html) {
  let parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}

function fetchDocument(url) {
  return fetch(url)
    .then(response => response.json())
    .then(html => parseHtml(html))
}

function createError(code, msg) {
  let err = new Error(msg);
  err.code = code;
  return err;
}

function parseYear(input) {
  let year = Number(input);
  if (isNaN(year)) {
    return [createError(Error.INVALID_INPUT ,'Invalid year!')];
  }
  if (year < minYear || year > maxYear) {
    return [createError(Error.OUT_OF_RANGE, 'Year is not in allowed range. (min: 1950, max: 2030)')];
  }
  return [, year];
}

module.exports = {
  fetchDocument,
  parseYear
};

'use strict';

import $ from 'jquery';
import { proxy, minYear, maxYear, defaultYear } from './config';
let urlJoin = require('url-join');

function parseHtml(html) {
  let parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}

function fetchDocument(url) {
  return fetch(url)
    .then(response => response.json())
    .then(html => parseHtml(html))
}

function errorMsg(year) {
  let errorMsg = $('.errorMsg');
  let noQuerryMsg = $('.noQueryMsg');
  if (isNaN(Number(year)) || year.length === 0) {
    errorMsg
      .text('Please input a valid year')
      .slideDown('fast');
  }
  else if (Number(year) < minYear || Number(year) > maxYear) {
    errorMsg
      .text('Oh Snap! Year is not in range (min: 1950, max: 2030)')
      .slideDown('fast');
  }
  else {
    errorMsg.css('display', 'none');
    noQuerryMsg.css('display', 'none');
  }
}

function parseInput() {
  let year = $('#inputYear').val();
  $('#inputYear').val('');
  errorMsg(year);
  $('.movies').empty();
  $('.loader').fadeIn('fast');
  $('#movieYear').text(year);
  return year;
}

function fullUrl(year = defaultYear) {
  return urlJoin(proxy, 'http://www.imdb.com/year/', year)
}

module.exports = {
  fetchDocument,
  parseInput,
  fullUrl
};

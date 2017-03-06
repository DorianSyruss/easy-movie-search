'use strict';

import $ from 'jquery';
import { proxy, minYear, maxYear, defaultYear } from './config';
let urljoin = require('url-join');

function parseHtml(html) {
  let parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}

module.exports.fetchDocument = function(url) {
  return fetch(url)
    .then(response => response.json())
    .then(html => parseHtml(html))
};

module.exports.parseInput = function() {
  let year = $('#inputYear').val();
  let errorMsg = $('.errorMsg');
  let noQuerryMsg = $('.noQueryMess');
  $('#inputYear').val('');

  if (isNaN(Number(year)) || year.length === 0) {
    errorMsg
      .text('Please input a valid year')
      .slideDown('fast');
    return '';
  }
  else if (year < minYear || year > maxYear) {
    errorMsg
      .text('Oh Snap! Year is not in range (min: 1950, max: 2030)')
      .slideDown('slow');
    return '';
  }
  else {
    errorMsg.css('display', 'none');
    noQuerryMsg.css('display', 'none');
    $('.movies').empty();
    $('.loader').fadeIn('fast');
    console.log(year);
    $('#movieYear').text(year);
    return year;
  }
};

module.exports.fullUrl = function(year = defaultYear) {
  return urljoin(proxy, 'http://www.imdb.com/year/', year)
};



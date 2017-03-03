import $ from 'jquery';
import { proxy, minYear, maxYear, defaultYear } from './config';

function parseHtml(html) {
  let parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}

exports.fetchDocument = function(url) {
  return fetch(url)
    .then((response) => response.json())
    .then(html => parseHtml(html))
}

exports.parseInput = function() {
  let inputYear = $('#inputYear').val();
  let errorMess = $('.errorMess');
  let noQuerryMess = $('.noQueryMess');
  $('#inputYear').val('');

  if (isNaN(Number(inputYear)) || inputYear.length === 0) {
    errorMess
      .text('Please input a valid year')
      .slideDown('fast');

    return '';
  }
  else if (inputYear < minYear || inputYear > maxYear) {
    errorMess
      .text('Oh Snap! Year is not in range (min: 1950, max: 2030)')
      .slideDown('slow');

    return '';
  }
  else {
    errorMess.css('display', 'none');
    noQuerryMess.css('display', 'none');
    $('.movies').empty();
    $('.loader').fadeIn('fast');
    $('#movieYear').val(inputYear);

    return inputYear;
  }
}

exports.fullUrl = function(year = defaultYear) {
  return `${proxy}http://www.imdb.com/year/${year}`;
}

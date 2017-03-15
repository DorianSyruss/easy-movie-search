'use strict';

require('./../style/main.scss');

import 'whatwg-fetch';
import $ from 'jquery';
import urlJoin from 'url-join';
import queryString from 'querystring';
import './errors';
import { parseMovies, renderMovie, parseMovieCount, renderMovieCount } from './Movies';
import { fetchDocument, parseYear } from './Utils';
import { proxyUrl, baseUrl, maxDisplayCount} from './config';

const ENTER = 13;

// flash errors
const messages = {
  [Error.INVALID_INPUT]: 'Please enter a valid year',
  [Error.NO_INPUT]: 'Please enter a valid year',
  [Error.OUT_OF_RANGE]: 'Year is out of range ( 1950 - 2030 )',
  [Error.NO_RESULTS]: 'Oh Snap! No Queries Matched... Please try again!'
};

class Loader {
  constructor(el){ this.$el = $(el); }
  start() { this.$el.fadeIn('fast'); }
  stop () { this.$el.fadeOut('fast'); }
}

// ui elements
const $btnList = $('#btnList');
const $btnPrev = $('.button-previous');
const $btnNext = $('.button-next');
const $pagination = $('.sn-pagination');
const $yearField = $('#yearField');
const $yearTitle = $('#yearTitle');
const $movieList = $('.movies');
const $movieCount = $('.movie-count');
const $flashMessage = $('.flash-message');
const loader = new Loader('.loader');
const query = {
  sortBy: 'moviemeter',
  year: (new Date()).getFullYear(),
  page: 1
};


// wire-up event listeners
$btnList.click(() => {
  query.page = 1;
  listTopMovies(readYear())
});

$yearField.keyup(e => {
  if (e.keyCode !== ENTER) return;
  query.page = 1;
  listTopMovies(readYear());
});

$btnPrev.click(() => {
  if(query.page > 1){
    query.page--;
    listTopMovies(query.year);
  }
});

$btnNext.click(() => {
  query.page++;
  listTopMovies(query.year);
});

function setDisabled($input, disabled=true) {
  $input.prop('disabled', disabled);
}

// initial rendering
loader.start();
listTopMovies(query.year);

function readYear() {
  let year = $yearField.val();
  $yearField.val('');
  return year;
}

const flashMessage = err => messages[err.code || 'default'];

function listTopMovies(input) {
  $pagination.hide();
  setDisabled($yearField);
  let [ err, year ] = parseYear(input);

  // reset ui
  $movieList.empty();
  $movieCount.empty();
  $flashMessage.hide();

  // show error on invalid input
  if (err) {
    $flashMessage
      .addClass('.error')
      .text(flashMessage(err))
      .slideDown('fast');

    setDisabled($yearField, false);
    return;
  }

  // set query params
  query.year = year;

  // update title
  $yearTitle.text(query.year);

  // fetch movies
  loader.start();
  fetchData()
    .then(([movies, movieCount]) => {
      loader.stop();
      setDisabled($yearField, false);
      // update movie list
      if (movies.length !== 0) {
        movies.forEach(movie => renderMovie($movieList, movie));
        renderMovieCount($movieCount, movieCount, maxDisplayCount, query.page);
        if( movieCount.total > maxDisplayCount ) {
          $pagination.show();
        }
        else{
          $pagination.hide();
        }
        return;
      }

      // show error if no movies found
      $flashMessage
        .addClass('.error')
        .text(messages[Error.NO_RESULTS])
        .fadeIn('slow');
    });
}

function getUrl() {
  let qString = queryString.stringify({year: query.year, title_type: 'feature', page: query.page}, '&', '=');
  return urlJoin(proxyUrl, baseUrl, `search/title?${qString}`);
}

function fetchData() {
  return fetchDocument(getUrl())
    .then(doc => [
      parseMovies(doc),
      parseMovieCount(doc)
    ]);
}

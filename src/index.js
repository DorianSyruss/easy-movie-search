'use strict';

require('./../style/main.scss');

import 'whatwg-fetch';
import $ from 'jquery';
import urlJoin from 'url-join';
import './errors';
import { parseMovies, renderMovie } from './Movies';
import { fetchDocument, parseYear } from './Utils';
import { proxyUrl, baseUrl } from './config';

const ENTER = 13;

// flash errors
const messages = {
  [Error.INVALID_INPUT]: 'Please enter a valid year',
  [Error.NO_INPUT]: 'Please enter a valid year',
  [Error.OUT_OF_RANGE]: 'Year is out of range ( 1950 - 2030 )',
  [Error.NO_RESULTS]: 'Oh Snap! No Queries Matched... Please try again!'
};

class Loader {
  constructor(loader){
    this.$loader = $(loader);
  }
  start() {this.$loader.fadeIn('fast')};
  stop () {this.$loader.fadeOut('fast')};
}

// ui elements
const $btnList = $('#btnList');
const $yearField = $('#yearField');
const $yearTitle = $('#yearTitle');
const $movieList = $('.movies');
const $flashMessage = $('.flash-message');
const loader = new Loader('.loader');

// wire-up event listeners
$btnList.click(() => listTopMovies(readYear()));
$yearField.keyup(e => {
  if (e.keyCode !== ENTER) return;
  listTopMovies(readYear());
});

function setDisabled($input, disabled=true) {
  $input.prop('disabled', disabled);
}

// initial rendering
loader.start();
listTopMovies((new Date()).getFullYear());


function readYear() {
  let year = $yearField.val();
  $yearField.val('');
  return year;
}

const flashMessage = err => messages[err.code || 'default'];

function listTopMovies(input) {
  setDisabled($yearField);
  let [ err, year ] = parseYear(input);

  // reset ui
  $movieList.empty();
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

  // update title
  $yearTitle.text(year);

  // fetch movies
  loader.start();
  fetchMovies(year)
    .then(movies => {
      loader.stop();
      setDisabled($yearField, false);

      // update movie list
      if (movies.length !== 0) {
        movies.forEach(movie => renderMovie($movieList, movie));
        return;
      }

      // show error if no movies found
      $flashMessage
        .addClass('.error')
        .text(messages[Error.NO_RESULTS])
        .fadeIn('slow');
    });
}

function fetchMovies(year) {
  let url = urlJoin(proxyUrl, baseUrl, 'search/title?', '/year=/', year, '&view=advanced', '&view=advanced&page=1', '&sort=moviemeter,asc' );
  console.log(url);
  return fetchDocument(url).then(doc => parseMovies(doc));
}


'use strict';

import 'whatwg-fetch';
import $ from 'jquery';
import urlJoin from 'url-join';
import qs from 'querystring';
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
const $sortButtonList = $('.sortBy li span');
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
  sort: 'moviemeter',
  title_type: 'feature',
  year: (new Date()).getFullYear(),
  page: 1
};

// wire-up event listeners
$btnList.click(() => {
  query.page = 1;
  listTopMovies(query, readYear());
});

$yearField.keyup(e => {
  if (e.keyCode !== ENTER) return;
  query.page = 1;
  listTopMovies(query, readYear());
});

$btnNext.click(() => {
  query.page++;
  listTopMovies(query);
});

$btnPrev.click(() => {
  if (query.page <= 1) return;
  query.page--;
  listTopMovies(query);
});

// 'Sort By' buttons, wire-up event listeners

$sortButtonList.click(({ target: el }) => {
  let $button = $(el);
  query.sort = $button.data('sort-method');
  focusClickedItem(query.sort);
  listTopMovies(query);
});


function focusClickedItem(sortMethod='moviemeter') {
  $sortButtonList.each((i, el) => {
    let $button = $(el);
    $button.toggleClass('clicked', $button.data('sort-method') === sortMethod);
  });
}

function setDisabled($input, disabled=true) {
  $input.prop('disabled', disabled);
}

const flashMessage = err => messages[err.code || 'default'];

// initial rendering
loader.start();
listTopMovies(query);

function readYear() {
  let year = $yearField.val();
  $yearField.val('');
  return year;
}

function listTopMovies(query, yearStr) {
  $pagination.hide();
  setDisabled($yearField);
  let [ err, year ] = parseYear(yearStr || query.year);

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

  let queryStr = qs.stringify(query, '&', '=');
  let url = urlJoin(proxyUrl, baseUrl, '/search/title/', `?${queryStr}`);

  return fetchDocument(url)
    .then(doc => [
      parseMovies(doc),
      parseMovieCount(doc)
    ])
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

'use strict';

import 'whatwg-fetch';
import $ from 'jquery';
import urlJoin from 'url-join';
import qs from 'querystring';
import './errors';
import { parseMovies, renderMovie, parseMovieCount, renderMovieCount } from './Movies';
import { fetchDocument, parseYear } from './Utils';
import { proxyUrl, baseUrl, maxDisplayCount } from './config';

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
const $window = $(window);
const $document = $(document);
const $sortButtonList = $('.sortBy li button');
const $btnList = $('#btnList');
const $yearField = $('#yearField');
const $yearTitle = $('#yearTitle');
const $movieList = $('.movies');
const $movieCount = $('.movie-count');
const $arrowToTop = $('.arrowToTop');
const $movieImg = $('.movies .movie img');
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
  $movieList.empty();
  query.page = 1;
  listTopMovies(query, readYear());
});

$yearField.keyup(e => {
  if (e.keyCode !== ENTER) return;
  $movieList.empty();
  query.page = 1;
  listTopMovies(query, readYear());
});

// 'Sort By' buttons, wire-up event listeners

$sortButtonList.click(({ target: el }) => {
  let $button = $(el);
  setDisabled($yearField, $sortButtonList);
  $movieList.empty();
  query.page = 1;
  query.sort = $button.data('sort-method');
  focusactiveItem(query.sort);
  listTopMovies(query);
});


function focusactiveItem(sortMethod='moviemeter') {
  $sortButtonList.each((i, el) => {
    let $button = $(el);
    $button.toggleClass('active-sort', $button.data('sort-method') === sortMethod);
  });
}

function setDisabled($input, button, disabled=true) {
  let $button = $(button);
  $input.prop('disabled', disabled);
  $button.prop('disabled', disabled);
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
  setDisabled($yearField, $sortButtonList);
  let [ err, year ] = parseYear(yearStr || query.year);

  // reset ui
  $movieCount.empty();
  $flashMessage.hide();

  // show error on invalid input
  if (err) {
    $flashMessage
      .addClass('.error')
      .text(flashMessage(err))
      .slideDown('fast');

    setDisabled($yearField, $sortButtonList, false);
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
      setDisabled($yearField, $sortButtonList, false);
      // update movie list
      if (movies.length !== 0) {
        movies.forEach(movie => renderMovie($movieList, movie));
        renderMovieCount($movieCount, movieCount, maxDisplayCount, query.page);
        $movieImg.click(() => {
          getMovieImg();
          return false;
        });
        return;
      }

      // show error if no movies found
      $flashMessage
        .addClass('.error')
        .text(messages[Error.NO_RESULTS])
        .fadeIn('slow');
    });
}

/* infinite scroll */

$window.scroll(function() {
  if ($(this).scrollTop()) {
    $arrowToTop.fadeIn();
  } else {
    $arrowToTop.fadeOut();
  }
  console.log($document.height());
    if($window.scrollTop() === $document.height() - $window.height()) {
      query.page++;
      listTopMovies(query);
    }
});

/* scroll to top */

$arrowToTop.click(() => {
  $('html, body').animate({ scrollTop: 0 }, 'slow');
  return false;
});





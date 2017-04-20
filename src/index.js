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

let pagesFlag = true;

// ui elements
const $titleYear = $('#title-year');
const $htmlBody = $('html, body');
const $window = $(window);
const $document = $(document);
const $sortButtonList = $('.sort-filters button');
const $btnList = $('#btnList');
const $yearField = $('#yearField');
const $yearTitle = $('#yearTitle');
const $movieList = $('.movies');
const $movieCount = $('.movie-count');
const $arrowToTop = $('.arrowToTop');
const $modal = $('.modal');
const $modalImg = $('.img-modal img');
const $flashMessage = $('.flash-message');
const loader = new Loader('.spinner');
const movieImgSelector = '.movie img';

const query = {
  sort: 'moviemeter',
  title_type: 'feature',
  year: (new Date()).getFullYear(),
  page: 1
};

//set default search year in title
$titleYear.text(query.year);

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
  setActiveSort(query.sort);
  listTopMovies(query);
});

$modal.click(e => $(e.currentTarget).modal('hide'));

function setActiveSort(sortMethod='moviemeter') {
  $sortButtonList.each((i, el) => {
    let $button = $(el);
    $button.toggleClass('active-sort', $button.data('sort-method') === sortMethod);
  });
}

function setDisabled($input, $button, disabled=true) {
  $input.prop('disabled', disabled);
  $button.prop('disabled', disabled);
}

function delayFlashHide() {
    setTimeout(() => {
        $flashMessage.slideUp();
    }, 3000);
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
  pagesFlag = true;
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
    delayFlashHide();
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

      // to disable further searching if there's less then one page of content
      if (movieCount.total <= 50){
        pagesFlag = false;
      }

      // update movie list
      if (movies.length !== 0) {
        movies.forEach(movie => renderMovie($movieList, movie));
        renderMovieCount($movieCount, movieCount, maxDisplayCount, query.page);
        return;
      }

      // show error if no movies found
      $flashMessage
        .addClass('.error')
        .text(messages[Error.NO_RESULTS])
        .fadeIn('slow');
      delayFlashHide();
    });
}

/* infinite scroll */

let isRendered = false;

$window.scroll(e => {
  if ($(e.target).scrollTop() && isRendered === false) {
    $arrowToTop.fadeIn();
    isRendered = true;
  }
  else if ($(e.target).scrollTop() === 0 && isRendered === true) {
    $arrowToTop.fadeOut();
    isRendered = false;
  }

  if (($window.scrollTop() === $document.height() - $window.height()) && pagesFlag) {
    query.page++;
    listTopMovies(query);
  }
});

/* scroll to top */

$arrowToTop.click(() => {
  $htmlBody.animate({ scrollTop: 0 }, 'slow');
  return false;
});

/* large img display */

$movieList.on('click', movieImgSelector, (e) => {
  let srcStr = $(e.target).attr('src');
  displayLargeImg(srcStr);
  e.preventDefault();
});

function displayLargeImg(src) {
  let url = src.replace(/\._V(.*)$/, '.jpg');
  $modalImg.attr('src', url);
}

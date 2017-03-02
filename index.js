/**
 * Created by engine on 22/02/2017.
 */
require('./style/main.scss');

import 'whatwg-fetch';
import $ from 'jquery';

const proxy = 'https://cors.now.sh/';
const maxYear = 2050;
const minYear = 1950;
const defaultYear = (new Date()).getFullYear()

let sendInput = $('#sendInput');
sendInput.on('click', getYearUrl);

let inputYear = $('#inputYear');
inputYear.keyup(function (event) {
  if (event.keyCode == 13) {
    sendInput.click();
  }
});

function fullUrl(year) {
  return `${proxy}http://www.imdb.com/year/${year}`;
}

function listTopMovies(fullUrl) {
  fetchDocument(fullUrl)
    .then(doc => getMovies($(doc)))
    .then(movies => {
      $('.loader').fadeOut('fast');
      if (movies.length !== 0) {
        renderMovies(movies);
      } else {
        $('.movies').empty();
        $('.noQueryMess').fadeIn('slow');
      }
    });
}

function getYearUrl() {
  let inputYear = $('#inputYear').val();
  let errorMess = $('.errorMess');
  let noQuerryMess = $('.noQueryMess');
  $('#inputYear').val('');

  if (isNaN(Number(inputYear)) || inputYear.length === 0) {
    errorMess
      .text('Please input a valid year')
      .slideDown('slow');
  }
  else if (inputYear < minYear || inputYear > maxYear) {
    errorMess
      .text('Oh Snap! Year is not in range (min: 1950, max: 2030)')
      .slideDown('slow');
  }
  else {
    errorMess.css('display', 'none');
    noQuerryMess.css('display', 'none');
    $('.movies').empty();
    $('.loader').fadeIn('fast');
    $('#movieYear').val(inputYear);
    listTopMovies(fullUrl(inputYear));
  }
}

function fetchDocument(url) {
  return fetch(url)
    .then((response) => response.json())
    .then(html => parseHtml(html))
}

const map = (iterable, fn) => [].map.call(iterable, fn);

function parseHtml(html) {
  let parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}

function getMovies($doc) {
  let $rows = $($doc).find('table.results tr');
  return $rows.map((_, el) => parseMovie($(el))).get();
}

function parseMovie($row) {
  let title = $($row).find('td.title > a').text().trim();
  let titleUrl = $($row).find('td.title > a').attr('href');
  let rating = parseFloat($($row).find('span.rating-rating').text().trim().split('/')[0]) || undefined;
  let desc = $($row).find('span.outline').text().trim();
  let imgUrl = $($row).find('.image img').attr('src');
  let genre = $($row).find('.title .genre').text().trim();

  return { title, titleUrl, rating, desc, imgUrl, genre };
}

function renderMovie($output, movie) {
  const movieUrl = `http://www.imdb.com${movie.titleUrl}`;
  let html = `<a href = ${movieUrl} target='_blank' class = 'movie list-group-item list-group-item:hover'>
               <div class='title'><span>${movie.title}</span></div> 
                   <img src='${movie.imgUrl}' alt=''>
                   <span class = 'content-right'>
                       <div class='rating'>${movie.rating || 'not rated' } <span class='glyphicon glyphicon-star'></span></div> 
                       <div class='desc'>${movie.desc}</div>
                       <div class='genre'>${movie.genre}</div>
                   </span>
                </a>`;
  $output.append(html);
}

function renderMovies(movies) {
  let $output = $('.movies');
  $output.empty();
  movies.forEach(movie => renderMovie($output, movie));
}
$('.loader').fadeIn('medium');
listTopMovies(fullUrl(defaultYear));






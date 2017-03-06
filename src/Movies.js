'use strict';

import $ from 'jquery';
let urljoin = require('url-join');

let findInContext = function($context, selector) {
  return $context.find(selector);
};

function parseMovie($row) {
  let title = findInContext($row, 'td.title > a').text().trim();
  let titleUrl = findInContext($row, 'td.title > a').attr('href');
  let rating = parseFloat($row.find('span.rating-rating').text().trim().split('/')[0]) || undefined;
  let desc = findInContext($row, 'span.outline').text().trim();
  let imgUrl = findInContext($row, '.image img').attr('src');
  let genre = findInContext($row, '.title .genre').text().trim();

  return { title, titleUrl, rating, desc, imgUrl, genre };
}

function renderMovie($output, movie) {
  const movieUrl = urljoin('http://www.imdb.com', movie.titleUrl);
  let html = `
    <a href = ${movieUrl} target='_blank' class = 'movie list-group-item list-group-item:hover'>
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

module.exports.get = function($doc) {
  let $rows = $($doc).find('table.results tr');
  return $rows.map((_, el) => parseMovie($(el))).get();
};

module.exports.render = function(movies) {
  let $output = $('.movies');
  $output.empty();
  movies.forEach(movie => renderMovie($output, movie));
};

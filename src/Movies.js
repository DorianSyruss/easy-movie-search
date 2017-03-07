'use strict';

import $ from 'jquery';
import { baseUrl } from './config';
import urlJoin from 'url-join';

function getText($context, selector) {
  return $context.find(selector).text().trim();
}
function getAttribute($context, selector, attr) {
  return $context.find(selector).attr(attr);
}

function parseMovie($row) {
  let title = getText($row, 'td.title > a');
  let url = getAttribute($row, 'td.title > a', 'href');
  let rating = parseFloat(getText($row, 'span.rating-rating').split('/')[0]) || undefined;
  let desc = getText($row, 'span.outline');
  let imgUrl = getAttribute($row, '.image img', 'src');
  let genre = getText($row, '.title .genre');

  return { title, url, rating, desc, imgUrl, genre };
}

function renderMovie($output, movie) {
  let html = `
    <a href=${ urlJoin(baseUrl, movie.url) } target="_blank" class='movie list-group-item list-group-item:hover'>
      <div class='title'><span>${movie.title}</span></div> 
      <img src='${movie.imgUrl}' alt=''>
      <span class = 'content-right'>
        <div class='rating'>${movie.rating || 'not rated' }<span class='glyphicon glyphicon-star'></span></div> 
        <div class='desc'>${movie.desc}</div>
        <div class='genre'>${movie.genre}</div>
      </span>
    </a>`;
  $output.append(html);
}

function parseMovies(doc) {
  let $rows = $(doc).find('table.results tr');
  return $rows.map((_, el) => parseMovie($(el))).get();
}

module.exports = { parseMovies, renderMovie };

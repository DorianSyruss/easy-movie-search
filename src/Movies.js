'use strict';

import $ from 'jquery';
import { baseUrl } from './config';
import urlJoin from 'url-join';

function getAttribute($context, selector, attr) {
  return $context.find(selector).attr(attr);
}

function getText($context, selector, index = 0) {
  return $context.find(selector).eq(index).text().trim();
}

function getTotal(str) {
  let tokens = str.split(/\s+/);
  let total = tokens[4] || tokens[0];
  return parseInt(total.replace(/\D/g, ''), 10);
}

function parseMovie($row) {
  let title = getText($row, '.lister-item-header a');
  let url = getAttribute($row, '.lister-item-header a', 'href');
  let rating = parseFloat(getAttribute($row, '.ratings-imdb-rating', 'data-value')) || undefined;
  let metascore = parseFloat(getText($row, '.metascore')) || undefined;
  let runtime = parseFloat(getText($row, '.text-muted .runtime')) || undefined;
  let desc = getText($row, '.text-muted', 2); //Used when there is no specific class on element
  let imgUrl = getAttribute($row, '.lister-item-image img', 'loadlate');
  let genre = getText($row, '.text-muted .genre');
  let votes = getAttribute($row, '.sort-num_votes-visible span[data-value]', 'data-value');

  return { title, url, rating, metascore, runtime, desc, imgUrl, genre, votes };
}

function parseMovieCount(doc) {
  let $article = $(doc).find('#main .article');
  let $nav = $article.find('.lister .nav .desc').eq(0);
  let total = getTotal($nav.text().trim());
  return { total };
}

function renderMovieCount($output, movieCount){
  let html = `
    <p>Showing ${movieCount.total} movies</p>`;
  $output.html(html);
}

function renderMovie($output, movie) {
  let html=`<a href="${ urlJoin(baseUrl, movie.url) }" target="_blank" class="movie list-group-item panel ">
      <div class="title"><span>${movie.title}</span></div>
      <img class="movie-img-small" src="${movie.imgUrl}" data-toggle="modal" data-target=".img-modal">
      <span class = "content-right">
        <ul class="movie-details">
          <li class="rating">${movie.rating || 'not rated' }<span class="icon-star"></span></li>
          <li class="metascore">${movie.metascore || 'not rated' }<span><img src="../assets/img/meta.png"></span></li>
          <li class="runtime">${movie.runtime || 'N/A'}<span> min</span></li>
          <li class="genre">${movie.genre}</li>
        </ul>
          <div class="desc">${movie.desc}</div>
          <div class="votes">Votes: ${movie.votes || 'N/A'}</div>
      </span>
    </a>`;
  $output.append(html);
}

function parseMovies(doc) {
  let $rows = $(doc).find('#main .article .lister-list .lister-item');
  return $rows.map((_, el) => parseMovie($(el))).get();
}

module.exports = { parseMovies, renderMovie, parseMovieCount, renderMovieCount };

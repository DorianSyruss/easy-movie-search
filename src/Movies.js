'use strict';

import $ from 'jquery';
import { baseUrl } from './config';
import urlJoin from 'url-join';

function getAttribute($context, selector, attr) {
  return $context.find(selector).attr(attr);
}

function getText($context, selector) {
  return $context.find(selector).text().trim();
}

function getSpecificContentArray($context, selector, i) {
  return $($context.find(selector)[i]).text().trim();
}

function getTotal(str) {
  let total = str.split(/\s+/)[4] || str.split(/\s+/)[0];
  return parseInt(total.replace(/,/g, ''), 10);
}

function parseMovie($row) {
  let title = getText($row, '.lister-item-header a');
  let url = getAttribute($row, '.lister-item-header a', 'href');
  let rating = parseFloat(getAttribute($row, '.ratings-imdb-rating', 'data-value')) || undefined;
  let metascore = parseFloat(getText($row, '.metascore')) || undefined;
  let runtime = parseFloat(getText($row, '.text-muted .runtime')) || undefined;
  let desc = getSpecificContentArray($row, '.text-muted', 2); //Used when there is no specific class on element
  let imgUrl = getAttribute($row, '.lister-item-image img', 'loadlate');
  let genre = getText($row, '.text-muted .genre');
  let votes = getSpecificContentArray($row, '.sort-num_votes-visible span', 1);

  return { title, url, rating, metascore, runtime, desc, imgUrl, genre, votes };
}

function parseMovieCount(doc) {
  let $article = $(doc).find('#main .article');
  let $nav = $article.find('.lister .nav .desc');
  let total = getTotal($nav.text().trim());
  return { total };
}

function renderMovieCount($output, movieCount){
  let html = `
    <p>Showing ${movieCount.total} movies</p>`;
  $output.html(html);
}

function renderMovie($output, movie) {
  let html=`<a href="${ urlJoin(baseUrl, movie.url) }" target="_blank" class="movie list-group-item">
      <div class="title"><span>${movie.title}</span></div> 
      <img src="${movie.imgUrl}" data-toggle="modal" data-target=".img-modal">
      <span class = "content-right">
        <ul class="movie-details">
          <li class="rating">${movie.rating || "not rated" }<span class="icon-star"></span></li> 
          <li class="metascore">${movie.metascore || "not rated" }<span> Metascore</span></li>
          <li class="runtime">${movie.runtime + " min" || "unknown: min"}</li>
          <li class="genre">${movie.genre}</li>
        </ul>
          <div class="desc">${movie.desc}</div>
          <div class="votes">${"Votes: " + movie.votes}</div>
      </span>
    </a>`;
  $output.append(html);
}

function parseMovies(doc) {
  let $rows = $(doc).find('#main .article .lister-list .lister-item');
  return $rows.map((_, el) => parseMovie($(el))).get();
}

module.exports = { parseMovies, renderMovie, parseMovieCount, renderMovieCount };

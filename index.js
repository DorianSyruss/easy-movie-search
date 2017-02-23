/**
 * Created by engine on 22/02/2017.
 */
import 'whatwg-fetch';

const proxy = 'https://cors.now.sh/';

let sendInput = document.getElementById('sendInput');
sendInput.addEventListener('click', getYearUrl,false);

function proxiedUrl() {
  const baseUrl = `${proxy}http://www.imdb.com/year/2017/`;
  return baseUrl;
}

function getYearUrl() {
  let yearUrl = 'http://www.imdb.com/year/';
  let inputYear = document.getElementById('inputYear').value;
  document.getElementById('movieYear').innerHTML = inputYear;
  yearUrl = `${yearUrl}${inputYear}`;
  let fullUrl = `${proxy}${yearUrl}`;
  fetchDocument(fullUrl)
    .then($doc => getMovies($doc))
    .then(movies => {
      console.table(movies);
      renderMovies(movies);
    });
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

function findOne($context, selector) {
  return $context.querySelector(selector) || {textContent: ''};
}

function getMovies($doc) {
  let $row = $doc.querySelectorAll('table.results tr');
  return map($row, parseMovie);
}

function parseMovie($row) {
  let title = findOne($row, 'td.title > a').textContent.trim();
  let titleUrl = findOne($row, 'td.title > a').getAttribute('href');
  let rating = parseFloat(findOne($row, 'span.rating-rating').textContent.trim().split('/')[0]) || undefined;
  let desc = findOne($row, 'span.outline').textContent.trim();
  let imgUrl = findOne($row, '.image img').getAttribute('src');
  let genre = findOne($row, '.title .genre').textContent.trim();

  return {
    title,
    titleUrl,
    rating,
    desc,
    imgUrl,
    genre,
  }
}

function renderMovie($output, movie) {
  const movieUrl = `http://www.imdb.com${movie.titleUrl}`;
  let html = `<div class = "movie">
       <div class="title"><a href ="${movieUrl}" target="_blank">${movie.title}</a></div> 
           <img src="${movie.imgUrl}" alt="">
           <div class = "content-right">
               <div class="rating">${movie.rating || 'not rated' }</div> 
               <div class="desc">${movie.desc}</div>
               <div class="genre">${movie.genre}</div>
           </div>
        </div>`;
  $output.innerHTML += html;
}


function renderMovies(movies) {
  let $output = document.querySelector('.movies');
  $output.innerHTML='';
  console.log("nestoooo");
  movies.forEach(movie => renderMovie($output, movie));
}


fetchDocument(proxiedUrl())
  .then($doc => getMovies($doc))
  .then(movies => {
    console.table(movies);
    renderMovies(movies);
  });




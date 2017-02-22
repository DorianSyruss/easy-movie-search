/**
 * Created by engine on 22/02/2017.
 */
import 'whatwg-fetch';

const proxy = 'https://cors.now.sh/';
const url = 'http://www.imdb.com/year/2017/'
const fullUrl = `${proxy}${url}`;

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
    return $context.querySelector(selector) || { textContent: '' };
}

function getMovies($doc) {
    let $row = $doc.querySelectorAll('table.results tr');
    return map($row, parseMovie);
}

function parseMovie($row) {
    let title = findOne($row, 'td.title > a').textContent.trim();
    let rating = parseFloat(findOne($row, 'span.rating-rating').textContent.trim().split('/')[0]) || undefined;
    let desc = findOne($row, 'span.outline').textContent.trim();
    let imgUrl = findOne($row, '.image img').getAttribute('src');

    return {
        title,
        rating,
        desc,
        imgUrl
    }
}

function renderMovie($output, movie) {
    let html = `<div class = "movie">${movie.title}</div>`;
    $output.innerHTML += html;
}


function renderMovies(movies) {
    let $output = document.querySelector('.movies');
    movies.forEach(movie => renderMovie($output, movie));
}

fetchDocument(fullUrl)
    .then($doc => getMovies($doc))
    .then(movies => renderMovies(movies));


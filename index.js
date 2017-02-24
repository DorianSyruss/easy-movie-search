/**
 * Created by engine on 22/02/2017.
 */
import 'whatwg-fetch';
import $ from "jquery";

const proxy = 'https://cors.now.sh/';
const maxYear = 2050;
const minYear = 1950;

let sendInput = document.getElementById('sendInput');
sendInput.addEventListener('click', getYearUrl, false);

$("#inputYear").keyup(function(event){
  if(event.keyCode == 13){
    $("#sendInput").click();
  }
});

function proxiedUrl() {
  const baseUrl = `${proxy}http://www.imdb.com/year/2017/`;
  return baseUrl;
}

function listTopMovies(fullUrl) {
  fetchDocument(fullUrl)
    .then($doc => getMovies($doc))
    .then(movies => {
      $('.loader').fadeOut('fast');
      if(movies.length !== 0) {
        renderMovies(movies);
      }else{
        document.querySelector('.movies').innerHTML='';
        $( ".noQueryMess" ).fadeIn( "slow");
      }
    });
}

function getYearUrl() {
  let yearUrl = 'http://www.imdb.com/year/';
  let inputYear = document.getElementById('inputYear').value;
  let errorMess = $('.errorMess');
  document.getElementById('inputYear').value='';
  if(isNaN(Number(inputYear)) || inputYear.length === 0) {
    errorMess.text("Please input a valid year");
    errorMess.slideDown( "slow");
  }
  else if (inputYear < minYear || inputYear > maxYear){
    errorMess.text("Year is not in range (min: 1950, max: 2030)");
    errorMess.slideDown( "slow");
  }
  else {
    $( ".errorMess" ).css( "display", "none");
    $(".noQueryMess").css("display", "none");
    document.querySelector('.movies').innerHTML='';
    $('.loader').fadeIn('medium');
    document.getElementById('movieYear').innerHTML = inputYear;
    yearUrl = `${yearUrl}${inputYear}`;
    let fullUrl = `${proxy}${yearUrl}`;
    listTopMovies(fullUrl);
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
    genre
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
  movies.forEach(movie => renderMovie($output, movie));
}
$('.loader').fadeIn('medium');
listTopMovies(proxiedUrl());






/**
 * Created by engine on 22/02/2017.
 */
require('./../style/main.scss');

import 'whatwg-fetch';
import $ from 'jquery';
import Movies from './Movies';
import Utils from './Utils';

let sendInput = $('#sendInput');
sendInput.on('click', () => {
  let year = Utils.parseInput();

  if(year) {
    listTopMovies(Utils.fullUrl(year))
  }
});

let inputYear = $('#inputYear');
inputYear.keyup(function (event) {
  if (event.keyCode == 13) {
    sendInput.click();
  }
});

function listTopMovies(fullUrl) {
  Utils.fetchDocument(fullUrl)
    .then(doc => Movies.get($(doc)))
    .then(movies => {
      $('.loader').fadeOut('fast');
      if (movies.length !== 0) {
        Movies.render(movies);
      } else {
        $('.movies').empty();
        $('.noQueryMess').fadeIn('slow');
      }
    });
}

$('.loader').fadeIn('medium');

listTopMovies(Utils.fullUrl());






import $ from 'jquery';

function parseSingle($row) {
  let title = $($row).find('td.title > a').text().trim();
  let titleUrl = $($row).find('td.title > a').attr('href');
  let rating = parseFloat($($row).find('span.rating-rating').text().trim().split('/')[0]) || undefined;
  let desc = $($row).find('span.outline').text().trim();
  let imgUrl = $($row).find('.image img').attr('src');
  let genre = $($row).find('.title .genre').text().trim();

  return { title, titleUrl, rating, desc, imgUrl, genre };
}

function renderSingle($output, movie) {
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

exports.get = function($doc) {
  let $rows = $($doc).find('table.results tr');
  return $rows.map((_, el) => parseSingle($(el))).get();
}

exports.render = function(movies) {
  let $output = $('.movies');
  $output.empty();
  movies.forEach(movie => renderSingle($output, movie));
}

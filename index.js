/**
 * Created by engine on 22/02/2017.
 */
import 'whatwg-fetch';

let url = 'http://www.imdb.com/year/2017/'
fetch(url).then(function (response) {
    console.log(response.status);
    //handle http request
}), function (error) {
    //handle network error
}
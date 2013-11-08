// requires jQuery

var getISSLocation = function (callback) {
  $.getJSON("/current", function (data) {
    var lat = data.iss_position.latitude;
    var lng = data.iss_position.longitude;

    callback(lat, lng);
  });
}

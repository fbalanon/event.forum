// Initialize Firebase
  var config = {
    apiKey: "##########-################-###########",
    authDomain: "my-awesome-project-9a7aa.firebaseapp.com",
    databaseURL: "https://my-awesome-project-9a7aa.firebaseio.com",
    storageBucket: "my-awesome-project-9a7aa.appspot.com",
    messagingSenderId: "652362407979"
  };
  firebase.initializeApp(config);

var messageAppReference = firebase.database();


'use strict';
var $processButton = $("#theButton");
var $keywordValue = $("#enterKeyword");
var $dateValue = $("#enterDate");
var $cityValue = $("#enterCity");
var $stateValue = $("#enterState");
var $countryValue = $("#enterCountry");
var apiKey = "&appid=################################";
var weatherUrl = "http://api.openweathermap.org/data/2.5/weather?q=";
var eventAccess = { "Authorization": "Bearer ####################" };

$(document).ready(getCurrent());

$processButton.on("click", function(event) {
    event.preventDefault();
    var cityInput = $cityValue.val();
    var stateInput = $stateValue.val();
    var countryInput = $countryValue.val();
    var keywordInput = $keywordValue.val(); 
    var dateInput = $dateValue.val();
    weatherCall(keywordInput, dateInput, cityInput,stateInput,countryInput);
});
    
function weatherCall(keywordInput, dateInput, cityInput, stateInput, countryInput) {
      $.ajax({
          url: weatherUrl+cityInput+stateInput+countryInput+apiKey,
          data: {
          format: 'json'
            },
          success: function (response) {
            var temperature = Math.floor((response.main.temp * (9/5)) - 459.67); 
            var $imageThumb = $("<img>").attr('src', 'http://openweathermap.org/img/w/'+response.weather[0].icon+'.png');
            var $currentWeather = $("<h5>").html(cityInput + " is " + temperature + "&#176F with "+ response.weather[0].description);
            $("#weather").append($imageThumb).append($currentWeather);
            var lat = response.coord.lat;
            var lon = response.coord.lon;

            if (dateInput) {
                var link = 'https://www.eventbriteapi.com/v3/events/search/?q='+keywordInput+'&location.latitude='+lat+"&location.longitude="+lon+"&sort_by=date"+"&start_date.range_start="+dateInput+"T01:00:00";
                eventBrite(link);
            } else {
                var link = 'https://www.eventbriteapi.com/v3/events/search/?q='+keywordInput+'&location.latitude='+lat+"&location.longitude="+lon+"&sort_by=date";
                eventBrite(link);
            } 
          }
      }) 
};

function eventBrite (calling) {
        var searchInfo = calling;

        $.ajax({
        headers: eventAccess,
        url: searchInfo,
        dataType: 'json',
        type: 'GET',
            }).done(function(response) {
                for (var i = 0; i < response.events.length; i++) {
                    var $newDiv = $("<div>").addClass("eventbox col-sm-4");
                    var dateTime = response.events[i].start.local.substr(0,10)+" at "+response.events[i].start.local.substr(11);
                   if (response.events[i].logo) {
                        var $newImage = $("<img>").attr('src', response.events[i].logo.url).addClass("img-responsive").attr('style', 'width:100%').attr('alt', 'Image');
                        var $saveDate = $("<h7>").html(dateTime).hide();
                    } else {
                        var $newImage = $("<img>").attr('src', "https://media.giphy.com/media/Knm8mK7l1CqYg/giphy.gif").addClass("img-responsive").attr('style', 'width:100%').attr('alt', 'Image');
                        var $saveLogo = $("<h7>").html("https://media.giphy.com/media/Knm8mK7l1CqYg/giphy.gif").hide();
                    }
                    var $newTitle = $("<h4>").html("<b>"+response.events[i].name.text+"</b>");
                    var $eventTime = $("<h5>").html(dateTime);
                    var $urlInfo = $("<h6>").html(response.events[i].url).hide();
                    var $infoButton = $("<a>").attr('href', response.events[i].url).attr('target',"_blank").addClass("btn btn-info").attr('role', 'button').html("more info");
                    var $saveButton = $("<button>").addClass("btn btn-success").html("save");
                    
                    var $endDiv = $("<div>").addClass("clearfix visible-xs-block");

                    $newDiv.append($newImage).append($newTitle).append($eventTime).append($urlInfo).append($saveDate).append($infoButton).append($saveButton).$endDiv;
                    $("#options").append($newDiv);
                };
            }); 
        };


//saves event on firebase
$("#options").on('click','button', function (event) {
        event.preventDefault();
        var $title = $(event.target).siblings("h4").text();
        var $link = $(event.target).siblings("h6").text();
        var $date = $(event.target).siblings("h7").text()
        var messagesReference = messageAppReference.ref('messages');
            messagesReference.push({
                event: $title,
                date: $date,
                link: $link,
                votes: 0
            });
})


//getting current saved events from firebase
 function getCurrent() {

      messageAppReference.ref('messages').on('value', function(results) { 
          var $eventBoard = $('#event-list');
          var events = [];

          var allMsgs = results.val();
          for (var msg in allMsgs) {
              var event = allMsgs[msg].event;
              var date = allMsgs[msg].date;
              var votes = allMsgs[msg].votes;
              var link = allMsgs[msg].link;
              var $eventListElement = $('<li>');


//link and event name
                var $eventOption = $("<a>").attr('href', link).attr('target',"_blank").html(event +" on "+date+"</a>");


// Delete Element
                var $deleteElement = $('<i class="fa fa-trash pull-right delete"></i>');
                $deleteElement.on('click', function(e) {
                    var id = $(e.target.parentNode).data('id');
                  deleteEvent(id);
                })

// Vote Up Element
                var $upVoteElement = $('<i class="fa fa-thumbs-up pull-right"></i>');
                $upVoteElement.on('click', function(e) {
                    var id = $(e.target.parentNode).data('id');
                    updateEvent(id, ++allMsgs[id].votes);
                })
 // Vote Down Element             
                var $downVoteElement = $('<i class="fa fa-thumbs-down pull-right"></i>');
                    $downVoteElement.on('click', function(e) {
                    var id = $(e.target.parentNode).data('id');
                    updateEvent(id, --allMsgs[id].votes);
                })

//Appending everything
                $eventListElement.attr('data-id', msg);

                $eventListElement.append($eventOption);

                $eventListElement.append($deleteElement);
                $eventListElement.append($upVoteElement);
                $eventListElement.append($downVoteElement);

                $eventListElement.append('<div class="pull-right">' + votes + '</div>');
                    events.push($eventListElement);
                }
                $eventBoard.empty();
                for (var i in events) {
                    $eventBoard.append(events[i]);
                }
            });
  }

//Updates votes
  function updateEvent(id, votes) {
      var messageReference = messageAppReference.ref('messages').child(id);
      messageReference.update({
          votes:votes
      })
  }
  
//Deletes saved event
  function deleteEvent(id) {
      var messageReference = messageAppReference.ref('messages').child(id);
      messageReference.remove();
  }


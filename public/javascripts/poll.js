var socket = io();

$(function () {
  $(".vote").click(function () {
    voted = true;

    var data = {
      "AnswerID": $(this).attr("id"),
      "QuestionID": $(this).attr("data-id")
    };
  
    $.post("/poll/vote", data, function (res) {

    });
  });

  $("#view-results").click(function () {
    voted = true;

    var data = {
      "results": true,
      "QuestionID": $(this).attr("data-id")
    };
  
    $.post("/poll/vote", data, function (res) {
      afterVoting(res);
    });
  });

  socket.on('update', function (msg) {
    console.log("update");
    if (voted) {
      afterVoting(msg);  
    }
  });
});

function afterVoting(res) {
  $("#total-votes").text("Total Votes: " + res.total);

  $(".progress-bar").each(function (index, barElement) {
    res.answers.forEach(function(resElement){
      if (resElement.AnswerID == $(barElement).attr("data-id")) {
        var pct = (resElement.Votes / res.total) * 100;
        pct += "%";
        $(barElement).css("width", pct);
        $(barElement).text(resElement.Votes + " votes");
      }
    });
  });

  $(".vote").addClass("disabled");
  $("#view-results").addClass("disabled");
  $("#warning-text").addClass("d-none");

  if (res.voted) {
    $("#error-text").text("You've already voted!");
  }
}
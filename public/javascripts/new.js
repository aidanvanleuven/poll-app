var n = 2;

$(function () {
  $("#more-button").click(function () {
    n++;
    $("#a-area").append(
      `<div class="mb-3">
      <label for="a`+ n +`" class="form-label">Answer `+ n +`</label>
      <input type="text" class="form-control answer" id="a`+ n +`">
      </div>`
    );
    $("#less-button").removeClass("d-none");
  });

  $("#less-button").click(function () {
    n--;
    $("#a-area").children().last().remove();
    if ($("#a-area").children().length == 2) {
      $("#less-button").addClass("d-none");
    }
  });

  $("#submit").click(function (e) {
    e.preventDefault();

    if ($("#question").val() == "") {
      $("#error-text").text("Question must not be blank.");
      return;
    }

    var data = {
      "question": $("#question").val(),
      "answers": []
    };

    $(".answer").each(function () {
      data.answers.push($(this).val());
    });

    for (i = 0; i < data.answers.length; i++){
      if (data.answers[i] == "") {
        $("#error-text").text("All answer fields must be filled.");
        return;
      }
    }

    $.post("/poll/save", data)
      .done(function (res) {
        window.location = "/poll/" + res.QuestionID;
      })
      .fail(function (res) {
        $("#error-text").text("An unexpected error occured. Please try again.");
      });
  });
});
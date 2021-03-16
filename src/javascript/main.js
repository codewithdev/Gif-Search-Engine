document.querySelector(".js-go").addEventListener("click", function () {
  var inputValue = document.querySelector(".js-userinput").value;
  var userInput = getUserInput();
  searchDocs(userInput);
});

document
  .querySelector(".js-userinput").addEventListener("keyup", function (data) {
    if (data.which === 13) {
      var userInput = getUserInput();
      searchDocs(userInput);
    }
  });

function getUserInput() {
  var inputValue = document.querySelector(".js-userinput").value;

  return inputValue;
}

function searchDocs(searchQuery) {
  var url =
    "https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&q=" + searchQuery;
  // AJAX Request
  var GiphyAJAXCall = new XMLHttpRequest();
  GiphyAJAXCall.open("GET", url);
  GiphyAJAXCall.send();

  GiphyAJAXCall.addEventListener("load", function (data) {
    var actualData = data.target.response;
    pushToDOM(actualData);
    console.log(actualData);
  });
}

function pushToDOM(response) {
  // turn response into real javascript object
  response = JSON.parse(response);
  // drill down to the data array
  var images = response.data;

  // find the container to hold this stuff in DOM
  var container = document.querySelector(".js-container");
  // clear it of old content since this function will be used on every search
  // we want to reset the div
  container.innerHTML = "";

  // loop through data array and add IMG html
  images.forEach(function (image) {
    // find img src
    var src = image.images.fixed_height.url;

    // concatenate a new IMG tag
    container.innerHTML += "<a href='" + src + "' class='container-url'>Image link</a>";
    container.innerHTML += "<b><p class='container-title'>Lorem Ipsum is simply dummy text</p></b>";
    container.innerHTML += "<p class='container-description'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>";
  });
}

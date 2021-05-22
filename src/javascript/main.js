window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  var queryText = urlParams.get("q");

  // trigger search if query param is found
  if (queryText != null && queryText.trim() != "") {
    queryText = queryText.trim()
    document.querySelector(".js-userinput").value = queryText;
    searchDocs(queryText, new Date());
  }
};

document.querySelector(".js-go").addEventListener("click", function () {
  var inputValue = document.querySelector(".js-userinput").value;
  var userInput = getUserInput();
  searchDocs(userInput, new Date());
});

document.querySelector(".js-userinput").addEventListener("keyup", function (data) {
    if (data.which === 13) {
      var userInput = getUserInput();
      searchDocs(userInput, new Date());
    }
  });

function getUserInput() {
  var inputValue = document.querySelector(".js-userinput").value;

  return inputValue;
}

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

function searchDocs(searchQuery, startTime) {
  // update url history
  window.history.pushState('', '', '/?q='+searchQuery.replace(/ +(?= )/g,'').split(" ").join("+"));

  var url = "/api/search";
  var dataIn = { query: searchQuery }

  // use API key if available
  // The ID of the extension
  var editorExtensionId = "bcjeaeloapgoghamfccokbdmojknnjif";

  // Make a simple request:
  if (chrome.runtime) {
    chrome.runtime.sendMessage(editorExtensionId, {},
      function(response) {
        if (response) {
          if (response.success) {
            dataIn.key = response.key;
          }
          else {
            dataIn.database = "9cqyPnQtFpg3vtVTUK73MdzNTdN2h5V5Cu3gvXd5tBJ6";
          }
        }
        else {
          console.log("Install AquilaX browser extension for better experience.");
        }

        // perform search
        postData(url, dataIn)
        .then(data => {
          console.log(data); // JSON data parsed by `data.json()` call
          pushToDOM(data.result, startTime);
        });
      }
    );
  }
  else {
    dataIn.database = "9cqyPnQtFpg3vtVTUK73MdzNTdN2h5V5Cu3gvXd5tBJ6";
    // perform search
    postData(url, dataIn)
    .then(data => {
      console.log(data); // JSON data parsed by `data.json()` call
      pushToDOM(data.result, startTime);
    });
  }
}

function pushToDOM(response, startTime) {
  // turn response into real javascript object
  // response = JSON.parse(response);
  // drill down to the data array
  // var images = response.data;

  // time elapsed
  endTime = new Date();
  var timeDiff = endTime - startTime;
  timeDiff /= 1000;

  // find the container to hold this stuff in DOM
  var container = document.querySelector(".js-container");
  // clear it of old content since this function will be used on every search
  // we want to reset the div
  container.innerHTML = ""
  container.innerHTML += "<p class='container-timer'>Found "+Object.keys(response).length+" results in "+timeDiff+" seconds."+"</p>";

  // sort results
  const sortable = Object.entries(response)
    .sort(([,a],[,b]) => b-a)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

  // loop through data array and add IMG html
  for (const key in sortable) {
    // find img src
    var src = key;

    // concatenate a new url
    container.innerHTML += "<a href='" + src + "' class='container-url' target='_blank'>"+src+"</a>";
    container.innerHTML += "<b><p class='container-title'>Score: "+Math.round(response[key]/100)+"</p></b>";
    // container.innerHTML += "<b><p class='container-title'>Lorem Ipsum is simply dummy text</p></b>";
    // container.innerHTML += "<p class='container-description'>Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>";
  }
}

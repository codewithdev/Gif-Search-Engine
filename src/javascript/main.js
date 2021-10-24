window.onload = function () {
  const urlParams = new URLSearchParams(window.location.search);
  var queryText = urlParams.get("q");

  // trigger search if query param is found
  if (queryText != null && queryText.trim() != "") {
    document.querySelector(".cleartxt").classList.remove("hidden");
    queryText = queryText.trim()
    document.querySelector(".js-userinput").value = queryText;
    searchDocs(queryText, new Date());
  }
  else {
    document.querySelector(".cleartxt").classList.add("hidden");
    listDocs(new Date());
  }
};

document.querySelector(".js-go").addEventListener("click", function () {
  var userInput = getUserInput();
  if (userInput != null && userInput.trim() != "") {
    searchDocs(userInput, new Date());
  }
  else {
    listDocs(new Date());
  }
});

document.querySelector(".cleartxt").addEventListener("click", function () {
  el = document.querySelector(".js-userinput")
  el.value = null;
  // el.dispatchEvent(new Event('focus'));
  // el.dispatchEvent(new KeyboardEvent('keypress',{'key':'13'}));
  document.querySelector(".cleartxt").classList.add("hidden");
  // listDocs(new Date());
  window.stop()
});

document.querySelector(".js-userinput").addEventListener("keyup", function (data) {
  var userInput = getUserInput();
  if (userInput.trim() != "") {
    document.querySelector(".cleartxt").classList.remove("hidden");
  }
  else {
    document.querySelector(".cleartxt").classList.add("hidden");
  }

  if (data.which === 13) {
    if (userInput != null && userInput.trim() != "") {
      searchDocs(userInput, new Date());
    }
    else {
      listDocs(new Date());
    }
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
  // var editorExtensionId = "bcjeaeloapgoghamfccokbdmojknnjif";
  var editorExtensionId = "albdahjdcmldbcpjmbnbcbckgndaibnk"

  // Make a simple request:
  if (chrome && chrome.runtime) {
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
          pushSearchResultsToDOM(data.result, startTime);
        });
      }
    );
  }
  else {
    dataIn.database = "9cqyPnQtFpg3vtVTUK73MdzNTdN2h5V5Cu3gvXd5tBJ6";
    // perform search
    postData(url, dataIn)
    .then(data => {
      pushSearchResultsToDOM(data.result, startTime);
    });
  }
}

function listDocs(startTime) {
  // update url history
  window.history.pushState('', '', '/');
  var url = "/api/list";

  // use API key if available
  // The ID of the extension
  // var editorExtensionId = "bcjeaeloapgoghamfccokbdmojknnjif";
  var editorExtensionId = "albdahjdcmldbcpjmbnbcbckgndaibnk"
  dataIn = {
    "page": "0",
    "limit": "100"
  }
  // Make a simple request:
  if (chrome && chrome.runtime) {
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
          pushListResultsToDOM(data.result, startTime);
        });
      }
    );
  }
  else {
    dataIn.database = "9cqyPnQtFpg3vtVTUK73MdzNTdN2h5V5Cu3gvXd5tBJ6";
    // perform search
    postData(url, dataIn)
    .then(data => {
      pushListResultsToDOM(data.result, startTime);
    });
  }
}

function pushSearchResultsToDOM(response, startTime) {
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
  container.innerHTML += '<p class="text-sm text-gray-600 py-2"> Received '+Object.keys(response).length+' results in '+timeDiff+' seconds.</p>';

  // sort results
  const sortable = Object.entries(response)
    .sort(([,a],[,b]) => b-a)
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});

  urllist = []

  // loop through data array and add IMG html
  for (const key in sortable) {
    // find img src
    var src = key;
    var rootUrl = src;
    try {
      rootUrl = (new URL(src)).hostname;
    }
    catch(err) {
      // rootUrl = src;
    }

    // update url list
    urllist.push(src)

    // concatenate a new url
    container.innerHTML += "<a unique_id='" + btoa(src) + "' href='" + src + "' class='border border-l-4 rounded p-4 hover:bg-gray-50 hover:shadow' target='_blank'> \
          <p class='text-blue-500 text-2xl'>"+rootUrl+"</p> \
          <p class='font-bold pt-2 text-1xl text-gray-500'>score: "+Math.round(100*response[key])+"</p></a>";
  }

  // update blocks with more info
  updateBlockSummary (urllist)
}

function pushListResultsToDOM(response, startTime) {
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
  container.innerHTML += '<p class="text-sm text-gray-600 py-2"> Received '+response.links.length+' results in '+timeDiff+' seconds.</p>';

  // sort results
  response.links.sort(function(a, b) {
    var keyA = a.timestamp,
      keyB = b.timestamp;
    // Compare the 2 dates
    if (keyA < keyB) return 1;
    if (keyA > keyB) return -1;
    return 0;
  });

  urllist = []

  // loop through data array and add IMG html
  response.links.forEach(function (link) {
    // find img src
    var src = link.url;
    var rootUrl = src;
    try {
      rootUrl = (new URL(src)).hostname;
    }
    catch(err) {
      // rootUrl = src;
    }
    var dtime = new Date(link.timestamp * 1000);

    // update url list
    urllist.push(src)

    // concatenate a new url
    container.innerHTML += "<a unique_id='" + btoa(src) + "' href='" + src + "' class='border border-l-4 rounded p-4 hover:bg-gray-50 hover:shadow' target='_blank'> \
          <p class='text-blue-500 text-2xl'>"+rootUrl+"</p> \
          <p class='pt-2 text-gray-500'>updated at: "+dtime+"</p></a>";
  });

  // update blocks with more info
  updateBlockSummary (urllist)
}

function updateBlockSummary (urls) {
  var url = "/api/urlsummary";

  // use API key if available
  // The ID of the extension
  // var editorExtensionId = "bcjeaeloapgoghamfccokbdmojknnjif";
  var editorExtensionId = "albdahjdcmldbcpjmbnbcbckgndaibnk"
  dataIn = {
    "urls": urls
  }
  // Make a simple request:
  if (chrome && chrome.runtime) {
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

        // perform fetch
        postData(url, dataIn)
        .then(data => {
          pushListBlockSummaryToDOM(data);
        });
      }
    );
  }
  else {
    dataIn.database = "9cqyPnQtFpg3vtVTUK73MdzNTdN2h5V5Cu3gvXd5tBJ6";
    // perform fetch
    postData(url, dataIn)
    .then(data => {
      pushListBlockSummaryToDOM(data);
    });
  }
}

function pushListBlockSummaryToDOM(summary) {
  // truncate summary
  var trLength = 300

  summary.result.summary.forEach(function (summ) {
    var element = document.querySelector("[unique_id=\""+btoa(summ.url)+"\"]");

    if (summ.title != null && summ.title.trim() != "") {
      element.children[0].innerText = summ.title;
    }
    if (summ.summary != null && summ.summary.trim() != "") {
      var tag = document.createElement("p");
      var text = document.createTextNode(summ.summary.substring(0,trLength)+"...");
      tag.appendChild(text);
      // tag.classList.add("hidden");
      tag.classList.add("pt-2");
      tag.classList.add("pr-5");
      tag.classList.add("pl-3");
      tag.classList.add("text-sm");
      tag.classList.add("font-thin");
      
      element.appendChild(tag);
    }
    if (summ.author != null && summ.author.trim() != "") {
      var tag = document.createElement("p");
      var text = document.createTextNode("- "+summ.author);
      tag.appendChild(text);
      // tag.classList.add("hidden");
      tag.classList.add("pt-2");
      tag.classList.add("pl-3");
      tag.classList.add("text-sm");
      tag.classList.add("font-bold");
      tag.classList.add("text-gray-500");
      
      element.appendChild(tag);
    }
  });
}


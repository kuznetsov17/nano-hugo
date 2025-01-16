function debounce(func, wait) {
  var timeout;

  return function () {
    var context = this;
    var args = arguments;
    clearTimeout(timeout);

    timeout = setTimeout(function () {
      timeout = null;
      func.apply(context, args);
    }, wait);
  };
}

function makeTeaser(body, terms) {
  var TERM_WEIGHT = 40;
  var NORMAL_WORD_WEIGHT = 2;
  var FIRST_WORD_WEIGHT = 8;
  var TEASER_MAX_WORDS = 10;

  var stemmedTerms = terms.map(function (w) {
    return elasticlunr.stemmer(w.toLowerCase());
  });
  var termFound = false;
  var index = 0;
  var weighted = []; // contains elements of ["word", weight, index_in_document]

  // split in sentences, then words
  var sentences = body.toLowerCase().split(". ");

  for (var i in sentences) {
    var words = sentences[i].split(" ");
    var value = FIRST_WORD_WEIGHT;

    for (var j in words) {
      var word = words[j];

      if (word.length > 0) {
        for (var k in stemmedTerms) {
          if (elasticlunr.stemmer(word).startsWith(stemmedTerms[k])) {
            value = TERM_WEIGHT;
            termFound = true;
          }
        }
        weighted.push([word, value, index]);
        value = NORMAL_WORD_WEIGHT;
      }

      index += word.length;
      index += 1;  // ' ' or '.' if last word in sentence
    }

    index += 1;  // because we split at a two-char boundary '. '
  }

  if (weighted.length === 0) {
    return body;
  }

  var windowWeights = [];
  var windowSize = Math.min(weighted.length, TEASER_MAX_WORDS);
  // We add a window with all the weights first
  var curSum = 0;
  for (var i = 0; i < windowSize; i++) {
    curSum += weighted[i][1];
  }
  windowWeights.push(curSum);

  for (var i = 0; i < weighted.length - windowSize; i++) {
    curSum -= weighted[i][1];
    curSum += weighted[i + windowSize][1];
    windowWeights.push(curSum);
  }

  // If we didn't find the term, just pick the first window
  var maxSumIndex = 0;
  if (termFound) {
    var maxFound = 0;
    // backwards
    for (var i = windowWeights.length - 1; i >= 0; i--) {
      if (windowWeights[i] > maxFound) {
        maxFound = windowWeights[i];
        maxSumIndex = i;
      }
    }
  }

  var teaser = [];
  var startIndex = weighted[maxSumIndex][2];
  for (var i = maxSumIndex; i < maxSumIndex + windowSize; i++) {
    var word = weighted[i];
    if (startIndex < word[2]) {
      teaser.push(body.substring(startIndex, word[2]));
      startIndex = word[2];
    }

    
    if (word[1] === TERM_WEIGHT) {
      teaser.push("<b>");
    }
    startIndex = word[2] + word[0].length;
    teaser.push(body.substring(word[2], startIndex));

    if (word[1] === TERM_WEIGHT) {
      teaser.push("</b>");
    }
  }
  teaser.push("…");
  return teaser.join("");
}

function formatSearchResultItem(item, terms) {
  doc = `
  <hgroup>
    <h6>
      <a href="${item.ref}">${item.doc.title}</a>
    </h6>
      <p>${makeTeaser(item.doc.body, terms)}</p>
  </hgroup>
  `;
  
  return doc
}

function initSearch() {
  var $searchInput = document.getElementById("searchInput");
  var searchResults = document.getElementById('sResults');
  var MAX_ITEMS = 5;

  var options = {
    bool: "AND",
    fields: {
      title: {boost: 2},
      body: {boost: 1},
    }
  };
  var currentTerm = "";
  var index;
  
  var initIndex = async function () {
    if (index === undefined) {
      let $baseUrl = document.head.dataset['baseUrl']
      index = fetch($baseUrl + "search_index.en.json")
        .then(
          async function(response) {
            return await elasticlunr.Index.load(await response.json());
        }
      );
    }
    let res = await index;
    document.getElementById("closeSearch").addEventListener("click", closeSearchResults);
    return res;
  }

  $searchInput.addEventListener("keyup", debounce(async function() {
    var term = $searchInput.value.trim();
    if (term === currentTerm) {
      return;
    }
    searchResults.style.display = term === "" ? "none" : "block";
    searchResults.style.top = `${document.documentElement.scrollTop}px`;
    searchResults.style.display="block";
    searchResults.style.transition="opacity 3s";
    window.addEventListener('click', function(e){   
      if (! searchResults.contains(e.target)){
        closeSearchResults();
      } 
    });
    
    currentTerm = term;
    if (term === "") {
      closeSearchResults()
      // return;
    }

    var results = (await initIndex()).search(term, options);
    if (results.length === 0) {
      searchResults.style.display = "none";
      return;
    }
    var searchResultsPan = document.createElement("div");
    searchResultsPan.id = "resultsPan"
    searchResults.appendChild(searchResultsPan);
    for (var i = 0; i < Math.min(results.length, MAX_ITEMS); i++) {
      var item = document.createElement("div");
      item.innerHTML = formatSearchResultItem(results[i], term.split(" "));
      searchResultsPan.appendChild(item);
    }
  }, 150));

  window.addEventListener('click', function(e) {
    if (searchResults.style.display == "block" && !searchResults.contains(e.target)) {
      searchResults.style.display = "block";
    }
  });
  
}


function closeSearchResults() {
  document.getElementById("resultsPan").remove()
  document.getElementById("sResults").style.display="none";
  document.getElementById("searchInput").value="";
  initSearch();
}

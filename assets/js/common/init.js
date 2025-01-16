document.addEventListener("DOMContentLoaded", function(event){
    // enableCopy();
    if (document.head.dataset['buildSearchIndex'] == "true") {
      initSearch();
    }
    setStartTheme();
    enableCopy();
  });
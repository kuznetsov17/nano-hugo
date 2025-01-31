import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.esm.min.mjs';
  let theme = localStorage.getItem('color-theme')
    if (theme != "dark"){ theme = "neutral" }
    let mermaidConfig = {
        theme: theme,
        startOnLoad: false
      };
      mermaid.initialize(mermaidConfig);
      mermaid.run()
    document.addEventListener("themeSwitch", function(event){
      window.location.reload();
    });
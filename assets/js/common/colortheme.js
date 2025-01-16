function mermaidRender(theme) {
    if ( theme == 'dark' ) {
        initOptions = {  
            startOnLoad: false, 
            theme: 'dark'
        } 
    } 
    else {
        initOptions = {  
            startOnLoad: false,
            theme: 'neutral' 
            }   
    }
    // for (let i = 0; i < mmdElements.length; i++) {
    //     delete mmdElements[i].dataset.processed;
    //     mmdElements[i].innerHTML = mmdHTML[i];
    // }
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize(initOptions);
        mermaid.run();
    }
}
function giscusRender(theme) {
    if (document.head.dataset['commentsEnabled'] == 'true'){  
        baseUrl = document.head.dataset['baseUrl'];
        themes = {
            "dark": `${baseUrl}css/gs_dark.css`,
            "light":`${baseUrl}css/gs_light.css`
        }
        giscus = document.getElementById('giscusScript');
        if (giscus){
            giscus.remove();
        }
        let js = document.createElement('script');
        js.setAttribute("id", 'giscusScript');
        js.setAttribute("src", document.head.dataset['giscusSrc']);
        js.setAttribute("data-repo", document.head.dataset['giscusRepo']);
        js.setAttribute("data-repo-id", document.head.dataset['giscusRepoId']);
        js.setAttribute("data-category", document.head.dataset['giscusCategory']);
        js.setAttribute("data-category-id", document.head.dataset['giscusCategoryId']);
        js.setAttribute("data-mapping", document.head.dataset['giscusMapping']);
        js.setAttribute("data-strict",document.head.dataset['giscusStrict']);
        js.setAttribute("data-reactions-enabled",document.head.dataset['giscusReactionsEnabled']);
        js.setAttribute("data-emit-metadata", document.head.dataset['giscusEmitMetadata']);
        js.setAttribute("data-input-position", document.head.dataset['giscusInputPosition']);
        js.setAttribute("data-theme", themes[theme]);
        js.setAttribute("data-lang", document.head.dataset['giscusLang']);
        js.setAttribute("crossorigin", document.head.dataset['giscusCrossorigin']);
        js.setAttribute("nonce", document.head.dataset['giscusNonce']);
        js.async = true;
        commentsBase = document.getElementById('giscusWidget').appendChild(js);
    }
}

function setStartTheme(){
    let targetColorTheme = '';
    let currentTheme = localStorage.getItem('color-theme');
    if (currentTheme != null) {
        targetColorTheme = currentTheme
    } else { 
        const darkThemeMq = window.matchMedia("(prefers-color-scheme: dark)");
        if (darkThemeMq.matches) {
            targetColorTheme = 'dark';
            
        } else {
            targetColorTheme = 'light';
        }
    }
    document.documentElement.setAttribute('data-theme', targetColorTheme);
    document.getElementById("colorSwitch").addEventListener("click", switchTheme);
    
    switchToggle(targetColorTheme)
    localStorage.setItem('color-theme',targetColorTheme);
    giscusRender(targetColorTheme);
    setCodeCss(targetColorTheme)
    mermaidRender(targetColorTheme);
}
function switchToggle(targetColorTheme) {
    if (targetColorTheme == 'dark') {
        document.getElementById('colorSwitch').classList.add('theme-toggle--toggled');
    }
    if (targetColorTheme == 'light') {
        document.getElementById('colorSwitch').classList.remove('theme-toggle--toggled');
    }
}
function switchTheme() {
    currentTheme = document.documentElement.getAttribute('data-theme')
    if (currentTheme == 'dark') {
        targetColorTheme = 'light';
        document.getElementById('colorSwitch').classList.remove('theme-toggle--toggled');
    }
    if ( currentTheme == 'light') {
        targetColorTheme = 'dark';
        document.getElementById('colorSwitch').classList.add('theme-toggle--toggled');
    }
    document.documentElement.setAttribute('data-theme', targetColorTheme);
    
    localStorage.setItem('color-theme',targetColorTheme);
    setCodeCss(targetColorTheme)
    giscusRender(targetColorTheme)
    mermaidRender(targetColorTheme)
    
    
}

function setCodeCss(targetColorTheme) {
    var code_css = document.createElement("link");
    code_css.rel = "stylesheet";
    code_css.type = "text/css";
    code_css.href = `/css/dynamic/monokai-${targetColorTheme}.css`;
    document.getElementsByTagName("head")[0].appendChild(code_css)
}



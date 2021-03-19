$.loadScript("https://jawdan77.github.io/Libraries/prettify.js");

$(function() {
    let bodyContent = $(document.body).contents();
    $.loadHTML("https://jawdan77.github.io/Template/Raw-HTML/Body.html", function(data) {        
        $(document.body).append(data);
        $(".tutorial").append(bodyContent);          
        $.loadHTML("https://jawdan77.github.io/Template/Raw-HTML/Head.html", function(data) { 
            $(document.head).append(data);
        });
    });

    $.loadScript("https://jawdan77.github.io/Template/load-template.js");
});
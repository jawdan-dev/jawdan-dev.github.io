//$.loadScript("https://jawdan77.github.io/Libraries/prettify.js");

$(function() {
    $.loadHTML("https://jawdan77.github.io/Template/Raw-HTML/Style.html", function(data) { 
        $(document.head).append(data);
    });

    let bodyContent = $(document.body).contents();
    $.loadHTML("https://jawdan77.github.io/Template/Raw-HTML/Header.html", function(data) { 
        $(document.body).append(data);
    });     
    $.loadHTML("https://jawdan77.github.io/Template/Raw-HTML/Base.html", function(data) {   
        $(document.body).append(data);
        $.loadHTML("https://jawdan77.github.io/Template/Raw-HTML/Bookmark.html", function(data) { 
            $(".tutorial").append(data);
        });       
        $(".tutorial").append(bodyContent);    
        
    });    

    $.loadScript("https://jawdan77.github.io/Template/load-template.js");
});
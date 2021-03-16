$(function() {
    /* LOAD ALL STUFF */    
    // this need to do some stuff innit
    //$.ajax({type: "GET",
    //  url: "https://jawdan77.github.io/Template/Template.html",
    //  async: false,
    //  success : function(data) {
    //    $("html").append(data);
    //  }        
    //});
    let bodyContent = $(document.body).contents();
    
    $(document.head).load("https://jawdan77.github.io/Template/Head.html");
    $.ajax({
        type: "GET",
        url: "https://jawdan77.github.io/Template/Body.html",
        async: false,
        success : function(data) {
            $(document.body).append(data);
            $(".tutorial").append(bodyContent); 
        }    
    });

    /* LOW-KEY FORMATTING */
    var totalHeaders = 0;
    $("h2").each(function() {
      if (totalHeaders > 0) {
        $(this).append("<hr>");
        var header = $(this);
        $(".tutorialBookmarks").append("<a href=#Heading" + totalHeaders.toString() + ">" + header.text() + "</a>");
        $(this).attr("id", "Heading" + totalHeaders.toString());
      }
      totalHeaders++;
    });
    $(".tutorialBookmarks").append("<hr>")
    
    ///* FORMATTING */
    $(".gifPreview").hover(
      function() {
        var src = $(this).attr("src");
        $(this).attr("src", src.substring(0, src.length - 4) + ".gif");
        console.log("gif'd up");
      },
      function() {
        var src = $(this).attr("src");
        $(this).attr("src", src.substring(0, src.length - 4) + ".png");
        console.log("png'd up");
      }
    );
    //PR.prettyPrint()
});
/* LOW-KEY FORMATTING */
var totalHeaders = 0;
$("h2").each(function() {
  if (totalHeaders > 0) {
    $(this).append("<hr>");
    var header = $(this);
    $(".bookmarks").append("<a href=#Heading" + totalHeaders.toString() + ">" + header.text() + "</a>");
    $(this).attr("id", "Heading" + totalHeaders.toString());
  }
  totalHeaders++;
});
$(".bookmarks").append("<hr>")

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
    
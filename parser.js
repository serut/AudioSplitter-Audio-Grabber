// Do things when youtube page load

// Retrieve params of the current page
// http://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-url-parameter
function getParams(url){
    var regex = /[?&]([^=#]+)=([^&#]*)/g,
        params = {},
        match;
    while(match = regex.exec(url)) {
        params[match[1]] = match[2];
    }
    return params;
}

// Extract from dom the video attributes and send these information to background
makeCoffe = function() {

    var params = {};
    params["playlistId"] = 7701714;
    params["song"] = [{
        "source": "youtube",
        "relevance": 0, // Relevant ?
        "splitCount": 0,  // Relevant ?
        "$$hashKey": "0N6" // Relevant ?
    }];
    if (document.querySelectorAll("#watch7-content link[itemprop=thumbnailUrl]").length > 0) {
        params["song"][0]["image"] = document.querySelectorAll("#watch7-content link[itemprop=thumbnailUrl]")[0].href;
    }
    if (document.querySelectorAll("#watch7-content meta[itemprop=videoId]").length > 0) {
        params["song"][0]["sourceId"] = document.querySelectorAll("#watch7-content meta[itemprop=videoId]")[0].getAttribute("content");
    }
    if (document.querySelectorAll("#watch7-content link[itemprop=url]").length > 0) {
        params["song"][0]["url"] = document.querySelectorAll("#watch7-content link[itemprop=url")[0].href;
    }
    if (document.querySelectorAll("#watch7-content meta[itemprop=name]").length > 0) {
        params["song"][0]["title"] = document.querySelectorAll("#watch7-content meta[itemprop=name]")[0].getAttribute("content");
    }
    if (document.querySelectorAll("#watch7-content span[itemprop=author] link").length > 0) {
        params["song"][0]["channel"] = document.querySelectorAll("#watch7-content span[itemprop=author] link")[0].href.split("user/")[1];
    }
    if (document.querySelectorAll(".yt-user-info a").length > 0) {
        params["song"][0]["artist"] = document.querySelectorAll(".yt-user-info a")[0].text;
    }
    //console.log(params);
    chrome.runtime.sendMessage({
        method: 'POST',
        url: 'http://audiosplitter.fm/assets/api/playlists/addSong',
        data: params
    });

}

var previousVideo = "";
analyseURL = function() {
    var url = window.location.href;
    var urlSplited = getParams(url);
    if (urlSplited.v !== undefined) {
        if (urlSplited.v !== previousVideo) {
            previousVideo = urlSplited.v;
            makeCoffe();
        } else {
            console.log("Same video !!!")
        }
    } else {
        console.log("Not a video !!!")
    }
}

analyseURL();

setInterval(function() {
    analyseURL();
}, 10000)
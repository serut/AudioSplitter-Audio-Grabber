var bkg = chrome.extension.getBackgroundPage();
bkg.console.log("Chargement script background")

// Send the message outside the page
chrome.runtime.onMessage.addListener(
    function(r, sender, sendResponse) {
        var request = new XMLHttpRequest();
        request.open(r.method, r.url);

        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                var data = JSON.parse(request.responseText);
                bkg.console.log(data)
            } else {
                // We reached our target server, but it returned an error
                bkg.console.log("Error")
            }
        };

        request.onerror = function() {
            bkg.console.log("there was a connection error of some sort")
        };

        var formData = new FormData();
        formData.append('playlistId', localStorage['audiosplitter.playlist']);
        formData.append('song', JSON.stringify(r.data["song"]));
        if (localStorage['audiosplitter.playlist'] !== undefined) {
            request.send(formData);
        } else {
            bkg.console.log("Request canceled")
        }
    }
);
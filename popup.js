document.addEventListener('DOMContentLoaded', function () {
	if (localStorage['audiosplitter.playlist'] === undefined) {
		localStorage['audiosplitter.playlist'] = "Unknown...";
	}
	
	document.getElementById('input-playlist').value = localStorage['audiosplitter.playlist'];

	document.getElementById('button-playlist-save').addEventListener('click', function() {
	    localStorage['audiosplitter.playlist'] = document.getElementById('input-playlist').value;
		console.log("New value : " + localStorage['audiosplitter.playlist']);
	});

});
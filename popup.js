
// State of the HMI
HMIState = {
	ERROR: -1,
	LOADING: 0,
	RUNNING: 1
};
// Store playlists, error, userplaylist stuff in order to generate 
// the HMI and put it in the popup
HMI = {
	state: HMIState.LOADING,
	userPlaylist: [],
	error: "",
	print_item: function(id, name, currentUserPlayList) {
		// Build HTML string
		var childContent = 
		'<div clas="item playlist_item">'+
			'<span class="playlist_title">'+name+'</span>'+
			'<div class="slideThree">  '+
				'<input type="checkbox" data-id="'+id+'" value="None" ';
		// Set the input checked when it'is the choosen playlist 
		if (id == currentUserPlayList) {
			childContent += ' checked="checked"';
		}

		childContent +=	'>'+
				'<label for="slideThree"></label>'+
			'</div>'+
		'</div>';
		return childContent;
	},
	print: function(playlists) {
		var content = document.getElementById("content");
		var childContent = "";
		switch (this.state) {
			case HMIState.ERROR:
				childContent = this.error;
				break;
			case HMIState.LOADING:
				childContent = "Loading stuff";
				break;
			case HMIState.RUNNING:
				var currentUserPlayList = localStorage['audiosplitter.playlist'];
				var usefullChild = "";
				var uselessChild = "";
				for (var i = 0; i < this.userPlaylist.length; i++) {
					var id = this.userPlaylist[i].id,
					name = this.userPlaylist[i].name,
					text = this.print_item(id, name, currentUserPlayList);
					if (id == currentUserPlayList) {
						usefullChild += text;
					} else {
						uselessChild += text;
					}
				}
				childContent = usefullChild + uselessChild;
				break;
		}
		// Write to DOM
		content.innerHTML = childContent;
		return this.bindPlayListItem();
	},
	bindPlayListItem: function() {
		// Bind playlist item input
		var playlistItems = document.getElementsByClassName('slideThree');
		for ( var i = 0; i < playlistItems.length; i++) {
			playlistItems[i].addEventListener('click', function(evt) {
				// Uncheck all checkboxes
				var inputList = document.getElementsByTagName("input");
				var idPlaylist = evt.currentTarget.getElementsByTagName("input")[0].getAttribute("data-id");
				for ( var y = 0; y < inputList.length; y++) {
		    		inputList[y].checked = inputList[y].getAttribute("data-id") == idPlaylist;
				}
				// Edit the variable
			    localStorage['audiosplitter.playlist'] = idPlaylist;

			    evt.currentTarget.getElementsByTagName("input")[0].removeAttribute("checked")
				console.log("Configured to playlist_id = " + localStorage['audiosplitter.playlist']);
			});
		}
	},
	setPlaylist: function(playlists) {
		this.state = HMIState.RUNNING;
		this.userPlaylist = [];
		for (var i = 0; i < playlists.length; i++) {
			this.userPlaylist.push({
				id: playlists[i].id,
				name: playlists[i].name
			})
		}
	},
	setErrorMessage: function(message) {
		this.error = message;
		this.userPlaylist = [];
		this.state = HMIState.ERROR;
	}
}

// Retrieve user playlist
getUserPlaylist = function() {
	var request = new XMLHttpRequest();
	var url = "http://audiosplitter.fm/assets/api/playlists/list";
	var method = "get";
    request.open(method, url);

    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            try {
	            var data = JSON.parse(request.responseText);
	            //console.log(data)
	            if (data && data.playlists) {
	            	HMI.setPlaylist(data.playlists);
	            } else {
	            	HMI.setErrorMessage("Something went wrong...");
	            }
            }
            catch (e) {
            	HMI.setErrorMessage("Something went wrong...");
            }
        } else {
            // We reached our target server, but it returned an error
        	HMI.setErrorMessage("Failed to access Audiosplitter API ! :'(");
        }
        HMI.print();
    };

    request.onerror = function() {
        console.log("there was a connection error of some sort")
    };
    request.send();
}

document.addEventListener('DOMContentLoaded', function () {
	if (localStorage['audiosplitter.playlist'] === undefined) {
		localStorage['audiosplitter.playlist'] = "";
	}
    HMI.print();
	getUserPlaylist();
});
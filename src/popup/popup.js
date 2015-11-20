
// State of the HMI
HMIState = {
	ERROR: -1,
	LOADING: 0,
	RUNNING: 1,
	CREATE_PLAYLIST: 2
};
// Store playlists, error, userplaylist stuff in order to generate 
// the HMI and put it in the popup
HMI = {
	state: HMIState.LOADING,
	userPlaylist: [],
	error: "",
	print_item: function(id, name, isPlayListActive) {
		// Build HTML string
		var childContent = 
		'<div clas="item playlist_item">'+
			'<span class="playlist_title">'+name+'</span>'+
			'<div class="slideThree">  '+
				'<input type="checkbox" data-id="'+id+'" value="None" ';
		// Set the input checked when it'is the choosen playlist 
		if (isPlayListActive) {
			childContent += ' checked="checked"';
		}
		childContent +=	'>'+
				'<label for="slideThree"></label>'+
			'</div>'+
		'</div>';
		return childContent;
	},
	print_createNewPlaylist: function() {
		var childContent = 
		'<div class="item create_item">'+
			'<span class="playlist_title"> <button class="btn-add">Create a new playlist</button></span>'
			'</div>'+
		'</div>';
		return childContent;
	},
	print_formCreatePlaylist: function() {
		var childContent = 
			'<span>Create a <i>private</i> audiosplitter playlist :</span>' + 
			'<div class="form-group">'+
				'<input type="text" class="form-control" id="playlist_name" placeholder="Playlist name">'+
				'<button class="btn-add">Create</button>'
			'</div>';
		return childContent;
	},
	print: function() {
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
					isPlayListActive = id == currentUserPlayList,
					text = this.print_item(id, name, isPlayListActive);
					if (isPlayListActive) {
						usefullChild += text;
					} else {
						uselessChild += text;
					}
				}
				var newPlayListHTMLAstext = this.print_createNewPlaylist();
				childContent = usefullChild + uselessChild + newPlayListHTMLAstext;
				break;
			case HMIState.CREATE_PLAYLIST:
				childContent = this.print_formCreatePlaylist();
				break;
		}
		// Write to DOM
		content.innerHTML = childContent;

		// Bind event handler on this new html
		switch (this.state) {
			case HMIState.ERROR:
			case HMIState.LOADING:
				break;
			case HMIState.RUNNING:
				return this.bindPlayListItem();
			case HMIState.CREATE_PLAYLIST:
				return this.bindCreatePlayList();
		}
	},
	bindPlayListItem: function() {
		// Bind playlist item input
		var playlistItems = document.getElementsByClassName('slideThree');
		for ( var i = 0; i < playlistItems.length; i++) {
			playlistItems[i].addEventListener('click', function(evt) {
				// Uncheck all checkboxes
				var inputList = document.getElementsByTagName("input");
				var idPlaylist = evt.currentTarget.getElementsByTagName("input")[0].getAttribute("data-id");
				if (idPlaylist == localStorage['audiosplitter.playlist']) {
					// The user clicked to the playlist active
					idPlaylist = "";
				}
				for ( var y = 0; y < inputList.length; y++) {
					if (inputList[y].getAttribute("data-id") == idPlaylist) {
		    			inputList[y].setAttribute("checked","true");
					} else {
						inputList[y].removeAttribute("checked")
					}
				}
				// Edit the local variable
			    localStorage['audiosplitter.playlist'] = idPlaylist;
				console.log("Configured to playlist_id = " + localStorage['audiosplitter.playlist']);
			});
		}
		var btnItems = document.getElementsByClassName('btn-add')
		for ( var i = 0; i < btnItems.length; i++) {
			btnItems[i].addEventListener('click', function(evt) {
				console.log("Add a new playlist");
				HMI.state = HMIState.CREATE_PLAYLIST;
				HMI.print();
			});
		}
	},
	bindCreatePlayList: function() {
		var btnItems = document.getElementsByClassName('btn-add')
		for ( var i = 0; i < btnItems.length; i++) {
			btnItems[i].addEventListener('click', function(evt) {
				var name = document.getElementById("playlist_name").value;
				if (name.length > 0) {
					createNewPlaylist(name);
				}
				console.log("Create a new playlist");
				HMI.state = HMIState.RUNNING;
				HMI.print();
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
createNewPlaylist= function(name) {
	var request = new XMLHttpRequest();
    request.open("post", "http://audiosplitter.fm/assets/api/playlists/create");

    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            // Success!
            var data = JSON.parse(request.responseText);
            console.log(data)
            // Retrieve the fresh user playlist and redraw the interface
        	getUserPlaylist();
        } else {
            // We reached our target server, but it returned an error
            console.log("Error")
        }
    };

    request.onerror = function() {
        console.log("there was a connection error of some sort")
    };

    var formData = new FormData();
    formData.append('name', name);
    formData.append('private', "true");
    request.send(formData);
}

document.addEventListener('DOMContentLoaded', function () {
	if (localStorage['audiosplitter.playlist'] === undefined) {
		localStorage['audiosplitter.playlist'] = "";
	}
    HMI.print();
	getUserPlaylist();
});
# purpose
For the challenge of freeCodeCamp's ["Use the Twitchtv JSON API"](https://www.freecodecamp.com/challenges/use-the-twitchtv-json-api), and wanna make the it like a favorite channel list, with can watch live streams without leaving the webpage.

# build by

## Twitch API v5

* basically use the [Twitch Search Channels](https://dev.twitch.tv/docs/v5/reference/search/#search-channels) API to get all the channel information. Did not find the solution for get channels in one request, so the API fetching is by loop, it works, but not efficiently. 
* live stream's information is based on [Twitch Get Stream by User](https://dev.twitch.tv/docs/v5/reference/streams/#get-stream-by-user).
* embed video refers to [Twitch Embedding Video and Clips](https://dev.twitch.tv/docs/v5/guides/embed-video/). Somehow, (only) chrome can not play the video with a kind of "NullVideoAPI" and "CORS" problems, while other browsers don't have the 	
issue. Can't figure out right now, 
* wanted to add channel manually on page, not by coding, so I found [Twitch Search Channels](https://dev.twitch.tv/docs/v5/reference/search/#search-channels) to make it happen.

## Materialize v0.99.0

* It's the second time I use [Materialize](http://materializecss.com/) for making a webpage, feeling good, but still need lots of tweak to reach my expectation. 
* as a notification fuctnion, [Materialize Toasts](http://materializecss.com/dialogs.html) is easy to use. I benefit from it to info user when a channel goes online/offline from the opposite. Though the place where the "Toast" showing didn't satisfy me.
* [Floating button](http://materializecss.com/buttons.html) looks nice, but can not adapt it's way of putting a icon inside a button, cause of the click event was becoming triggered by the icon not the button. 
* [SideNav](http://materializecss.com/side-nav.html) works great, but... tweak is needed.
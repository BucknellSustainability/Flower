# Getting Started (Local Development)
Navigate to the WebServer directory with your terminal. Both of these options
assume `index.html` is located in WebServer. This is the page that is served
when navigating to the root of the website (i.e. `localhost:8080` for http-server).

## Command-line Option
Use `npm install http-server` to install the http-server package.
By default, the package is installed to `node_modules` in the current
directory. Within that folder exists your http-server folder, which *CAN* be
used for referencing it's executable, but a shorter way to do it is through the
hidden `.bin` folder found in `node_modules`. To start the server, use
`./node_modules/.bin/http-server ./`. You must then navigate to `localhost:8080`
with your web-browser.

## Atom Package Option (Continuous Change Integration Support)
__Note:__ You can use `CTRL+SHIFT+P` to bring up a search you can use to quickly
execute commands available in Atom, including those added through packages.

Open Atom. Navigate to `Packages->Settings View->Install Packages/Themes`.
Search for `atom-live-server` and install the package of the same name.
Use `File->Open Folder...` to open a new Atom window which only has the `WebServer`
folder as it's project root. (__Note:__ `atom-live-server` defaults to treating the
root of the window's main project as the server root, so having another project
open might take precedence). Use `Packages->atom-live-server->Start server` to
start the server on port __3000__. Your browser will automatically open the root
of the live server, defaulting to `index.html` if present.

Pages modified and saved while the server is running will cause the page to
automatically refresh to reflect those changes.

Use `Packages->atom-live-server->Stop...` to stop the server.


## API Keys
API Keys should not be committed to the repo so  we've made a way for each developer to use their own.
1. Create a file called `config.js` in the `Webserver` directory.
2. Add this code:
```
var config = {
  GOOGLE_MAPS_KEY : 'YOUR_API_KEY_HERE'
}
```
3. Replace all instances of `YOUR_API_KEY_HERE` with your appropriate API keys
4. In your page that uses the key, create a script tag `<script type='text/javascript' src='config.js'></script>` before the JS that uses the API key
5. To access the API key in JS, use the config JS object (ex. `config.GOOGLE_MAPS_KEY`)

This config.js won't get committed because it is in the `.gitignore` so you will need to do this for each clone of the repo, but it should persist unless you delete the file.

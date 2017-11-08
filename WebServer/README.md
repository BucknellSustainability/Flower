# Getting Started (Local Development)
Navigate to the WebServer directory with your terminal. Both of these options
assume `index.html` is located in WebServer. This is the page that is served
when navigating to the root of the website (i.e. `localhost:8000` for php-server).

## Command-line Option
Use `brew install php` on Mac or `apt install php` and choose the appropriate php version to install.  You will also need to make sure that you install the mysqli plugin.  Make sure that you installed php by running `php --version` and this should output some version number.  Navigate to your `WebServer` directory and run `php -S localhost:8000`.  If this runs without error, then you can try pulling up the page `localhost:8000` on your browser.  If all goes well, then you are set.

## Atom Package Option (Continuous Change Integration Support)
__Note:__ You can use `CTRL+SHIFT+P` to bring up a search you can use to quickly
execute commands available in Atom, including those added through packages.

Open Atom. Navigate to `Packages->Settings View->Install Packages/Themes`.
Search for `php-server` and install the package of the same name.
Open the `index.html` file in Atom and then use `Packages->PHP Server->Start in folder of current file` to
start the server on port __8000__. Your browser will automatically open the root
of the live server, defaulting to `index.html` if present.


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
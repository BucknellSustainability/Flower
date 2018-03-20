# Setting up PHP Server

## First thing to do
First thing you want to do after cloning the repo is to make all the web files accessable to other users. You can do this by running `chmod o=r <file>` or by cd'ing into the `scripts` directory and running `./setup.sh`

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


## PHP with Bucknell Apache Hosting
### Introduction
Bucknell linux accounts have a public-facing `~\public_html` which can be accessed
by navigating to `https://eg.bucknell.edu/~username` where `username` is the
user's username. Accessing a PHP file by navigating to it relative to this URL
will run the script on the server which will return the output of the PHP script
to the browser. (e.g. `public_html/index.html` can be found at
  `eg.bucknell.edu/~username/index.html`)
### Setup
By default, files are not readable by just anybody, so they won't be served
until you add the read permission to the 'Other' group for any files you want to
serve. After cloning the repo into your `~\public_html` directory and use
`chmod o=r <file>` where `<file>` is the file you want to be accessable by the general public __or__ cd into `/scripts` and run `./setup.sh`
to make all the files in the `/web` directory accessible over http.

# Compiling React Code
First you need to do a module load of the node module by running
```
module load node
```

Then you cd to the directory with the package.json file which in our case is `web/control-panel/codebase/control-panel`.  They you want to install all the packages:
```
npm install react react-scripts react-bootstrap react-dom
```

Then you need to compile the react code by running
```
npm start
```

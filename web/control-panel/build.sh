#!/bin/bash
# A script for building react source code into a production environment

module load node #loads node & npm if not loaded already

#check for dependencies & builds the control-panel
cd ./codebase/control-panel/
npm install
npm run-script build
cd ../../

#copy build files into web/control-panel
cp -R ./codebase/control-panel/build/* .

#change permissions so the browser can see the relevent files
chmod o=r index.html
chmod o=r service-worker.js
chmod o=r favicon.ico

#makes files readable
chmod -R o=r ./static 

#makes files within folders accessible
chmod o=rX ./static 
chmod -R o=rX ./static/

#!/bin/bash
# A script for building react source code into a production environment

module load node

# make sure everything except react is accessible
./setup.sh

cd ../web/control-panel/codebase/control-panel  #open development folder

npm install react react-scripts react-dom antd

npm run build              #build the application

cp -R build/* ../../       #copy files from build folder into production folder

cd ../../                  #change directory back into production folder & set proper permissions
chmod o=r ./*
chmod -R o=r static/*

chmod o=x static
chmod o=x static/*



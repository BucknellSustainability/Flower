#!/bin/bash
# A script for building react source code into a production environment

cd codebase/control-panel

npm run build          #build the application

cp -R build/* ../../ #copy files from build folder into production folder

chmod o=r ./*
chmod o=r static/*

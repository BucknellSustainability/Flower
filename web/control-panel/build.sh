#!/bin/bash
# A script for building react source code

cd codebase/control-panel
npm run build
cp -R ./build/* ../../

#!/bin/bash
cd $(dirname $BASH_SOURCE)
cd ..
rm -rf build
npm run-script build

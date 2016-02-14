#!/bin/sh
git checkout .
git pull
sudo /etc/init.d/nginx stop
forever stopall
npm install
forever start -c "npm start" .
sudo /etc/init.d/nginx start
Example unit and integration tests with corresponding security unit and integration tests.

All examples use Mocha (https://mochajs.org/) to run and target the OWASP Juice Shop (https://github.com/bkimminich/juice-shop) application 7.10.

Juice Shop has a tendancy to add request parameters in new versions or move variables around in the code, which breaks some of the unit tests. Several methods of how to install Juice Shop are available at the Juice Shop github page.

Setup Instructions:

#In Linux (tested on Ubuntu 18.04 desktop), setup with:
apt-get install nodejs npm mocha
npm install -g chai
npm install -g passwd-strength
npm install -g superagent

#npm doesn't set the NODE_PATH environment variable. Set it so Mocha finds our libraries.
export NODE_PATH=/usr/local/lib/node_modules/

#if you are not running Juice Shop locally, make sure to update the url variable in all integration tests.

mocha -R list *
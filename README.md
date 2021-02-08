# Developing a n8n Webhook trigger for Okta

## getting started

* Set up dev environment (one-time action)
  * change into your source code folder ;)
  * `mkdir n8n-dev ; cd n8n-dev ; npm install n8n ; cd ..`
  * (NOTE: different directory now!)
  * `git clone git@github.com:n8n-io/n8n-nodes-starter.git n8n-nodes-MYNODE`
  * `cd n8n-nodes-MYNODE`
  * update n8n dependencies by editing `package.json` (after doing `npm outdated`), then `npm install` (again)
  * set all the package.json metadata and update the `LICENSE.md` file
* start developing: repeat ...
    * in `n8n-nodes-MYNODE`:
      * `npm run build ; npm link`
    * in `n8n-dev`:
      * `npm link n8n-nodes-MYNODE`
      * `node_modules/n8n/bin/n8n`
  * **NOTES**
    * ([see here](https://docs.n8n.io/nodes/creating-nodes/create-node.html#create-own-custom-n8n-nodes-module))
    * **Important:** For each written node you have to add it to the `package.json` file under `n8n.nodes`.

## Hints and details

### upgrading the "getting started" repo

`git clone` the starter repository. Unfortunately it is horrendously outdated and you have to update the dependencies. The easiest way is:

* `npm install`
* `npm outdated` - and note the current versions of n8n core and workflow
  * set the dependencies of `n8n-core` and `n8n-workflow` to the "current" version shown by `npm outdated`
  * re-preform `npm install`

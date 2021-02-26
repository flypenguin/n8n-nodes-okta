# Okta API nodes for n8n

## status

* [x] calling okta api reliably
* [x] "do what i want" magic in api consumer
* [x] polling log trigger
* [ ] waiting for HTTP 429 in case of timeouts
* [x] retrieving _all_ results by using multiple calls (like [for example here](https://github.com/n8n-io/n8n/blob/c811294612d4c2cefaa8544d4b094f075ea90d49/packages/nodes-base/nodes/SendGrid/GenericFunctions.ts#L54))
* [ ] do a couple of blog posts about n8n code internals ("how to do X") which would have saved _me_ ... a couple of hours

## How to develop nodes in n8n ...

### useful links

* [node development workflow](https://docs.n8n.io/nodes/creating-nodes/create-node.html#create-own-custom-n8n-nodes-module)
* [VS code debugging of nodes](https://community.n8n.io/t/how-to-run-n8n-in-debug-mode-with-vscode/1477/2)
* [n8n data structures](https://docs.n8n.io/reference/data/data-structure.html#data-structure)
* nice source code references for ...
  * trigger nodes: [pushcut](https://github.com/n8n-io/n8n/blob/master/packages/nodes-base/nodes/Pushcut/PushcutTrigger.node.ts) (pushcut trigger node, see also [this community post](https://community.n8n.io/t/basic-example-for-http-trigger-node/4145/4)
  * polling nodes: [toggl](https://github.com/n8n-io/n8n/blob/master/packages/nodes-base/nodes/Toggl/TogglTrigger.node.ts), [clockify](https://github.com/n8n-io/n8n/blob/master/packages/nodes-base/nodes/Clockify/ClockifyTrigger.node.ts)
  * somewhat more complex transform nodes including rather complex options dependencies: [sendgrid](https://github.com/n8n-io/n8n/blob/master/packages/nodes-base/nodes/SendGrid/SendGrid.node.ts)

### getting started

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

### Hints and details

#### upgrading the "getting started" repo

`git clone` the starter repository. Unfortunately it is horrendously outdated and you have to update the dependencies. The easiest way is:

* `npm install`
* `npm outdated` - and note the current versions of n8n core and workflow
  * set the dependencies of `n8n-core` and `n8n-workflow` to the "current" version shown by `npm outdated`
  * re-preform `npm install`

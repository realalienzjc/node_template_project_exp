

## Purpose

Template project for quick starting a node.js based project.




## Commands
npm install




## TODO

* TODO: How to launch specific path html when running a local server? 

* TODO: react code, transforming

* TODO: how to bundle vendors' javascript library

* TODO: multiple scss files preprocess

* TODO: clean sass, scss cache folders

* TODO: tasks dependencies,  sequence enforcement



* SUG: research to find a way (e.g. interactive session or a config file with commenting/uncommenting) in order to generate least possible node modules inside package.json


* SUG: make it into a generator


* DONE: concat files, js, css or other resources files
  NOTE: 
  REF: http://stackoverflow.com/questions/24100357/html-reloading-using-browsersync-in-gulp
  HINT: http://stackoverflow.com/questions/17970845/are-there-any-disadvantages-to-concatenating-all-javascript-files-including-ven
  HINT: consider using webpack?


## Q & A

* Q: How to print a list of available tasks?   A: `gulp --tasks`

* Q: Quick start video tutorials?  A: https://www.youtube.com/watch?v=BwzjYK1Hd0Y , https://www.youtube.com/watch?v=LmdT2zhFmn4&list=PLv1YUP7gO_viROuRcGsDCNM-FUVgMYb_G

* Q: What's the point of concatenate all js file into one? Cons and pros?
  A: 
  HINT: https://www.quora.com/Is-it-better-to-merge-all-JavaScript-files-into-one-or-to-keep-them-separate  , webpack thing?

* Q: how to validate the gulp tasks? Any scriptable assertion?
  A:


* Q: browser selection, 
  A:
  HINT: https://www.npmjs.com/package/gulp-open
```
# example code
var os = require('os');
var open = require('gulp-open');
var browser = os.platform() === 'linux' ? 'google-chrome' : (
  os.platform() === 'darwin' ? 'google chrome' : (
  os.platform() === 'win32' ? 'chrome' : 'firefox'));
gulp.src('./package.json').pipe(open({app: 'chrome'}));
```

* Q: For browserSync() call, what's the point of ['./build/**/*.*'] before the options? Even the file changes, not task will be carried out except reporting file changed. IDEA: hook up event?
  A: 


## Trouble Shooting
 
* When 'npm install', node-sass hangs the installation, TODO:fix by manual build, ref, ???



## Purpose

Template project for quick starting a node.js based project.




## Commands
npm install



## TODO 

* TODO: How to launch specific path html when running a local server? 

* TODO: react code, transforming

* TODO: make 'build' tasks not watchified! 

* TODO: multiple scss files preprocess

* TODO: minimize the node_modules required

* TODO: TROUBLE_SHOOTING, gulp-sass not installed correctly using 'npm install gulp-sass --save-dev'


* TODO: in asset(html, css, javascript) building, try to refactor the 'browserSync.reload({ stream: true })' out of each task.
* Q: In 'watch' task, why 'browser-sync reload' is executed before 'html' changes?
  A: 


* SUG: research to find a way (e.g. interactive session or a config file with commenting/uncommenting) in order to generate least possible node modules inside package.json


* SUG: make it into a generator


* DONE: concat files, js, css or other resources files
  NOTE: not 
  REF: http://stackoverflow.com/questions/24100357/html-reloading-using-browsersync-in-gulp
  HINT: http://stackoverflow.com/questions/17970845/are-there-any-disadvantages-to-concatenating-all-javascript-files-including-ven
  HINT: consider using webpack?

* DONE: tasks dependencies,  sequence enforcement
  NOTE:  use task dependency like task("task1", ["task_before_step"]) or use module 'run-sequence'

* DONE: make a dist task with timestamp

* DONE: clean sass, scss cache folders
  NOTE: no need to clean, just for fast rebuilding.




## Q & A

* Q: How to print a list of available tasks?   A: `gulp --tasks`

* Q: Quick start video tutorials?  A: https://www.youtube.com/watch?v=BwzjYK1Hd0Y , https://www.youtube.com/watch?v=LmdT2zhFmn4&list=PLv1YUP7gO_viROuRcGsDCNM-FUVgMYb_G

* Q: What's the point of concatenate all js file into one? Cons and pros?
  A: 
  HINT: https://www.quora.com/Is-it-better-to-merge-all-JavaScript-files-into-one-or-to-keep-them-separate  , webpack thing?

* Q: how to validate the gulp tasks? Any scriptable assertion?
  A:

* Q: ``ESP`` How to ensure all tasks getting done before BrowserSync?
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

* Q: how to bundle vendors' javascript library? 
  A: See task 'vendor-js'.


* Q: What's all the options for autoprefix?
e.g. ```
// https://webstoemp.com/blog/gulp-setup/
var AUTOPREFIXER_BROWSERS = [
  'last 3 versions',
  'ie >= 8',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];
```
  A:


 
## Trouble Shooting
 
* When 'npm install', node-sass hangs the installation, TODO:fix by manual build, ref, ???

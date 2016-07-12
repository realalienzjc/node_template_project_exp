// gulpfile.js
// Heavily inspired by Mike Valstar's solution:
//   http://mikevalstar.com/post/fast-gulp-browserify-babelify-watchify-react-build/
"use strict";

var  browserify = require('browserify'),   //babelify   = require('babelify'),
        browserSync = require("browser-sync"),
        //buffer     = require('vinyl-buffer'),
        //coffeeify  = require('coffeeify'),
        del        = require('del'),
        fs         = require('graceful-fs'),
        gulp       = require('gulp'),
        autoprefixer = require('gulp-autoprefixer'),
        gutil      = require('gulp-util'),
        livereload = require('gulp-livereload'),
        rename     = require('gulp-rename'),
        sass       = require('gulp-sass'),
        //sassdoc    = require('sassdoc');
        source     = require('vinyl-source-stream'),
        sourceMaps = require('gulp-sourcemaps'),
        path       = require('path'),
        reqDir     = require('require-dir'),
        watchify   = require('watchify'),
        reload = browserSync.reload;

// require config file
// var config = require('./config.js'); // TODO: required json file import
// TODO: for the sake of simplicity, put config in gulpfile.js for the moment.
var config = {
    root: {
        src : './app',
        dest : './build'
    },

    tasks: {
      js: {
        src: 'javascripts',       // Entry point
        "entries": {
          "app": ["./main.js"]
        },
        outputDir: 'javascripts',  // Directory to save bundle to
        mapDir: 'javascripts.map',      // Subdirectory to save maps to
        outputFile: 'bundle.js' // Name to use for bundle
      },

      css: {
        src: "stylesheets",
        dest: "stylesheets",
        mapDir: 'stylesheets.map',
        autoprefixer: {
          browsers: ["last 3 version"]
        },
        sass: {
          indentedSyntax: true,
          includePaths: [
            "./node_modules/normalize.css"
          ]
        },
        extensions: ["sass", "scss", "css"]
      }
    }   
};

// production/development environment inspection
var env = !gutil.env.production? "Development" : "Production";
console.log("Building for :  ----  " + env + "  ----");


// for later even more complex task, or just moving tasks into separate files
// tasks = reqDir('tasks/');  TODO: not working, due to 'require config file' needs seperate json config file which 



// Single main.js demo
// This method makes it easy to use common bundling options in different tasks
function bundle (bundler) {

    // Add options to add to "base" bundler passed as parameter
    bundler
      .bundle()                                                        // Start bundle
      .pipe(source(config.js.src))                        // Entry point
      .pipe(buffer())                                               // Convert to gulp pipeline
      .pipe(rename(config.js.outputFile))          // Rename output from 'main.js'
                                                                              //   to 'bundle.js'
      .pipe(sourceMaps.init({ loadMaps : true }))  // Strip inline source maps
      .pipe(sourceMaps.write(config.tasks.js.mapDir))    // Save source maps to their
                                                                                      //   own directory
      .pipe(gulp.dest(config.js.outputDir))        // Save 'bundle' to build/
      .pipe(livereload());                                       // Reload browser if relevant
}


// default task
gulp.task("default", [ "clean", "build" ]); //  ,"jest"


// clean 
gulp.task('clean', function (cb) {
  del("./build/").then(function (paths) {
    fs.mkdirSync("build");
    //fs.mkdirSync(["build/stylesheets","build/javascripts", "build/images"]);  // Q: array not working
    cb();
  })
});


// build
gulp.task("build", [
  "html",
  "buildBundle",
  "images",
  "fonts",
  "extras"
], function(){
  gulp.src("dist/scripts/app.js")
  .pipe(uglify())
  .pipe(stripDebug())
  .dest("dist/scripts")
});





//HTML

// gulp.task("html", function() {
//   gulp.src("app/*.html").pipe($.useref()).pipe(gulp.dest("dist")).pipe $.size()
// });


// Images

// gulp.task "images", ->
//   gulp.src("app/images/**/*").pipe($.cache($.imagemin(
//     optimizationLevel: 3
//     progressive: true
//     interlaced: true))).pipe(gulp.dest("dist/images")).pipe $.size()

// # Fonts

// gulp.task "fonts", ->
  
//   gulp.src(require("main-bower-files")(filter: "**/*.{eot,svg,ttf,woff,woff2}").concat("app/fonts/**/*")).pipe gulp.dest("dist/fonts")
  





gulp.task('bundle', function () {
    var bundler = browserify(config.tasks.js.src)  // Pass browserify the entry point
                                .transform(coffeeify)      //  Chain transformations: First, coffeeify . . .
                                .transform(babelify, { presets : [ 'es2015' ] });  // Then, babelify, with ES2015 preset

    bundle(bundler);  // Chain other options -- sourcemaps, rename, etc.
});




// style 
gulp.task("styles", ["sass", "moveCss"]);


// Ref, https://www.sitepoint.com/simple-gulpy-workflow-sass/
// Ref, https://github.com/vigetlabs/gulp-starter  , sass part
gulp.task("sass", function() {
  var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'expanded'
  };

  var inputFiles = path.join(config.root.src, config.tasks.css.src, '/**/*.{' + config.tasks.css.extensions + '}');
  var dest = path.join(config.root.dest, config.tasks.css.dest);

  var autoprefixerOptions = {
    browsers: ['last 3 version']
  };

  return gulp
    .src(inputFiles)
    .pipe(sourceMaps.init())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(sourceMaps.write(config.tasks.css.mapDir)) // NOTE: this line should appear just before 'gulp.dest'
    .pipe(gulp.dest(dest))
    // .pipe(sassdoc())
    // .resume();  // http://sassdoc.com/gulp/#drain-event
});
/*
gulp.task("sass", function() {
   gulp.src(paths.src)
    .pipe(gulpif(!global.production, sourcemaps.init()))   // TODO: env test
    .pipe(sass(config.tasks.css.sass))
    .on('error', handleErrors)                              // TODO: error handling
    .pipe(autoprefixer(config.tasks.css.autoprefixer))
    .pipe(gulpif(global.production, cssnano({autoprefixer: false})))
    .pipe(gulpif(!global.production, sourcemaps.write()))
    .pipe(gulp.dest(paths.dest))
    .pipe(browserSync.stream())                       // TODO: what 
}

});  */


// TODO: can it be minify?
gulp.task("moveCss", function() {
  // the base option sets the relative root for the set of files,
  // preserving the folder structure
  return gulp.src([ "./app/stylesheets/**/*.css" ], {base: "./app/stylesheets/"} )
  .pipe(gulp.dest("./build/stylesheets"));
});
  
  





gulp.task('sass:watch', function () {
  var inputFiles = path.join(config.root.src, config.tasks.css.src, '/**/*.{' + config.tasks.css.extensions + '}');

  gulp.watch(inputFiles, ['sass']);
});








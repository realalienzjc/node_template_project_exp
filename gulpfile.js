// gulpfile.js
// Heavily inspired by Mike Valstar's solution:
//   http://mikevalstar.com/post/fast-gulp-browserify-babelify-watchify-react-build/
"use strict";

var  browserify = require('browserify'),   //babelify   = require('babelify'),
        browserSync = require("browser-sync"),
        buffer     = require('vinyl-buffer'),
        //coffeeify  = require('coffeeify'),
        del        = require('del'),
        fs         = require('graceful-fs'),
        gulp       = require('gulp'),
        autoprefixer = require('gulp-autoprefixer'),
        gulpif     = require('gulp-if'),
        gutil      = require('gulp-util'),
        livereload = require('gulp-livereload'),
        minifycss  = require('gulp-minify-css'),
        notify     = require('gulp-notify'),
        rename     = require('gulp-rename'),
        sass       = require('gulp-sass'),
        streamify  = require('gulp-streamify'),
        uglify     = require('gulp-uglify'),
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

// production/development environment inspection,  "gulp --production" for prod. env.
var env = gutil.env.production? "Production" : "Development" ;
console.log("Building for :  ----  " + env + "  ----");
var production = gutil.env.production
var development = !production
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
gulp.task('default', ['html', 'express', 'watch', 'browserify'], function() {

});

// gulp.task("default", [ "clean", "build" ]); //  ,"jest"


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


// watch
gulp.task("watch", function() {
  gulp.watch('./app/stylesheets/**/*.scss', ['sass']);
  gulp.watch('./app/javascripts/**/*.js', [''])
  gulp.watch('./app/*.js', ['']) 
});



gulp.task('browserify',  function(options) {
    var appBundler = browserify({
        entries: ['./app/main.js'], // Only need initial file, browserify finds the deps
        transform: [], // reactify : We want to convert JSX to normal javascript
        debug: !production,
        paths: ['./app/'],
        cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify
    });

    // Ref. https://www.codementor.io/reactjs/tutorial/react-js-browserify-workflow-part-2
    /* This is the actual rebundle process of our application bundle. It produces
    a "main.js" file in our "build" folder. */
    var rebundle = function () {
      var start = Date.now();
      console.log('Building APP bundle');
      appBundler.bundle()
        .on('error', gutil.log)
        .pipe(source('main.js' ))
        .pipe(gulpif(!development, streamify(uglify())))
        .pipe(gulp.dest("./build/"))
        .pipe(gulpif(development, livereload())) // It notifies livereload about a change if you use it
        .pipe(notify(function () {
          console.log('APP bundle built in ' + (Date.now() - start) + 'ms');
        }));
    };


    /* When we are developing we want to watch for changes and
    trigger a rebundle */
    if (options.development) {
      appBundler = watchify(appBundler);
      appBundler.on('update', rebundle);
    }
    
    // And trigger the initial bundling
    rebundle();


    // var watcher  = watchify(bundler);
});


//HTML
gulp.task("html", function() {
  gulp.src("app/html/**/*.html", { base: "./app/"})
  // .pipe($.useref())
  .pipe(gulp.dest("build"))
  // .pipe $.size()
});


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
    .pipe(gulpif(!production, sourceMaps.init()))
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(autoprefixer(autoprefixerOptions))
    .pipe(gulpif(!production, sourceMaps.write(config.tasks.css.mapDir))) // NOTE: this line should appear just before 'gulp.dest'
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(gulp.dest(dest))
    // .pipe(sassdoc())
     // .on('error', handleErrors)                              // TODO: error handling
    // .resume();  // http://sassdoc.com/gulp/#drain-event
    // .pipe(browserSync.stream())                       // TODO: what 
});





// Development
gulp.task('express', function() {
  var express = require('express');
  var app = express();  //  TypeError: express is not a function
  console.log("------------------ " + __dirname);
  app.use(express.static('./build'));
  app.listen(4000, '0.0.0.0');
});





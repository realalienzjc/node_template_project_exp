// gulpfile.js


"use strict";

// ////////////////////////////////////////////////
// Required
// ///////////////////////////////////////////////
var browserify = require('browserify'),
    browserSync= require("browser-sync"),
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
    watchify   = require('watchify');


// ////////////////////////////////////////////////
// Configuration 
// ///////////////////////////////////////////////
// require config file
// var config = require('./config.js'); // TODO: required json file import
// NOTE: for the sake of simplicity, put config in gulpfile.js for the moment.
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
        mapDir: './build/maps',      // Subdirectory to save maps to
        outputFile: 'bundle.js' // Name to use for bundle
      },

      css: {
        src: "stylesheets",
        dest: "stylesheets",
        mapDir: './build/maps',
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


// ////////////////////////////////////////////////
// Environment 
// ///////////////////////////////////////////////
// production/development environment inspection,  "gulp --production" for prod. env.
var env = gutil.env.production? "Production" : "Development" ;
console.log("Building for :  ----  " + env + "  ----");
var production = gutil.env.production
var development = !production

// NOTE: another way of getting env  (Ref. https://github.com/joellongie/SuperCell )
// env = process.env.NODE_ENV;   // in package.json, {scripts: {start: NODE_ENV=production gulp}}



// for later even more complex task, or just moving tasks into separate files
// tasks = reqDir('tasks/');  TODO: not working, due to 'require config file' needs seperate json config file which 



// gulp.task("default", [ "clean", "build" ]); //  ,"jest"


// default task
gulp.task('default', ['html',  'js',  'watch', 'browser-sync']);  //'express'



// clean 
gulp.task('clean', function (cb) {
  del("./build/").then(function (paths) {
    fs.mkdirSync("build");
    //fs.mkdirSync(["build/stylesheets","build/javascripts", "build/images"]);  // Q: array not working
    cb();
  })
});


// watch
gulp.task("watch", function() {
  gulp.watch('./app/stylesheets/**/*.scss', ['sass']);
  gulp.watch('./app/javascripts/**/*.js', ['js']);
  gulp.watch('./app/*.js', ['js']);
  gulp.watch('./app/html/*.html', ['html']); // Q: not working? A: 
});


gulp.task('js',  function(options) {
    var appBundler = browserify({
        entries: ['./app/main.js'], // Only need initial file, browserify finds the deps
        transform: [], // reactify : We want to convert JSX to normal javascript
        debug: !production,
        paths: ['./app/'],  //  to avoid copying ./app into ./build/app
        cache: {}, packageCache: {}, fullPaths: true // Requirement of watchify
    });

    // Ref. https://www.codementor.io/reactjs/tutorial/react-js-browserify-workflow-part-2
    /* This is the actual rebundle process of our application bundle. It produces
    a "main.js" file in our "build" folder. */
    var rebundle = function () {
      var start = Date.now();
      console.log('Building APP bundle');
      appBundler.bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, gutil.colors.red(
           '\n\n*********************************** \n' +
          'BROWSERIFY ERROR:' +
          '\n*********************************** \n\n'
          )))
        .pipe(source('main.js' ))   // Q: tried sourceFile
        .pipe(buffer())
        .pipe(rename({suffix: '.min'}))
        .pipe(uglify().on('error', gutil.log)) // .pipe(gulpif( production, streamify(uglify())))
        .pipe(gulpif( development, sourceMaps.init({loadMaps: true}))) // NOTE: map file has to be generated after uglifys
        .pipe(gulpif( development, sourceMaps.write("./build/maps")))
        .pipe(gulp.dest("./build/"))
        .pipe(browserSync.reload({ stream: true })) // .pipe(livereload())// It notifies livereload about a change if you use it
        .pipe(notify(function () {
          console.log('APP bundle built in ' + (Date.now() - start) + 'ms');
        }));
    };

    /* When we are developing we want to watch for changes and
    trigger a rebundle */
    if (development) {
      appBundler = watchify(appBundler);
      appBundler.on('update', rebundle);
    }
    
    // And trigger the initial bundling
    rebundle();
});


//HTML
gulp.task("html", function() {
  gulp.src("app/html/**/*.html", { base: "./app/"})
  .pipe(gulp.dest("build"))
  .pipe(browserSync.reload({ stream: true }));
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
  


// style 

// Ref, https://www.sitepoint.com/simple-gulpy-workflow-sass/
// Ref, https://github.com/vigetlabs/gulp-starter  , sass part
gulp.task("sass", function() {
  var inputFiles = path.join(config.root.src, config.tasks.css.src, '/**/*.{' + config.tasks.css.extensions + '}');
  var dest = path.join(config.root.dest, config.tasks.css.dest);

  gulp
    .src(inputFiles)
    .pipe(gulpif( development, sourceMaps.init()))
    .pipe(gulpif( production, sass({ outputStyle: 'compressed' }),
        sass({ outputStyle: 'expanded' })))
    .on('error', gutil.log.bind(gutil, gutil.colors.red(
         '\n\n*********************************** \n' +
        'SASS ERROR:' +
        '\n*********************************** \n\n'
        )))
    .pipe(autoprefixer({
      browsers: ['last 3 version'], 
      cascade: false
      }))
    .pipe(minifycss())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulpif( development, sourceMaps.write("../maps"))) // NOTE: this line should appear just before 'gulp.dest'
    .pipe(gulp.dest(dest))
    .pipe(browserSync.reload({ stream: true }));
    // .pipe(sassdoc())
     // .on('error', handleErrors)                              // TODO: error handling
    // .resume();  // http://sassdoc.com/gulp/#drain-event
    // .pipe(browserSync.stream())                       // TODO: what 
});


gulp.task('browser-sync', function () {
  browserSync({
    server: {
      baseDir: './build/',
      routes: {
        "/" : "./html/index.htm"   // TODO: not serving from path /html/index.html
      }
    },
  });
});



// ////////////////////////////////////////////////
// Extra 
// ///////////////////////////////////////////////
gulp.task('express', function() {
  var express = require('express');
  var app = express();  //  TypeError: express is not a function
  app.use(express.static('./build'));
  app.listen(4000, '0.0.0.0');
});


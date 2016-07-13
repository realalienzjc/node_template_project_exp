// gulpfile.js


"use strict";

// ////////////////////////////////////////////////
// Required
// ///////////////////////////////////////////////
var browserify = require('browserify'),
    browserSync= require("browser-sync"),
    buffer     = require('vinyl-buffer'),
    flatten = require('gulp-flatten'),
    //coffeeify  = require('coffeeify'),
    del        = require('del'),
    fs         = require('graceful-fs'),
    gulp       = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    flatten    = require('gulp-flatten'),
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
        src: 'js',       // Entry point
        "entries": {
          "app": ["./main.js"]
        },
        outputDir: 'js',  // Directory to save bundle to
        mapDir: './build/maps',      // Subdirectory to save maps to
        outputFile: 'bundle.js' // Name to use for bundle
      },

      css: {
        src: "style",
        dest: "css",
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
        extensions: ["sass", "scss"]  //  , "css"
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

// NOTE: for later even more complex tasks, or just moving tasks into separate files
// tasks = reqDir('tasks/');  TODO: not working, due to 'require config file' needs seperate json config file which 


// default task
gulp.task('default', ['html', 'style', 'js',  'watch', 'browser-sync']);  //'express'

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
  gulp.watch('./app/js/**/*.js', ['js']);
  gulp.watch('./app/*.js', ['js']);

  gulp.watch('./app/style/css/**/*.css', ['copy-css']);
  gulp.watch('./app/style/**/*.scss', ['sass']);

  gulp.watch('./app/html/*.html', ['html']);
});

// browser-sync
gulp.task('browser-sync', function () {
  browserSync(['./build/css/**/*.css', './build/js/**/*.js', './build/html/**/*.html'], {
    server: {
      baseDir: './build/',
      routes: {
        "/" : "./html/index.htm"   // TODO: not serving from path /html/index.html
      }
    },
  });
});

// javascript
gulp.task('js',  function(options) {
    var appBundler = browserify({
        entries: ['./app/main.js'], // Only need initial file, browserify finds the deps
        transform: [], // reactify : We want to convert JSX to normal javascript
        debug: !production,
        paths: ['./app/'],  //  NOTE: to avoid copying ./app into ./build/app
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
        .pipe(gulpif( development, sourceMaps.write("./maps")))
        .pipe(gulp.dest("./build/"))
        .pipe(browserSync.reload({ stream: true })) // .pipe(livereload())// It notifies livereload about a change if you use it
        .pipe(notify(function () {
          console.log('APP bundle built in ' + (Date.now() - start) + 'ms'); // TODO: why prompt twice? 
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
gulp.task('copy-fonts', function() {
  files = glob.sync('app/font/**/*.{ttf,woff,eof,svg}');
  gulp.src(files)
  .pipe(gulp.dest('build/fonts'))
  .pipe(browserSync.reload({ stream: true }));
});

// style 
gulp.task("style", ['sass', 'copy-css']);

gulp.task("copy-css", function(){
    gulp.src('app/style/**/*.css')
    .pipe(rename({suffix: '.min'}))
    .pipe(minifycss())
    .pipe(flatten())
    .pipe(gulp.dest('./build/css'))
    .pipe(browserSync.reload({ stream: true }));
});


// Ref, https://www.sitepoint.com/simple-gulpy-workflow-sass/
// Ref, https://github.com/vigetlabs/gulp-starter  , sass part
gulp.task("sass", function() {
  gulp
    .src('app/style/scss/**/*.{sass,scss}')
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
    .pipe(flatten())
    .pipe(gulpif( development, sourceMaps.write("../maps"))) // NOTE: this line should appear just before 'gulp.dest' and after 'flatten'
    .pipe(gulp.dest('build/css'))
    .pipe(browserSync.reload({ stream: true }));
    // .pipe(sassdoc())
    // .resume();  // http://sassdoc.com/gulp/#drain-event
});



// ////////////////////////////////////////////////
// Extra 
// ///////////////////////////////////////////////
gulp.task('express', function() {
  var express = require('express');
  var app = express();
  app.use(express.static('./build'));
  app.listen(4000, '0.0.0.0');
});


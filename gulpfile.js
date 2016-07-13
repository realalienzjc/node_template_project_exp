// gulpfile.js


"use strict";

// ////////////////////////////////////////////////
// Required
// ///////////////////////////////////////////////
var browserify = require('browserify'),
    browserSync= require("browser-sync"),
    buffer     = require('vinyl-buffer'),
    flatten = require('gulp-flatten'),
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
    scss       = require('gulp-scss'),
    streamify  = require('gulp-streamify'),
    uglify     = require('gulp-uglify'),
    imagemin   = require('gulp-imagemin'),
    //sassdoc    = require('sassdoc');
    source     = require('vinyl-source-stream'),
    sourceMaps = require('gulp-sourcemaps'),
    path       = require('path'),
    reqDir     = require('require-dir'),
    watchify   = require('watchify'),
    runSequence= require('run-sequence'),
    zip        = require('gulp-zip');


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
gulp.task('default', [ 'browser-sync']);

// clean 
gulp.task('clean', function (cb) {
  del("./build/").then(function (paths) {
    fs.mkdirSync("build");
    cb();
  })
});

//build
gulp.task('build', ['html','js', 'style' ]) // images, font

// watch
gulp.task("watch", function() {
  gulp.watch('./app/js/vendor/**/**.js', ['vendor-js']);
  gulp.watch(['./app/js/**/*.js', '!./app/js/vendor/**/*.js'], ['main-js']);

  gulp.watch('./app/style/css/**/*.css', ['copy-css']);
  gulp.watch('./app/style/**/*.scss', ['scss']);

  gulp.watch('./app/html/*.html', ['html']);

  // images, fonts, etc


});

// browser-sync
gulp.task('browser-sync', ['build', 'watch'], function () {
  // NOTE: if adding '['./build/css/**/*.css', './build/js/**/*.js', './build/html/**/*.html'],' 
  // before options of browserSync, then server will detec
  browserSync({
    server: {
      baseDir: './build/',
      routes: {
        "/" : "./html/index.html"   // TODO: not serving from path /html/index.html
      }
    },
  });
});


gulp.task('browsersync-reload', function () {
    browserSync.reload({ stream: true })
});

// javascript
gulp.task('js', function(){
  // NOTE: if use steps dependencies, the BrowserSync in the default task will not be carried out!
  runSequence('vendor-js', 'main-js'); 
}); 

gulp.task('vendor-js', function(){
  gulp.src([
          'app/js/vendor/**/*.js',
      ])
    // .pipe(concat('allVendorJs.js'))    // TIP: uncomment if necessary
    // .pipe(rename({suffix: '.min'}))
    .pipe(gulpif(production,uglify()))
    .pipe(gulp.dest('./build/js/'))
    .pipe(browserSync.reload({ stream: true }));
});

gulp.task('main-js',  function(options) {
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
      // NOTE: must 'return' to allow synchronized build before starting a server
      return appBundler.bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, gutil.colors.red(
           '\n\n*********************************** \n' +
          'BROWSERIFY ERROR:' +
          '\n*********************************** \n\n'
          )))
        .pipe(source('main.js' ))   // Q: tried sourceFile
        .pipe(buffer())
        .pipe(rename({suffix: '.min'}))
        .pipe(gulpif( production, uglify().on('error', gutil.log))) // .pipe(gulpif( production, streamify(uglify())))
        .pipe(gulpif( development, sourceMaps.init({loadMaps: true}))) // NOTE: map file has to be generated after uglifys
        .pipe(gulpif( development, sourceMaps.write("./maps")))
        .pipe(gulp.dest("./build/"))
        .pipe(browserSync.reload({ stream: true })) // .pipe(livereload())// It notifies livereload about a change if you use it
        .pipe(notify(function () {
          console.log('APP bundle built in ' + (Date.now() - start) + 'ms'); // TODO: why prompt twice? 
          //browserSync.reload({ stream: true });
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
gulp.task('images', function() {
  gulp.src('app/images/**/*.*')
    .pipe(imagemin())
    .pipe(gulp.dest('build/images'))
    .pipe(browserSync.reload({ stream: true }));
});

// # Fonts
gulp.task('copy-fonts', function() {
  files = glob.sync('app/font/**/*.{ttf,woff,eof,svg}');
  gulp.src(files)
  .pipe(gulp.dest('build/fonts'))
  .pipe(browserSync.reload({ stream: true }));
});

// style 
gulp.task("style", ['scss', 'copy-css']);

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
gulp.task("scss", function() {
  gulp
    .src('app/style/scss/**/*.{sass,scss}')
    .pipe(gulpif( development, sourceMaps.init()))
    .pipe(gulpif( production, scss(),  //sass({ outputStyle: 'compressed' })
        scss()))   //  sass({ outputStyle: 'expanded' })    // TODO: any options for scss's outputStyle
    .on('error', gutil.log.bind(gutil, gutil.colors.red(
         '\n\n*********************************** \n' +
        'SCSS ERROR:' +
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


gulp.task('dist', function () {
    del("./dist/").then(function (paths) {
      fs.mkdirSync("dist");
      //fs.mkdirSync(["build/stylesheets","build/javascripts", "build/images"]);  // Q: array not working
      cb();
    });
    var timestamp = getStamp();
    gulp.src(['./build/**', '!./build/{maps,maps/**}'])
        .pipe(zip('dist.zip'))
        .pipe(rename('template_project_'+timestamp+'.zip')) // SUG: read package.json for project name!
        .pipe(gulp.dest('./dist'));
});



// ////////////////////////////////////////////////
// Extra 
// ///////////////////////////////////////////////

// load express server
gulp.task('express', function() {
  var express = require('express');
  var app = express();
  app.use(express.static('./build'));
  app.listen(4000, '0.0.0.0');
});

// concat all vendor js ( or with main.min.js) into one file
// REF. http://stackoverflow.com/questions/31011717/gulp-concat-and-uglify-files-and-concat-with-vendor
gulp.task('vendor-js-concat', function() {
  gulp.src([
          './app/js/vendor/**/*.js'
      ])
    .pipe(concat('vendor.js'))
    .pipe(uglify())
    .pipe(rename({suffix:".min"}))
    .pipe(gulp.dest('./build/js/'));
});
gulp.task('allJs', ['vendor-js-concat'], function() {
    gulp.src([
          './build/js/vendor.js',
          './build/js/main.min.js'
      ])
    .pipe(concat('allJs.js'))
    .pipe(gulp.dest('./build/js/'));
})


gulp.task('help', function(){
    console.log("");
    console.log("Run development, use:");
    console.log("      gulp default");
    console.log("Run production, use:");
    console.log("      gulp default --production");
    console.log("");
    console.log("gulp --tasks   to see all available tasks.")
    console.log("");
});

//  NOT WORKING
// // run a local server and open target page
// // REF: http://stackoverflow.com/questions/35075353/getting-error-when-using-default-task-in-gulp-shows-the-following-error-in-gitb
// var connect = require('gulp-connect');  // Runs a local dev server
// var open = require('gulp-open');    // Open a URL in a web browser
// var config1 = {
//   port: 9005,
//   devBaseUrl: 'http://localhost',
//   paths: {
//       html:  './html/*.html',
//       dist: './build'
//   }
// }

// gulp.task('connect', function(){  
//   connect.server({
//     root: config1.paths.dist,
//     port: config1.port,
//     base: config1.devBaseUrl,
//     livereload: true
//   });
// });


// gulp.task('open-page',['connect'], function(){ 
//   gulp.src('./build/html/index.html')
//     .pipe(open());
// });


// ////////////////////////////////////////////////
// Configuration  (NOT IN USE)
// * trade string duplicaton for tasks readability, 
// * refactor string into config later once gulefile.js is stable)
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
// Util 
// ///////////////////////////////////////////////
//build datestamp for cache busting
var getStamp = function() {
  var myDate = new Date();

  var year = myDate.getFullYear().toString(),
    month = ('0' + (myDate.getMonth() + 1)).slice(-2),
    day = ('0' + myDate.getDate()).slice(-2),
    hr = myDate.getHours().toString(), 
    min = myDate.getMinutes().toString();

  var dateStr = year + month + day + "_"+hr+min;
  return dateStr;
};

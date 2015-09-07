var gulp        = require('gulp');
var shell       = require('gulp-shell');
var connect     = require('gulp-connect');
var sass        = require('gulp-sass');
var clipboard   = require('gulp-clipboard');
var uglify      = require('gulp-uglify');
var uglifycss   = require('gulp-uglifycss');
var path        = require('path');
var _           = require('lodash');

var bower = { path:'./bower_components/' };
_.extend(bower, {
    bootstrap: { path: path.join(bower.path, 'bootstrap-sass/')},
    jquery: {path: path.join(bower.path, 'jquery/')},
    prism: { path: path.join(bower.path, 'prism/')}
});

// Task 1: Build the docs
gulp.task('docs',shell.task([
    'npm i && ./node_modules/doxx/bin/doxx -s '+ 
    process.cwd() + '/test/ --target ' + 
    process.cwd() + '/docs/'+ ' --template '+ process.cwd() + '/template/index.jade']))



// Task 2: Build Sass and copy it into docs and assets
gulp.task('sass', ['docs'], function() {
    return gulp.src("./scss/*.scss")
        .pipe(sass({
            includePaths:[
                path.join(bower.bootstrap.path, 'assets/stylesheets')
            ]
        }))
        .pipe(sass().on('error', sass.logError))
        .pipe(uglifycss({
          'max-line-len': 80
        }))
        .pipe(gulp.dest("docs/css/"))
        .pipe(gulp.dest("assets/css/"));
});

// Task 3: Copy the files from bower into js and assets
gulp.task('copy:js', ['docs'], function () {
    return gulp.src([
      bower.prism.path + 'prism.js',
      bower.bootstrap.path + 'assets/javascripts/bootstrap/affix.js',
      bower.bootstrap.path + 'assets/javascripts/bootstrap/dropdown.js',
      bower.bootstrap.path + 'assets/javascripts/bootstrap/scrollspy.js',
      bower.bootstrap.path + 'assets/javascripts/bootstrap.min.js',
      bower.jquery.path + 'dist/jquery.min.js'
        ])
    .pipe(uglify())
    .pipe(clipboard())
    .pipe(gulp.dest("docs/js/"))
    .pipe(gulp.dest('assets/js'));
});

// Task 4: Copy the files from bower into css
gulp.task('copy:css', ['docs'], function () {
    return gulp.src([
      bower.prism.path + 'themes/prism.css'
    ])
    .pipe(clipboard())
    .pipe(uglifycss({
      'max-line-len': 80
    }))
    .pipe(gulp.dest("docs/css/"));
});

// Create server
gulp.task('connect', function() {
  connect.server({
    root: 'docs/',
    livereload: true
  });
});

// Reload the page
gulp.task('html', function () {
  gulp.src('docs/*.html')
    .pipe(connect.reload());
});

// Watch for changes
gulp.task('watch', function () {
  gulp.watch(['template/*.jade', 'scss/*.scss'], ['docs', 'sass', 'copy:js', 'copy:css']);
});

// Default
gulp.task('default', ['build','connect', 'watch']);
// Build
gulp.task('build', ['docs', 'sass','copy:js', 'copy:css']);
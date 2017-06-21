var gulp = require('gulp')
var uglify = require('gulp-uglify')
var sass = require('gulp-sass')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
// var open = require('gulp-open')
var prefix = require('gulp-autoprefixer')
var brfs = require('gulp-brfs')
var livereload = require('gulp-livereload')
var minifycss = require('gulp-minify-css')
var sourcemaps = require('gulp-sourcemaps')
var rename = require('gulp-rename')
var filter = require('gulp-filter')
var sequence = require('run-sequence')
var clean = require('gulp-clean')
var sassImporter = require('sass-module-importer')
var dependencies = require('gulp-html-dependencies')
// var injectReload = require('connect-livereload')
var touch = require('touch')
var wrap = require('pumpify').obj
// var zip = require('gulp-zip')
// var util = require('util')
// var pkg = require('./package.json')


gulp.task('server', () => {
  require('./server.js')
})

gulp.task('clean', () => {
  return wrap(
    gulp.src([
      './app/public/js/*.js',
      './app/public/css/*.css',
      './app/public/*.html',
      './app/public/vendor',
    ], { read: false }),
    clean()
  )
})

gulp.task('styles', () => {
  return wrap(
    gulp.src('./app/scss/*.scss'),
    sass({ importer: sassImporter() }),
    prefix(),
    sourcemaps.write(),
    gulp.dest('./app/public/css'),
    rename({ suffix: '.min' }),
    minifycss(),
    gulp.dest('./app/public/css')
  )
})

gulp.task('html', () => {
  return wrap(
    gulp.src('./app/*.html'),
    dependencies({
      dest: 'app/public',
      prefix: '/vendor',
    }),
    gulp.dest('./app/public/')
  )
})

gulp.task('reloadcss', () => {
  return wrap(
    gulp.src('./app/public/css/main.css'),
    livereload()
  )
})

gulp.task('browserify', () => {
  return wrap(
    browserify({
      entries: './app/index.js',
      standalone: 'app'
    }).bundle(),
    source('bundle.js'),
    brfs(),
    buffer(),
    sourcemaps.init({loadMaps: true}),
    uglify(),
    sourcemaps.write('./'),
    gulp.dest('./app/public/js'),
    livereload()
  )
})

gulp.task('serverScripts', () => {
  touch('gulpfile.js')
})

gulp.task('zip', () => {
  // return gulp.src('public#<{(||)}>#*')
  // .pipe(zip(util.format('%s-%s.zip', pkg.name, pkg.version)))
  // .pipe(gulp.dest('./'))
})

gulp.task('watch', () => {
  gulp.watch(['./app/scss/**/*.scss'], ['styles'])
  gulp.watch(['!./app/public/js/*.js', './app/**/*.js', './app/templates/*.html'], ['browserify'])
  gulp.watch(['./app/*.html'], ['html'])
  gulp.watch(['./app/public/css/main.css'], ['reloadcss'])
  gulp.watch([
    './server.js', './server/*.js', '!./gulpfile.js'
  ], ['serverScripts'])
})

gulp.task('start', () => {
  sequence('server', 'clean', ['browserify', 'styles', 'html'], 'watch')
})

gulp.task('build', () => {
  sequence('clean', ['browserify', 'styles', 'html'])
})

gulp.task('release', () => {
  sequence('clean', ['browserify', 'styles', 'html'], 'zip')
})

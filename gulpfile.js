const gulp = require('gulp')
const uglify = require('gulp-uglify')
const sass = require('gulp-sass')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const buffer = require('vinyl-buffer')
const prefix = require('gulp-autoprefixer')
const brfs = require('gulp-brfs')
const minifycss = require('gulp-minify-css')
const sourcemaps = require('gulp-sourcemaps')
const rename = require('gulp-rename')
const sequence = require('run-sequence')
const clean = require('gulp-clean')
const sassImporter = require('sass-module-importer')
const dependencies = require('gulp-html-dependencies')
const wrap = require('pumpify').obj
const nodemon = require('gulp-nodemon')

gulp.task('server', () => {
  nodemon({
    script: 'server.js', ext: 'js',
    ignore: ['app/**/*.js', 'gulpfile.js'],
    env: { 'NODE_ENV': 'development' }
  })
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
    // uglify(),
    sourcemaps.write('./'),
    gulp.dest('./app/public/js')
  )
})

gulp.task('watch', () => {
  gulp.watch(['./app/scss/**/*.scss'], ['styles'])
  gulp.watch(['!./app/public/js/*.js', './app/**/*.js', './app/templates/*.html'], ['browserify'])
  gulp.watch(['./app/*.html'], ['html'])
  gulp.watch(['./app/public/css/main.css'], ['reloadcss'])
})

gulp.task('start', () => {
  sequence('server', 'clean', ['browserify', 'styles', 'html'], 'watch')
})

gulp.task('build', () => {
  sequence('clean', ['browserify', 'styles', 'html'])
})
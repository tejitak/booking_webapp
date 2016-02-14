var gulp = require('gulp');
var del = require('del');
var argv = require('yargs').argv;
var gulpif = require('gulp-if');
var connect = require('gulp-connect');
var uglify = require('gulp-uglify');
var pleeease = require('gulp-pleeease');
var stylus = require('gulp-stylus');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var webpack = require('gulp-webpack');
var webpackConfig = require('./webpack.config.js');
var spritesmith = require('gulp.spritesmith');
var plumber = require('gulp-plumber');

var port = process.env.PORT || 8080;
var reloadPort = process.env.RELOAD_PORT || 35729;

gulp.task('clean', function () {
  return del.sync(['dist']);
});

gulp.task('stylus', function(){
  return gulp.src([
    'public/stylus/*.styl'
  ])
  .pipe(stylus())
  .pipe(pleeease())
  .pipe(minifyCss({processImport: false, keepSpecialComments: 0}))
  .pipe(rename({extname: '.css'}))
  .pipe(gulp.dest('public/css/'));
});

gulp.task('sprite', function() {
  var spriteData = gulp.src('./public/img/_sprites/**/*.png')
    .pipe(plumber())
    .pipe(spritesmith({
      imgName: '../img/sprites.png',
      cssName: 'sprites.styl',
      cssFormat: 'stylus',
      padding: 10,
      cssVarMap: function (sprite) {
        sprite.name = 'sprite-' + sprite.name;
      }
    }));
  spriteData.img.pipe(gulp.dest('./public/img/'))
  spriteData.css.pipe(gulp.dest('./public/stylus/_mixins/'))
});

gulp.task('build', function () {
  return gulp.src(webpackConfig.entry.app[0])
    .pipe(webpack(webpackConfig))
    .pipe(gulpif(argv.production, uglify()))
    .pipe(gulp.dest('public/dist/'));
});

gulp.task('serve', function () {
  connect.server({
    port: port,
    root: './public',
    livereload: {
      port: reloadPort
    }
  });
});

gulp.task('reload-js', function () {
  return gulp.src('public/dist/*.js')
    .pipe(connect.reload());
});

gulp.task('watch', function () {
  gulp.watch(['public/dist/*.js'], ['reload-js']);
  gulp.watch(['public/stylus/**/*.styl'],['stylus']);
});

gulp.task('default', ['clean', 'stylus', 'build', 'serve', 'watch']);

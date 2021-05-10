'use strict'

var gulp = require('gulp');
var nunjucks = require('gulp-nunjucks');
var sass = require('gulp-sass');
var browsersync = require('browser-sync');
var del = require('del');
var reload = browsersync.reload;
var changed = require('gulp-changed');
var imagemin = require('gulp-imagemin');
var webp = require('gulp-webp');
var clone = require('gulp-clone');
var sink = clone.sink();
var svgSprite = require('gulp-svg-sprite');
var cheerio = require('gulp-cheerio');

var path = {
  src: {
    html: 'src/*.html',
    styles: 'src/styles/*.scss',
    images: 'src/img/*.{jpg,jpeg,png,webp,svg}',
    js: 'src/js/*.js',
    svg: 'src/img/svg/*.svg'
  },
  build: {
    html: 'build/',
    styles: 'build/css/',
    images: 'build/img/',
    js: 'build/js/',
    svg: 'build/img/svg'
  },
  watch: {
    html: 'src/**/*.html',
    styles: 'src/styles/**/*.scss',
    js: 'src/js/*.js',
    images: 'src/img/**/*.{jpg,jpeg,png,webp,svg}',
    svg: 'src/img/svg/*.svg'
  },
  base: './build'
};

function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: path.base
    },
    port: 3000
  });
  done();
};

function clean() {
  return del(path.base);
};

function html() {
  return gulp
    .src(path.src.html)
    .pipe(nunjucks.compile())
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({ stream: true }));
};

function styles() {
  return gulp
    .src(path.src.styles)
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest(path.build.styles))
    .pipe(reload({ stream: true }));
};

function js() {
  return gulp
    .src(path.src.js)
    .pipe(gulp.dest(path.build.js))
    .pipe(reload({ stream: true }));
};

function images() {
  return gulp
    .src(path.src.images)
    .pipe(changed(path.build.images))
    .pipe(sink)
    .pipe(webp())
    .pipe(sink.tap())
    .pipe(imagemin([
      imagemin.mozjpeg({ quality: 75, progressive: true }),
      imagemin.optipng({ optimizationLevel: 5 }),
    ]))
    .pipe(gulp.dest(path.build.images))
    .pipe(reload({ stream: true }));
};

var svgConfig = {
  mode: {
    stack: {
      sprite: "../sprite.svg"
    }
  }
};

function svg() {
  return gulp
    .src(path.src.svg)
    .pipe(cheerio({
      run: function ($) {
        $('[fill]').removeAttr('fill');
        $('[stroke]').removeAttr('stroke');
        $('[style]').removeAttr('style');
      },
      parserOptions: { xmlMode: true }
    }))
    .pipe(svgSprite(svgConfig))
    .pipe(gulp.dest(path.build.svg))
    .pipe(reload({ stream: true }));
};

function watchFiles() {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.styles], styles);
  gulp.watch([path.watch.images], images);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.svg], svg)
};

gulp.task('html', html);
gulp.task('styles', styles);
gulp.task('img', images);
gulp.task('svg', svg);
gulp.task('js', js);

gulp.task('build', gulp.series(clean, gulp.parallel(html, styles, images, js, svg)));
gulp.task('watch', gulp.parallel(watchFiles, browserSync));

'use strict';

//npm install gulp gulp-minify-css gulp-uglify gulp-clean gulp-cleanhtml gulp-jshint gulp-strip-debug gulp-zip --save-dev

const gulp = require('gulp'),
    clean = require('gulp-clean'),
    cleanhtml = require('gulp-cleanhtml'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    stripdebug = require('gulp-strip-debug'),
    uglify = require('gulp-uglify'),
    zip = require('gulp-zip'),
    gutil = require('gulp-util');
const sourcemaps = require('gulp-sourcemaps');
const rename = require("gulp-rename");

//clean build directory
gulp.task('insideExtension-clean', function() {
    return gulp.src('insideExtension/build/*', {read: false})
        .pipe(clean());
});

//copy static folders to build directory
gulp.task('insideExtension-copy', function() {
    gulp.src('insideExtension/src/fonts/**')
        .pipe(gulp.dest('insideExtension/build/fonts'));
    gulp.src('insideExtension/src/images/**')
        .pipe(gulp.dest('insideExtension/build/images'));
    gulp.src('insideExtension/src/_locales/**')
        .pipe(gulp.dest('insideExtension/build/_locales'));
    return gulp.src('insideExtension/src/manifest.json')
        .pipe(gulp.dest('insideExtension/build'));
});

//copy and compress HTML files
gulp.task('insideExtension-html', function() {
    return gulp.src('insideExtension/src/*.html')
        .pipe(cleanhtml())
        .pipe(gulp.dest('insideExtension/build'));
});

//run scripts through JSHint
gulp.task('insideExtension-jshint', function() {
    return gulp.src('insideExtension/src/scripts/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

//copy vendor scripts and uglify all other scripts, creating source maps
gulp.task('insideExtension-scripts', ['insideExtension-jshint'], function() {
    gulp.src('insideExtension/src/scripts/vendors/**/*.js')
        .pipe(gulp.dest('insideExtension/build/scripts/vendors'));
    return gulp.src(['insideExtension/src/scripts/**/*.js', '!insideExtension/src/scripts/vendors/**/*.js'])
        .pipe(sourcemaps.init())
        //.pipe(stripdebug())
        .pipe(uglify())
        .on('error', function (err) { gutil.log(gutil.colors.red('[Error]'), err.toString()); })
        .pipe(rename({ extname: '.min.js' }))
        .pipe(sourcemaps.write(''))
        .pipe(gulp.dest('insideExtension/build/scripts'));
});

//minify styles
gulp.task('insideExtension-styles', function() {
// 	return gulp.src('src/styles/**/*.css')
// 		.pipe(minifycss({root: 'src/styles', keepSpecialComments: 0}))
// 		.pipe(gulp.dest('build/styles'));
    return gulp.src('insideExtension/src/styles/**')
        .pipe(gulp.dest('insideExtension/build/styles'));
});

//build ditributable and sourcemaps after other tasks completed
gulp.task('zip', ['insideExtension-html', 'insideExtension-scripts', 'insideExtension-styles', 'insideExtension-copy'], function() {
    var manifest = require('./insideExtension/src/manifest'),
        distFileName = manifest.name + ' v' + manifest.version + '.zip',
        mapFileName = manifest.name + ' v' + manifest.version + '-maps.zip';
    console.log(distFileName);
    //collect all source maps
    gulp.src('insideExtension/build/scripts/**/*.map')
        .pipe(zip(mapFileName))
        .pipe(gulp.dest('insideExtension/dist'));
    //build distributable extension
    return gulp.src(['insideExtension/build/**', '!insideExtension/build/scripts/**/*.map'])
        .pipe(zip(distFileName))
        .pipe(gulp.dest('insideExtension/dist'));
});

//run all tasks after build directory has been cleaned
gulp.task('insideExtension', ['insideExtension-clean'], function() {
    gulp.start('zip');
});
gulp.task('default', ['insideExtension'], function() {

});
var gulp = require('gulp'),
    ts = require('gulp-typescript'),
    sourcemaps = require('gulp-sourcemaps'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    yargs = require('yargs');
    replace = require('gulp-replace');

///////////////////////////////////////////////
//////////////////// UTILS ////////////////////
///////////////////////////////////////////////

/**
 * compile ts with amd module flag to unique file
 */
function tsToFile(file, out_dir) {
    return gulp.src('src/app/' + file + '.ts')
        .pipe(sourcemaps.init())
        .pipe(ts({
            module: "amd",
            outDir: out_dir,
            outFile: file + ".js"
        }))
        .pipe(sourcemaps.write('.', {sourceRoot: __dirname + "/src"}))
        .pipe(gulp.dest("dist/js/"));
}

/**
 * compile ts with CommonJS module flag, removing comments from code
 */
function tsCommonJS(from, to, declaration) {
    return gulp.src(from)
        .pipe(ts({
            module: "CommonJS",
            declaration: declaration,
            removeComments: true
        }))
        .pipe(gulp.dest(to));
}

///////////////////////////////////////////////
//////////////////// TASKS ////////////////////
///////////////////////////////////////////////

gulp.task('build-test', ['__typescript-tests'], function() {
    return gulp.src(['spec/test/**/*.spec.js', 'spec/test/**/*.asset.js'])
        .pipe(replace(/(?:(?:\.\.\/)+src)+/g, '../../app')) // capture strings like ../../../src
        .pipe(gulp.dest('spec/test'));
});

gulp.task('build-app', ['__typescript-app', '__typescript-config'], function() {
    console.log("app built");
});

gulp.task('build-npm', function() {
    return tsCommonJS('src/core/**/*.ts', './package', true);
});

gulp.task('build-all', ['build-app', 'build-test'], function() {
    console.log("app built");
    console.log("tests built");
});

gulp.task('run-tests', function() {
    // TODO: todo run-tests task
});

gulp.task('watch', function() {
    // TODO: todo watch task
});

gulp.task('watch-test', function() {
    // TODO: todo watch-tests task
});

gulp.task('clean', function() {
    // TODO: todo clean task
});

gulp.task('__typescript-app', function() {
   return tsToFile('app', 'dist/js/');
});

gulp.task('__typescript-config', function() {
    return tsToFile('config', 'dist/js/');
});

gulp.task('__typescript-commonjs', function() {
    return tsCommonJS('src/**/*.ts', 'spec/app/', false);
});

gulp.task('__typescript-tests', ['__typescript-commonjs'], function() {
    return tsCommonJS('spec/**/*.ts', 'spec/', false);
});
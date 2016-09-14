var gulp        = require('gulp'),
    rename      = require('gulp-rename'),
    concat      = require('gulp-concat'),
    md          = require('gulp-remarkable'),
    path        = require('path'),
    fs          = require('fs'),
    intercept   = require('gulp-intercept'),
    livereload  = require('gulp-livereload');

function fixCssJsPath(htmlFile, type){
  var outFile = htmlFile.replace(/html$/, type);
  try {
    fs.accessSync(outFile, fs.F_OK);

    // change css file's path from absolute to relative
    return path.relative(path.dirname(htmlFile), outFile);
  } catch (e) {

    // css is not defined
    return '';
  }
}

gulp.task('md', function() {
  var template = fs.readFileSync('template/index.html', 'utf8');
  gulp.src('md/*.md')
    .pipe(md({
      remarkableOptions: {
        html: true,
        typographer: true,
        quotes: '“”‘’',
        linkify: true,
        breaks: true
      }
    }))
    .pipe(intercept(function(file){
      file.contents = new Buffer(
        template
          .replace('{{content}}', file.contents)
          .replace('{{style}}', fixCssJsPath(file.path, 'css'))
          .replace('{{javascript}}', fixCssJsPath(file.path, 'js')));
      return file;
    }))
    .pipe(gulp.dest('md/'))
    .pipe(livereload());
});

gulp.task('css', function() {
  fs.unlinkSync('template/main.css');
  gulp.src('template/*.css')
    .pipe(concat('main.css'))
    .pipe(gulp.dest('template/'))
    .pipe(livereload());
});

gulp.task('default', ['md', 'css', 'watch']);

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch(['md/*.md', 'md/*.css', 'md/*.js', 'template/*.css'], function() {
    gulp.start(['md', 'css']);
  });
});

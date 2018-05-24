const gulp = require('gulp');
const sass = require('gulp-sass');
const uglify = require('gulp-uglify');

gulp.task('default', function() {
  gulp.watch('sass/**/*.scss', ['styles']);
});

gulp.task('styles', () => {
  gulp.src('sass/**/styles-*.scss')
    .pipe(sass({
      outputStyle: 'compressed',
    }))
    .pipe(gulp.dest('dist/css'));
});
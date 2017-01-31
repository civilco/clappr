const gulp = require('gulp');
const replace = require('gulp-replace');
const postcss = require('gulp-postcss');
const processClassnames = require('postcss-process-classnames');
const prettify = require('gulp-jsbeautifier');


gulp.task('build-css', () => {
  return gulp.src('./src/clappr.css')
  .pipe(postcss([
    processClassnames({ file: './temp/classnames.json' }),
  ]))
  .pipe(gulp.dest('./dist'));
});

gulp.task('build', ['build-css'], () => {
  const hashedNames = require('./temp/classnames.json');

  return gulp.src('./dist/clappr.min.js')
  .pipe(prettify())
  .pipe(replace(/class\s*\:\s*['"]([\w-]+)['"]/gmi, (match, p1)=>{

    if (hashedNames[p1]) {
      return `class: "${hashedNames[p1]}"`;
    }
    return match;
  }))


  .pipe(replace(/Class\(\s*['"]([\w- ]+)['"]\s*\)/gm, (match, p1)=>{
    let matchedNames = p1.split(' ').map(section=>hashedNames[section] || section);
    return `Class("${matchedNames.join(' ')}")`;
  }))


  .pipe(replace(/class\s*=\s*['"]([\w- ]+)['"]/gmi, (match, p1)=>{
    let matchedNames = p1.split(' ').map(section=>hashedNames[section] || section);
    return `class="${matchedNames.join(' ')}"`;
  }))

  .pipe(replace(/find\(['"]\w*(\.[\w- \,\[\]\.]+)['"]\s*\)/gmi, (match, p1)=>{
    let matches = p1.match(/\.([\w-]+)/g);
    let output = match;

    matches.map((item, index) => {
      let className = item.replace('.', '');
      let hashedClassName = hashedNames[className];
      if (hashedClassName) {
        output = output.replace(item, '.' + hashedClassName);
      }
    });

    return output;
  }))
  .pipe(gulp.dest('./dist'));
});

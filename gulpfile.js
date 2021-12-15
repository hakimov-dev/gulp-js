// function defaultTask(cb) {
//     // place code for your default task here
//     cb();
//   }
  
//   exports.default = defaultTask

const {src, dest, watch, parallel} = require('gulp')
const scss = require('gulp-sass')(require('sass'))
const browserSync = require('browser-sync').create()
const autoprefixer = require('gulp-autoprefixer')
const rename = require("gulp-rename")
const cleanCSS = require('gulp-clean-css')
const gcmq = require('gulp-group-css-media-queries')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify-es').default;

// Live serever
function liveServer(){
    browserSync.init({
        server:{
            baseDir:'app/'
        }, 
        port: 3000,
        notify:false
    })
}

// Css
function styles(){
    return src('app/scss/style.scss')
    .pipe(scss({
        outputStyle: 'expanded'
    }))
    .pipe(autoprefixer({
       overrideBrowserslist: ['last 10 versions'],
       cascade: false,
       grid: true
    }))
    .pipe(gcmq())
    .pipe(dest('app/css'))
    .pipe(cleanCSS())
    .pipe(rename({
        extname: ".min.css"
    }))
    .pipe(dest('app/css'))
    .pipe(browserSync.stream())
}

// js 
function js(){
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js/'))
    .pipe(browserSync.stream())
}


// Watching
function watching(){
     watch(['app/scss/**/*.scss'], styles)
     watch(['app/index.html']).on('change', browserSync.reload)
     watch(['app/js/**/*.js', '!app/js/main.min.js'], js)
}


// Exports
exports.style = styles
exports.watching = watching
exports.liveServe = liveServer
exports.js = js

exports.default = parallel(styles, js, watching, liveServer)

// function defaultTask(cb) {
//     // place code for your default task here
//     cb();
//   }
  
//   exports.default = defaultTask

const {src, dest, watch, parallel, series} = require('gulp')
const scss               = require('gulp-sass')(require('sass'))
const browserSync        = require('browser-sync').create()
const autoprefixer       = require('gulp-autoprefixer')
const rename             = require("gulp-rename")
const cleanCSS           = require('gulp-clean-css')
const gcmq               = require('gulp-group-css-media-queries')
const concat             = require('gulp-concat')
const uglify             = require('gulp-uglify-es').default
const del                = require('del')
const imagemin           = 'gulp-imagemin'

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

// Reload dist
function cleanDist(){
    return del('dist')
}

// for Images compile
function images(){
   return src('app/image/**/*')   
        .pipe(imagemin([
        imagemin.gifsicle({interlaced: true}),
         imagemin.mozjpeg({quality: 75, progressive: true}),
         imagemin.optipng({optimizationLevel: 5}),
         imagemin.svgo({
             plugins: [
                 {removeViewBox: true},
                 {cleanupIDs: false}
             ]
         })
     ]))
     .pipe(dest('dist/image/'))
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

// Build
function build(){
    return src([
       'app/css/style.css',
       'app/css/style.min.css',
       'app/fonts/*',
       'app/js/main.min.js',
       'app/*.html'
    ]), {base: 'app'}
    .pipe(dest('dist/'))
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
exports.img = images

exports.build = series(cleanDist, images, build)
exports.default = parallel(styles, js, watching, liveServer)

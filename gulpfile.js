const {src, dest, watch, series, parallel}  = require('gulp')
const scss                                  = require('gulp-sass')(require('sass'))
const browserSync                           = require('browser-sync').create()
const autoprefixer                          = require('gulp-autoprefixer')
const rename                                = require("gulp-rename")
const cleanCSS                              = require('gulp-clean-css')
const gcmq                                  = require('gulp-group-css-media-queries')
const concat                                = require('gulp-concat')
const uglify                                = require('gulp-uglify-es').default
const del                                   = require('del')
const imagemin                              = require('gulp-imagemin')

function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'app/'
        },
        port: 3000,
        notify: false
    })
}

// Cleaning dist folder
function cleanDist() {
    return del('dist')
}

function images() {
    return src('app/img/**/*')
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

        .pipe(dest('dist/imgs/'))
}

// CSS
function css() {
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


function js() {
    return src([
        'node_modules/jquery/dist/jquery.js',
        'app/js/main.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('app/js/'))
        .pipe(browserSync.stream())
}

function build() {
    return src([
        'app/css/style.css',
        'app/css/style.min.css',
        'app/fonts/**/*',
        'app/js/main.min.js',
        'app/*.html'
    ], {base: 'app'})
        .pipe(dest('dist/'))
}


// WATCHING
function watching() {
    watch(['app/scss/**/*.scss'], css)
    watch(['app/index.html']).on('change', browserSync.reload)
    watch(['app/js/**/*.js', '!app/js/main.min.js'], js)
}


exports.css = css
exports.watching = watching
exports.browsersync = browsersync
exports.js = js
exports.images = images
exports.cleanDist = cleanDist

exports.build = series(cleanDist, images, build)
exports.default = parallel(css, js, browsersync, watching)


const gulp = require('gulp')
const less = require('gulp-less')
const LessAutoprefix = require('less-plugin-autoprefix')
const autoprefix = new LessAutoprefix({
    browsers: ['last 2 versions']
})
const del = require('del')
const babel = require('gulp-babel')
const browserSync = require('browser-sync').create()
const reload = browserSync.reload
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const babelify = require('babelify')

function main(cb) {
    (async () => {
        await del.sync('dist')
        //less
        gulp.src('./src/index.less').pipe(less({
            plugins: [autoprefix]
        })).pipe(gulp.dest('./dist'))
        //js
        // gulp.src('./src/index.js')
        browserify({
            entries:['./src/index.js']
        })
        .transform(babelify,{
            presets: ['@babel/env','@babel/preset-react'],
            plugins: ["@babel/plugin-transform-runtime"]
        })
        .bundle()
        .pipe(source('index.js')).pipe(gulp.dest('./dist'))
        // .pipe(babel({
        //     presets: ['@babel/env','@babel/preset-react'],
        //     plugins: ["@babel/plugin-transform-runtime"]
        //     // plugins: ["@babel/plugin-transform-react-jsx"]
        // })).pipe(gulp.dest('./dist'))
        gulp.src('./src/index.html').pipe(gulp.dest('./dist'))
        cb()
    })()

}

function devServer(cb){
    browserSync.init({
        server: {
            baseDir: './dist'
        }
    })
    gulp.watch("./src/**", gulp.series(lessChange,jsChange,htmlChange))
    cb()
}

function htmlChange(){
    return gulp.src('./src/index.html').pipe(gulp.dest('./dist')).pipe(reload({stream:true}))
}

function lessChange() {
    return gulp.src('./src/index.less').pipe(less({
        plugins: [autoprefix]
    })).pipe(gulp.dest('./dist')).pipe(reload({stream:true}))
}
function jsChange(cb){
    browserify({
        entries:['./src/index.js']
    })
    .transform(babelify,{
        presets: ['@babel/env','@babel/preset-react'],
        plugins: ["@babel/plugin-transform-runtime"]
    })
    .bundle()
    .pipe(source('index.js')).pipe(gulp.dest('./dist')).pipe(reload({stream:true}))
    cb()
}

gulp.task('default', gulp.series(main,devServer))
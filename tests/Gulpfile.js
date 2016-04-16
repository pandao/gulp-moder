/**
 * Gulp.js 构建文件
 * 
 * @author Pandao
 * @updateTime 2016-04-16
 */

var fs      = require("fs");
var gulp    = require('gulp');
var clean   = require('gulp-clean');
var notify  = require('gulp-notify');
var uglify  = require('gulp-uglify');
var rename  = require('gulp-rename');
var conact  = require('gulp-concat');
var replace = require('gulp-replace');
var header  = require('gulp-header');
var moder   = require('../index');

// 定义源文件目录
moder.srcPath = "./modules/";

// 定义目标输出目录
moder.destPath = "./output/";

/**
 * 打包一个包模块文件，即一个文件中有多个 define
 */ 

gulp.task('pkg', function() {
    return gulp.src(['modules/*.js'])
               .pipe(conact('pkg2.js'))
               .pipe(header("//@modulePackage pkgB\n")) // 在头部插入一个包名标签
               .pipe(gulp.dest("modules/pkg/"))
               .pipe(notify({ message: "pkg task completed!" }));
});

/**
 * 清空目标输出目录
 */ 

gulp.task('clean', function() {
    return gulp.src('./output/**/*.js')
               .pipe(clean())
               .pipe(notify({ message: "clean task completed!" }));
});

/**
 * 自动加模块名和生成模块 Map
 */ 

gulp.task("map", ["clean"], function() {
    return gulp.src("modules/**/*.js")
        .on('end', function() { 
            // 追加 Map
            /*moder.appendMap = {
                pkg : {
                    'pkgB' : {
                        deps : ['a', 'b', 'c', 'c/main'],
                        url  : 'pkg_d34rbfvh6645.js'
                    }
                }
            };*/

            // 替换模板页中的 Map 标签，并输出最终页面文件
            moder.replaceMap('./test.tpl.html', './test.html', /({{\$map}})/g, function(map) {
                //console.log('moder.replaceMap =>', JSON.stringify(map));
            });

            // 将模块 Map 输出为 json 文件，方便给 PHP include
            moder.writeMapToJSON('./map.json', function(map) {
                //console.log('moder.jsonMap =>', JSON.stringify(map));
            });
        })
        .pipe(moder.build())
        .pipe(uglify())
        .pipe(moder.rename())
        .pipe(gulp.dest(moder.destPath))
        .pipe(notify({ message: "Map task completed!" }));
});

gulp.task('watch', function() {
    gulp.watch('modules/**/*.js', ['map']);
    gulp.watch('test.tpl.html', ['map']);
});

gulp.task("default", ["pkg", "map"]);
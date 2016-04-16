# gulp-moder

Gulp plugin for [Moder.js](https://github.com/pandao/moder.js)

[Moder.js](https://github.com/pandao/moder.js) 构建工具，辅助自动生成模块 Map。

### 使用方法

`Gulpfile.js`：

```javascript
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
            moder.replaceMap('./index.tpl.html', './index.html', /({{\$map}})/g, function(map) {
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
    gulp.watch('index.tpl.html', ['map']);
});

gulp.task("default", ["pkg", "map"]);
```

模块文件自动生成标签：

1、单文件单个模块

```javascript
//@moduleName xxxx        // 模块名
//@moduleDeps xxx,xxx,... // 模块依赖

define(function(require, exports, module){
    // 禁止在 define 里 define
    module.exports = {
        foo : 'bar'
    };
});
```

2、包模块文件，即一个文件内有多个模块 define

```javascript
//@modulePackage xxxx     // 包名

//@moduleName xxxx        // 模块名
//@moduleDeps xxx,xxx,... // 模块依赖

define(function(require, exports, module){
    module.exports = {
        foo : 'bar'
    };
});

//@moduleName xxxx        // 模块名
//@moduleDeps xxx,xxx,... // 模块依赖

define(function(require, exports, module){
    module.exports = {
        foo : 'bar'
    };
});

//@moduleName xxxx        // 模块名
//@moduleDeps xxx,xxx,... // 模块依赖

define(function(require, exports, module){
    module.exports = {
        foo : 'bar'
    };
});
```

生成结果：

```
./output
    /pkg
        all_3aa20277.js
        pkg2_d3903ca2.js
    /c
        main_2f3dd68c.js
    /view
        info_fd175e15.js
        ...
    /component
        cart.list_707594a1.js
        ...
    ...
```

调用模块：

```javascript
require(['模块1', '模块2'], function(m1, m2) {
    console.log(m1, m2);
});
```

### License

The [MIT](https://github.com/pandao/gulp-moder/blob/master/LICENSE) license.

Copyright (c) 2016 Pandao
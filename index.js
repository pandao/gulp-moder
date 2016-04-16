/**
 * Gulp plugin for Moder.js
 * 
 * @version    v0.1.0
 * @author     Pandao <pandao@vip.qq.com>
 * @homePage   https://github.com/pandao/gulp-moder
 * @updateTime 2016-04-16
 * @license    MIT license (MIT)
 * @copyright  2016 Pandao
 */ 

var fs          = require('fs');
var md5         = require('md5');
var path        = require("path");
var gutil       = require('gulp-util');
var through     = require("through2");
var deepAssign  = require('deep-assign');
var _map        = [];
var PLUGIN_NAME = "[gulp-moder]";

function isUndefined(obj) {
    return (typeof obj === "undefined");
}

function pathFillEnd(_path) {
    return _path.replace(/\/$/, '') + '/';
}

module.exports = {
    debug         : false,
    suffixLenght  : 8,
    srcPath       : '.',
    destPath      : '.', 
    appendMap     : {},
    resMap        : function() {
        var _this  = this,
            remap  = false,
            resMap = {
                pkg : {},
                res : {}
            };

        _map.forEach(function(item, index){
            var url = pathFillEnd(_this.destPath) + item.file;

            if (item.pkg !== '') {
                var deps = {}, depsArr = [];
                
                item.names.forEach(function(name){
                    deps[name] = name;
                });
                
                item.deps.forEach(function(dep){
                    dep.forEach(function(d){
                        deps[d] = d;
                    });
                });
                
                for (var i in deps) {
                    depsArr.push(i);
                }
                
                resMap.pkg[item.pkg] = {
                    deps : depsArr,
                    url  : url
                }
                
                item.names.forEach(function(name, i){
                    resMap.res[name] = {
                        deps : item.deps[i] || [],
                        pkg  : item.pkg
                    }
                });
            } else {
                item.names.forEach(function(name, i){
                    resMap.res[name] = {
                        deps : item.deps[i] || [],
                        url  : url
                    }
                });
            }
        });
        
        return deepAssign(resMap, this.appendMap);
    },
    writeMapToJSON : function(file, callback) {
        callback = callback || function() {};
        
        var map = this.resMap();

        fs.writeFile(file, JSON.stringify(map), 'utf8', function (err) {
            if (err) {
                return console.log(PLUGIN_NAME + ' write json module map file failed =>', err);
            } else {
                console.log(PLUGIN_NAME + ' write json module map file success =>', file);
                callback(map);
            }
        });
    },
    replaceMap : function(file, outputFile, replaceTag, callback) {
        callback = callback || function() {};
        
        var map = this.resMap();

        fs.readFile(file, 'utf8', function (err, data) {
            if (err) {
                return console.log(PLUGIN_NAME + ' read file failed =>', err);
            }

            var replace = data.replace(replaceTag, JSON.stringify(map));

            fs.writeFile(outputFile, replace, 'utf8', function (err) {
                if (err) {
                    return console.log(PLUGIN_NAME + ' replace module map failed =>', err);
                } else {
                    console.log(PLUGIN_NAME + ' replace module map success =>', outputFile);
                    callback(map);
                }
            });
        });
    },
    rename : require('./lib/rename.js'),
    build  : function (onend) {
        var _this  = this,
            debug  = _this.debug;
        
        onend = onend || function() {};

        var regexs = {
            name   : /^\/\/\s*@moduleName\s*(.*)\s*$/g,
            deps   : /^\/\/\s*@moduleDeps\s*(.*)\s*$/g,
            pkg    : /^\/\/\s*@modulePackage\s*(.*)\s*$/g,
            define : /\s*define\s*\(([^,]*),?\s*function\(\s*/
        };

        return through.obj(function (file, encoding, callback) {
            
            if (file.isNull()) {
                return callback(null, file);
            }

            if (file.isStream()) {
                this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Cannot use streamed files'));
                return callback();
            }

            if (file.isBuffer()) {
                var matches,
                    contents = file.contents.toString(encoding),
                    lines    = contents.split(/\n/g);

                if (debug) {
                    console.log(PLUGIN_NAME + ": target =>", file.path);
                }
                
                var names = [], deps = [], pkg;

                lines.forEach(function(line, index) {
                    var ms, name;
                    
                    ms = regexs.pkg.exec(line);

                    if (ms) {
                        pkg = ms[1].trim();
                        //console.log(pkg);
                    }
                });

                lines.forEach(function(line, index) {
                    var ms, name;
                    
                    ms = regexs.name.exec(line);

                    if (ms) {
                        name = ms[1].trim();
                        names.push(name);
                        //console.log(name);
                    }
                });

                lines.forEach(function(line, index) {
                    var ms = regexs.deps.exec(line), dep;

                    if (ms) {
                        dep = ms[1].trim().split(/\s*,\s*/);
                        if (dep[0] === "") dep = [];
                        deps.push(dep || []);
                    }
                });

                var i = 0, newContent = [];

                lines.forEach(function(line, index) {
                    
                    var defineMatches = regexs.define.exec(line);
                    
                    if (defineMatches) {
                        var defineName = defineMatches[1];
                        
                        if (defineName === "") {
                            line = line.replace(/^\s*define\s*\(\s*/g, '\ndefine("' + names[i] + '", ');
                        }
                        
                        i++;
                    }
                    
                    newContent.push(line);
                });
                
                var newContent     = newContent.join("\n");
                var suffix         = '_' + md5(contents).substr(0, _this.suffixLenght);
                var fileName       = file.path.replace(file.base, '');
                var outputFileName = fileName.replace(/\.js$/, '') + suffix + ".js";

                var m = {
                    pkg    : pkg || '',
                    file   : outputFileName,
                    names  : names,
                    suffix : suffix,
                    deps   : (deps.length < 1) ? [] : deps
                };
                
                _map.push(m);
                
                onend(m);

                file.suffix   = suffix;
                file.contents = new Buffer(newContent);

                if (debug) {
                    console.log("\n");
                }
            }

            callback(null, file);
        });
    }
};

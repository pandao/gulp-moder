//@modulePackage pkgB
//@moduleName a
//@moduleDeps b,c
//@fdfd

///fadsfasdasf
define("a", function(require, exports, module){
    var b = require("b");
    var c = require("c");
    
    // 禁止在 define 内 define
    
    module.exports = {
        a : 2016,
        b : b.name,
        c : c
    }
});

// fdasfdasfasdf
//@moduleName b
//@moduleDeps c/main

//fdasfasdfasdf
define(function(require, exports, module){
    var c = require("c/main");
    
    module.exports = {
        name    : "Bower install",
        version : c.version
    }
});

// fadsfadsfasdf
//@moduleName c
//@moduleDeps
//@fdfd

///fadsfasdasf
define(function(require, exports, module){
    module.exports = {
        a : 1,
        b : 234
    }
});
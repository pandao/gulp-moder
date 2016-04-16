//@modulePackage pkgA

//@moduleName pkg1

//@moduleDeps

define("pkg1", function(require, exports, module){
    module.exports = {
        a : 1
    }
});

//@moduleName pkg2

//@moduleDeps pkg1,pkg3,a,view/info

define(function(require, exports, module){
    var a = require("pkg1");
    var b = require("pkg3");
    
    module.exports = {
        a : 2,
        b : a.a,
        c : b.a
    }
});
//angular

//@moduleName pkg3
//@moduleDeps
define(function(require, exports, module){
    module.exports = {
        a : 3
    }
});
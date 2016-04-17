//@moduleName a
//@moduleDeps b,c
//@fdfd

///fadsfasdasf
define("a", function(require, exports, module){
    var b = require("b");
    var c = require("c");
    
    // 禁止在 define 内 define
    
    module.exports = {
        a : 1,
        b : b.name,
        c : c
    }
});

// fdasfdasfasdf
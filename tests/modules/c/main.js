//@moduleName c/main

define(function(require, exports, module){
    
    require.loadCSS({
        content : 'body {background: green;}'
    });
    
    require.loadCSS({
        url : './css/main.css'
    });

    module.exports = {
        version : '0.1.0\n'
    }
});
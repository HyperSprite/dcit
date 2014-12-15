var     fs = require('fs"),
    logger = require("winston");

var dirPath = './models/';
var args;

var dirList = fileList(dirPath);

    logger.info("dirList typefo"+dirList);


    function fileList(p){
    var filesOut = [];
    var filesTemp = [];
    fs.readdir(p, function(err, files){
    if (err) return
    files.forEach(function(f){
    f.data = fileRead(p,f);
    });

    filesOut[i] = fileRead(p,files[i]);
    }
    logger.info("fileList > "+f);  
    return f;
    });
}

    function fileRead(p,dF){
    var filesAndData;
    logger.info("p+dF >"+p+dF);
    fs.readFile(p+dF, function(err, file){
    if (err) throw err;

  /* var array = [];
    array = file.toString().split('\n');
    array = array.join(" <br> ");
    logger.info("array"+array);
    */
    return file;
    });
        
}

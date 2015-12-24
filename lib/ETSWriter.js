var Q = require('q');
var fs = require('fs');

module.exports.write = function (data, fileName) {
    data = data.reduce(function (result, dataLine) {
        return result += ('\n' + dataLine);
    }, '');
    return Q.nfcall(fs.writeFile, fileName, data);
};

var Q = require('q');
var fs = require('fs');
var path = require('path');
var util = require('util');

var TICK_MARK = '✔';

module.exports.parse = function (source) {
    if (!source || typeof source !== "string" || source.length === 0) {
        throw new RangeError("'source' option must be defined and be non-empty strings");
    }

    var sourcePath = path.resolve(source);
    if (!fs.existsSync(sourcePath)) {
        throw new Error("Source file must exist");
    }

    return Q.nfcall(fs.readFile, sourcePath, 'utf8')
    .then(function (rawData) {
        return rawData.split('\n')
        .reduce(function (result, cleanLine, index) {
            cleanLine = cleanLine.trim();

            if (cleanLine.indexOf(TICK_MARK) === 0) {
                // This is a beginning of new item
                result.push(cleanLine.substring(1).trim());
                return result;
            }

            var l = result.length;
            if (l > 0) {
                result[l-1] += (' ' + cleanLine);
            } else {
                // Otherwise it is not a task and we don't have where
                // to append it, so just emit warning and omit it
                console.warn(util.format('Skipping line %d ("%s")',
                    index, cleanLine.substring(0, 10) + '...'));
            }

            return result;
        }, [])
        .map(function (rawLine) {
            var result = {};

            var propExtractor = /@(\w+)\s*(?:\((.*?)\))?/gm;
            result.line = rawLine.replace(propExtractor,
                function (match, name, value) {

                    if (name === 'done') {
                        var ymd = value
                            .split(' ')[0]
                            .split('-')
                            .map(function (str) {
                                return parseInt(str);
                            });

                        ymd[0] += 2000;
                        ymd[1] -= 1;

                        result[name] = new Date(ymd[0], ymd[1], ymd[2]);
                    } else if (name === 'project') {
                        result[name] = value.replace(/ \/ /g, '. ');
                    } else {
                        result[name] = value ? value.trim() : true;
                    }

                    // Return an empty string to remove property from raw line
                    return '';
            });

            return result;
        })
        .sort(function (a, b) {
            return (a.done < b.done) ? -1 :
                (a.done > b.done) ? 1 : 0;
        });
    });
};

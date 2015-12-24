var nopt = require('nopt');
var path = require('path');

module.exports.parse = function (argv, startIndex) {
    // Init/default parameters
    argv = argv || process.argv;
    if (typeof startIndex !== "number") {
        startIndex = 2;
    }

    var knownOpts = {
        since: Date,
        source: path,
        target: path,
        destination: path,
        verbose: Boolean
    };

    var shorthands = {
        v: "verbose",
        s: "source",
        src: "source",
        t: "target",
        d: "destination",
        dest: "destination"
    };

    var args = nopt(knownOpts, shorthands, argv, startIndex);

    return {
        // Process is default and the only one command yet
        command: args.argv.remain[0] || "parse",
        source: args.source || args.argv.remain[1],
        target: args.target || args.destination || args.argv.remain[2]
    };
};

module.exports.usage = "Usage:" +
    "\n\n\tetsi [[[parse] <source>] <destination>]";

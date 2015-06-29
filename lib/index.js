// --------------------
// middlestack module
// --------------------

// modules
var util = require('util'),
    co = require('co-bluebird'),
    isGeneratorFn = require('is-generator').fn,
    _ = require('lodash');

// exports
var middlestack = module.exports = function(obj, methodName, options, fn) {
    // conform arguments
    if (typeof methodName == 'function') {
        fn = methodName;
        methodName = undefined;
        options = undefined;
    } else if (typeof methodName == 'object') {
        fn = options;
        options = methodName;
        methodName = undefined;
    } else if (typeof options == 'function') {
        fn = options;
        options = undefined;
    }

    // conform options
    options = _.extend({
        // name: undefined
        lastArg: false
    }, options || {});

    // get method
    var method = (methodName ? obj[methodName] : obj);
    if (typeof method != 'function') throw new middlestack.Error('You can only middlestack a function');

    // if not already stackified, middlestack method
    if (!method.__middlestack) method = convertToStack(method, obj, methodName);

    // get function name
    if (options.name === undefined && fn.name) options.name = fn.name;

    // co-ify generators
    if (isGeneratorFn(fn)) fn = co.wrap(fn);

    // add fn to stack
    method.__middlestack.stack.push({fn: fn, name: options.name, lastArg: options.lastArg});

    return method;
};

function convertToStack(origMethod, obj, methodName) {
    // create stackified function
    var method = function() {
        var _this = this,
            stack = method.__middlestack.stack,
            i = 0;

        var next = function() {
            if (i == stack.length) return method.__middlestack.final.apply(_this, arguments);

            var item = stack[i];
            i++;

            var args = Array.prototype.slice.call(arguments);
            args[item.lastArg ? args.length : item.fn.length - 1] = next;

            return item.fn.apply(_this, args);
        };

        return next.apply(this, arguments);
    };

    method.__middlestack = {stack: [], final: origMethod};

    // write stackified method to obj
    if (methodName) obj[methodName] = method;

    // return stackified method
    return method;
}

middlestack.Error = function(message) {
    var tmp = Error.call(this, message);
	tmp.name = this.name = 'middlestackError';
    this.message = tmp.message;
    Error.captureStackTrace(this, this.constructor);
};
util.inherits(middlestack.Error, Error);

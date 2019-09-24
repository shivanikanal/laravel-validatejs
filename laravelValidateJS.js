(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([jQuery], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(jQuery);
    } else {
        root.laravelValidateJS = factory($);
    }
}(this, function ($) {

    var MIN_MAX_RULE_REGEX = /^(min|max):(\d+)$/;

    // if validate js is not loaded log a warning
    if(validate) {
        // js email regex for RFC 5322 Official Standard validation (which Laravel for default email validation) copied from http://emailregex.com/
        validate.validators.email.PATTERN = /\^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$]/;
    } else {
        console.warn('Requires ValidateJS to be loaded first. https://validatejs.org/');
    }

    var predefinedRules = {
        required : {
            // allowEmpty is set to false since laravel by default considers the fields as "empty" if it's null\empty string\empty array\empty countable object
            // https://laravel.com/docs/5.8/validation#rule-required
            presence : { allowEmpty: false }
        },
        email : {
            email: true
        }
    };

    // defines the logic used by laravel validator to compute length/size of a value 
    var getLength = function(value) { 
        if(typeof value == 'string') {
            return value;
        } else if(typeof value == 'number') {
            return parseInt(value, 10);
        } else if(value instanceof Array) {
            return value;
        } else if((value.name && typeof value.name == 'string') || value instanceof Blob) { // check if field is file or blob
            return value;
        }
        return 0;
    }

    var parseLaravelRule = function(laravelRule) {
        if(laravelRule) {
            if(predefinedRules[laravelRule]) {return predefinedRules[laravelRule]}
            else if(MIN_MAX_RULE_REGEX.test(laravelRule)) {
                return getLengthConstraint(laravelRule);
            }
        } 
        return null;
    }

    var getLengthConstraint = function(laravelRule) {
        var matches = MIN_MAX_RULE_REGEX.exec(laravelRule),
        constraint = matches[1],
        len = matches[2], value;
        if(constraint && len) {
            if(constraint == 'max') {
                return {
                    length: {
                        maximum: parseInt(len, 10),
                        // tokenizer: getLength
                    }
                };
            } else if (constraint == 'min') {
                return {
                    length: {
                        minimum: parseInt(len, 10),
                        // tokenizer: getLength
                    }
                };
            }
        }
        return null;
    }

    var laravelValidateJS = function(laravelRules) {
        var constraints = {};

        if(laravelRules && Object.keys(laravelRules).length > 0) {
            for(var rule in laravelRules) {
                if(Object.prototype.hasOwnProperty.call(laravelRules, rule)) {
                    constraints[rule] = {};
                    var rules = laravelRules[rule].split('|');
                    rules.forEach(function(item) {
                        // constraints[rule] = Object.assign(constraints[rule], parseLaravelRule(item));
                        constraints[rule] = $.extend(true, {}, constraints[rule], parseLaravelRule(item));
                    });
                }
            }
        }
        return constraints;
    };

    return laravelValidateJS;
}));
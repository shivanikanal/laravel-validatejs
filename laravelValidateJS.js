(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([jQuery], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(jQuery);
    } else {
        root.laravelValidateJS = factory($);
    }
}(this, function ($) {

    var COUNT_RULE_REGEX = /^(min|max|digits|size):(\d+)$/;
    var ACCEPTED_RULE_REGEX = /^\s?(1|'1'|true|'true'|yes|on)\s?$/;
    var BOOLEAN_RULE_REGEX = /^\s?(1|0|true|false|'1'|'0')\s?$/;
    var ALPHA_RULE_REGEX = /^[a-z]+$/;
    var ALPHA_NUM_RULE_REGEX = /^[a-z0-9]+$/;
    var ALPHA_DASH_RULE_REGEX = /^[a-z0-9-_]+$/;

    // if validate js is not loaded log a warning
    if(validate) {
        // js email regex for RFC 5322 Official Standard validation (which Laravel for default email validation) copied from http://emailregex.com/
        validate.validators.email.PATTERN = /\^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$]/;
    } else {
        console.warn('Requires ValidateJS to be loaded first. https://validatejs.org/');
    }

    /**
     * predefined set of contraints for laravel rules
     */
    var predefinedRules = {
        accepted: {
            format: {
                pattern: ACCEPTED_RULE_REGEX,
                flags: "i",
                message: "must be yes, on, 1, or true"
            }
        },
        alpha: {
            format: {
                pattern: ALPHA_RULE_REGEX,
                message: "must be entirely alphabetic characters"
            }
        },
        alpha_num: {
            format: {
                pattern: ALPHA_NUM_RULE_REGEX,
                message: "must contain only alpha-numeric characters"
            }
        },
        alpha_dash: {
            format: {
                pattern: ALPHA_DASH_RULE_REGEX,
                message: "must contain only alpha-numeric characters, dashes, and underscores"
            }
        },
        array : { type: "array" },
        boolean: {
            format: {
                pattern: BOOLEAN_RULE_REGEX,
                message: "must be true, false, 1, 0, '1', or '0'"
            }
        },
        email : { email: true },
        integer: { type: "integer" },
        numeric: { type: "number" },
        required : {
            // allowEmpty is set to false since laravel by default considers the fields as "empty" if it's null\empty string\empty array\empty countable object
            // https://laravel.com/docs/5.8/validation#rule-required
            presence : { allowEmpty: false }
        },
        string: { type: "string" }
    };

    /**
     * called for each rule, routes to parsing logic
     * @param {string} laravelRule single laravel rule
     */
    var parseLaravelRule = function(laravelRule) {
        if(laravelRule) {
            if(predefinedRules[laravelRule]) {
                return predefinedRules[laravelRule]
            } else if(COUNT_RULE_REGEX.test(laravelRule)) {
                return getLengthConstraint(laravelRule);
            }
        } 
        return null;
    }

    /**
     * takes laravel rules and input and spits out validatejs constraints
     * @param {*} laravelRules array of laravel rules
     */
    var laravelValidateJS = function(laravelRules) {
        var constraints = {};

        if(laravelRules && Object.keys(laravelRules).length > 0) {
            for(var rule in laravelRules) {
                if(Object.prototype.hasOwnProperty.call(laravelRules, rule)) {
                    constraints[rule] = {};
                    var rules = laravelRules[rule].split('|');
                    rules.forEach(function(item) {
                        constraints[rule] = $.extend(true, {}, constraints[rule], parseLaravelRule(item));
                    });
                }
            }
        }
        return constraints;
    };

    /**
     * this handles all laravel rules validating the length/size of input
     * @param {string} laravelRule a single laravel rule
     */
    var getLengthConstraint = function(laravelRule) {
        var matches = COUNT_RULE_REGEX.exec(laravelRule),
        constraint = matches[1],
        len = matches[2];
        if(constraint && len) {
            switch(constraint) {
                case 'max': 
                    return {
                        length: {
                            maximum: parseInt(len, 10),
                            tokenizer: getLength
                        }
                    };
                    break;
                case 'min': 
                    return {
                        length: {
                            minimum: parseInt(len, 10),
                            tokenizer: getLength
                        }
                    };
                    break;
                case 'digits':
                    return {
                        type: "number",
                        length: {
                            is: parseInt(len, 10),
                            tokenizer: function(val) { return JSON.stringify(val); }
                        }
                    };
                    break;
                case 'size':
                    return {
                        length: {
                            is: parseInt(len, 10),
                            tokenizer: getLength
                        }
                    };
                break;
            }
        }
        return null;
    }

    /**
     * defines the logic used by laravel validator to compute length/size of a value
     * @param {*} value any input value
     */
    var getLength = function(value) { 
        if(typeof value === 'string') {
            return value;
        } else if(typeof value === 'number') {
            var obj = new Object();
            obj.length = parseInt(value, 10);
            return obj;
        } else if(value instanceof Array) {
            return value;
        } else if((value.name && typeof value.name === 'string') || value instanceof Blob) { // check if field is file or blob
            var obj = new Object();
            obj.length = value.size;
            return obj;
        }
        return 0;
    }

    return laravelValidateJS;
}));
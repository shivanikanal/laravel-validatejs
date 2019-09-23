(function (root, factory) {
    if (typeof define === "function" && define.amd) {
        define([], factory);
    } else if (typeof exports === "object") {
        module.exports = factory();
    } else {
        root.laravelValidateJS = factory();
    }
}(this, function () {

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

    var parseLaravelRule = function(laravelRule) {
        if(laravelRule) {
            if(predefinedRules[laravelRule]) return predefinedRules[laravelRule];
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
                        constraints[rule] = Object.assign(constraints[rule], parseLaravelRule(item));
                    });
                }
            }
        }
        return constraints;
    };

    // defines the logic used by laravel validator to compute length/size of a field 
    var getLength = function(field) { 
        if(typeof field == 'string') {
            return field.length;
        } else if(typeof field == 'number') {
            return parseInt(field, 10);
        } else if(field instanceof Array) {
            return field.length;
        }
    }

    return laravelValidateJS;
}));
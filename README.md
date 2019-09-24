# laravel-validatejs

Lets you reuse your Laravel Validation Rules for validating your data on front-end using ValidateJS.

This is a simple function which takes laravel rules as input and spits out constraints which can be used to validate data on frontend using [ValidateJS](https://github.com/ansman/validate.js)

Requirements:
Laravel 5.7,
ValidateJS,
jQuery

Support: Does not provide support for all laravel validation rules yet

Basic Usage:
```
  <script src="//cdnjs.cloudflare.com/ajax/libs/validate.js/0.13.1/validate.min.js"></script>
  <script src="//cdn.jsdelivr.net/npm/laravel-validatejs@1.0.0/laravelValidateJS.min.js"></script>
  
  var laravelRules = {!! json_encode($validationRules) !!},
  constraints = laravelValidateJS(laravelRules),
  data = {},
  errors = validate(data, constraints);
  
```

The constraints can be used to validate data in object format or an html form as mentioned here - https://validatejs.org/

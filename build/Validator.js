"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Validator;
(function (Validator) {
    function validate(o, properties) {
        if (!o) {
            return false;
        }
        for (let p in properties) {
            if (!(p in o)) {
                return false;
            }
            let expectedType = properties[p].toLowerCase();
            let actualType = (typeof o[p]).toLowerCase();
            if (expectedType !== actualType) {
                return false;
            }
        }
        return true;
    }
    Validator.validate = validate;
    function isString(v) {
        return typeof v === "string";
    }
    Validator.isString = isString;
    function isNumber(v) {
        return typeof v === "number";
    }
    Validator.isNumber = isNumber;
})(Validator = exports.Validator || (exports.Validator = {}));

//# sourceMappingURL=../maps/Validator.js.map

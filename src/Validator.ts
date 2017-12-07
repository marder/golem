export namespace Validator {

	export function validate(o: any, properties: object ) {

		if (!o) {
			return false;
		}

		for (let p in properties) {

			if (!(p in o)) {
				return false;
			}

			let expectedType = properties[p].toLowerCase()
			let actualType = (typeof o[p]).toLowerCase()

			if (expectedType !== actualType) {
				return false;
			}

		}

		return true;

	}

	export function isString(v: any) {
		return typeof v === "string";
	}
	export function isNumber(v: any) {
		return typeof v === "number";
	}

}
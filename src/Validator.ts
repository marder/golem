export namespace Validator {

	export function validate(o: any, properties: object ) {

		if (!o) {
			return false;
		}

		for (let p in properties) {

			if (!(p in o)) {
				return false;
			}

			if (typeof o[p] !== properties[p]) {
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
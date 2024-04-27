export default class {
	//--- Properties --------------------------------------------------------------------------------------------------
	/**
	 * The dictionary can be an object or a function that returns an object.
	 */
	dictionary = {};
	
	//--- Constructor -------------------------------------------------------------------------------------------------
	
	constructor(dictionary = null) {
		if (dictionary)
			this.setDictionary(dictionary);
	}
	
	//--- Public API --------------------------------------------------------------------------------------------------
	
	setDictionary(dictionary) {
		this.dictionary = dictionary;
	}
	
	getDictionary() {
		return typeof this.dictionary === 'function' ? this.dictionary() : this.dictionary;
	}
	
	//--- Translation methods ------------------------------------------------------------------------------------------
	
	translate(key, replace) {
		let translation = this.#getTranslationFromDictionary(key, this.getDictionary());
		if (!translation)
			return key;
		
		return this.#replacePlaceholders(translation, this.#normalizeReplaceObject(replace));
	}
	
	translatePlural(key, count, replace) {
		let translation = this.#getTranslationFromDictionary(key, this.getDictionary());
		if (!translation)
			return key;
		
		translation = this.#pickPluralForm(count, translation.split('|'));
		if (!translation)
			return key;
		
		let replaceObject = this.#normalizeReplaceObject(replace);
		let defaultReplaceObject = { count: count, value: count, n: count };
		
		return this.#replacePlaceholders(translation, {...defaultReplaceObject, ...replaceObject});
	}
	
	//--- Private helpers ---------------------------------------------------------------------------------------------
	
	/**
	 * Pick the correct plural form for a given count. The forms are given as an array of strings (exploded by |).
	 * The count is used to find the right plural form. Following options are supported:
	 *  - {0} zero|{1} one|[2-10] few|[11-99] many|[100-*] other
	 *  - one|zero or many
	 */
	#pickPluralForm(count, forms) {
		if (!Array.isArray(forms) || forms.length === 0)
			return null;
		
		if (forms.length === 1)
			return forms[0];
		
		//use the default plural forms, equivalent to ({1} one|[0, 2-*] zero or many)
		let translated = count === 1 ? forms[0] : forms[1];
		
		for(let i = 0; i < forms.length; i++) {
			//check for a specific plural form: {count} form
			let exactNumber = forms[i].match(/\{(\d+)\}\s?(.*)/);    //match {n} and the rest of the string
			if (exactNumber !== null && count === parseInt(exactNumber[1])) {
				return exactNumber[2];
			}
			
			//check for a plural range in any of the forms: [n - m] / [n - *] / [n, m] / [n, *]
			let range = forms[i].match(/\s*\[\s*(\d+)\s*(?:-|,)\s*(\d*\*?)\s*\]\s*(.*)/);
			if (range !== null) {
				range[1] = parseInt(range[1]);
				range[2] = range[2] === '*' ? Infinity : parseInt(range[2]);
			}
			
			if (range !== null && count >= range[1] && count <= range[2]) {
				return range[3];
			}
		}
		
		return translated;
	}
	
	#getTranslationFromDictionary(key, dictionary) {
		return key.split('.').reduce((t, i) => t ? t[i] || null : null, dictionary);
	}
	
	#replacePlaceholders(translation, replace) {
		if (!replace)
			return translation;
		
		Object.keys(replace).forEach((key) => {
			translation = translation.replaceAll(`:${key}`, replace[key]);
		});
		
		return translation;
	}

	//normalize the replace object to a key-value object
	#normalizeReplaceObject(replace) {
		if (!replace)
			return null;
		
		let replaceObject = replace;
		
		// if replace is a number, we assume it's: count, value, n
		if (typeof replaceObject === 'number')
			replaceObject = { count: replace, value: replace, n: replace };
		
		// if replace is a string, we assume it's: value, name
		if (typeof replaceObject === 'string')
			replaceObject = { value: replace, name: replace };
		
		return typeof replaceObject === 'object' ? replaceObject : null;
	}
}
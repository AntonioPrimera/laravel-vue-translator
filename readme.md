# Laravel Vue3 Translator

The `laravel-vue-translator` package was primarily built, to be paired with the`antonioprimera/laravel-js-localization`
package, to provide a seamless localization experience for Laravel Vue3 apps.

The Laravel package provides the necessary backend functionality to generate and expose the Laravel localization files
to the frontend and this package provides the necessary frontend functionality to access the localized strings in
the Vue3 components.

While the two packages were built to work together, this package can be easily used as a stand-alone package
if you can provide it with a dictionary of translations.

## Installation

You can install the package via npm:

```bash
npm install laravel-vue-translator
```

If you are using the `antonioprimera/laravel-js-localization` package, this step is included in the
`php artisan js-localization:install` command, so you don't need to install it manually.

## Usage

### Setting up the vue plugin

When creating your Vue3 app, you should import the plugin directly from the package and use it in your app:

```js
import { createApp } from 'vue'
import {translatorPlugin} from 'laravel-vue-translator'

// Get the dictionary of translations as a JS object (see also the section about lazy loading dictionaries)
const dictionary = {
    en: {
		greetings: {
			welcome: 'Hello :name! Welcome to our application!',
        },
        apples: '{0} :name has no apples|{1} :name has one apple|[2,10] :name has :count apples|[11,*] :name has too many apples!',
    },
    de: {
        greetings: {
            welcome: 'Hallo :name! Willkommen in unserer Anwendung!',
        },
        apples: '{0} :name hat keine Äpfel|{1} :name hat einen Apfel|[2,10] :name hat :count Äpfel|[11,*] :name hat zu viele Äpfel!',
    }
}

// Add the plugin to your Vue3 app
return createApp({ render: () => h(App, props) })
    //add the plugin to your Vue3 app
    .use(translatorPlugin, {dictionary})
    .mount('#app')
```

### Using the `txt` and `txts` helper functions

In order to use `txt` and `txts` helper functions in your Vue3 script sections, you can easily inject them into your
components, by using the `useTranslator` function, which basically injects the functions into your component's context.

```vue
//in any of your Vue3 components
<script setup>
    import {useTranslator} from "laravel-vue-translator";
    const {txt, txts} = useTranslator();

    //now you can use the txt and txts functions in your component
    const greeting = txt('greetings.welcome', {name: 'John'});
    const apples = txts('apples', 5, {name: 'John'});
</script>
```

### Using a lazy loaded dictionary

You can provide the dictionary also as a function, which returns the dictionary object. If you are fetching the
translations from an API, or if the dictionary is not available at the time of the plugin registration, you can
provide a function, which returns the dictionary. This function will be called lazily, when the translations are needed.

```js
import { createApp } from 'vue'
import {translatorPlugin} from 'laravel-vue-translator'

//fetch the translations from an API
const dictionary = async () => {
    const response = await fetch('/api/translations');
    return await response.json();
}

// Add the plugin to your Vue3 app
return createApp({ render: () => h(App, props) })
    //add the plugin to your Vue3 app
    .use(translatorPlugin, {dictionary})
    .mount('#app')
```

You can get creative with the way you provide the translations, as long as the dictionary can be resolved to an object
with the translations.

## Related packages

- [Composer Package: antonioprimera/laravel-js-localization](https://packagist.org/packages/antonioprimera/laravel-js-localization)
- [NPM Package: laravel-inertia-vue-translator](https://www.npmjs.com/package/laravel-inertia-vue-translator)
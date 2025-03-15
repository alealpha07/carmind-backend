# Internationalization (i18n)

Translations in the application are managed using the `i18n` library. This documentation provides guidance on how to add new translations for existing locales and how to introduce new locales.

---

## Adding Translations for Existing Locales

To add new translations for existing locales, follow these steps:

1. Navigate to the `./src/locales/` directory.
2. Open the locale file you want to update (e.g., `en.json` for English).
3. Add the new key-value pair to the JSON object. For example:
   ```json
   {
     "existingKey": "Existing Translation",
     "newKey": "New Translation"
   }
   ```
4. Ensure the **same key** is added to all locale files to maintain consistency across languages.

---

## Adding New Locales

To add a new locale to the application, follow these steps:

1. **Create a New Locale File**:
   - Navigate to the `./src/locales/` directory.
   - Create a new JSON file with the name corresponding to the locale code (e.g., `fr.json` for French, `es.json` for Spanish).

2. **Populate the Locale File**:
   - Copy the contents of the `en.json` file (or any existing locale file) into the new file.
   - Translate all the values in the JSON object to the new language. For example:
     ```json
     {
       "welcome": "Bienvenue",
       "goodbye": "Au revoir"
     }
     ```
   - **Note**: If a translation is missing for a specific key, the application will fall back to the default locale (`en`).

---

## Default Locale

The default locale for the application is **English (`en`)**. If a translation key is missing in a specific locale, the application will automatically use the corresponding value from the default locale.

---

## Example Directory Structure

The `./src/locales/` directory should look like this:

```
locales/
├── en.json
├── it.json
├── fr.json
└── es.json
```

---

## Fallback Behavior

- If a translation key is missing in a specific locale, the application will fall back to the default locale (`en`).
- Ensure all keys are present in all locale files to avoid fallback behavior unless intended.

---

[Go back to README.md](./README.md)
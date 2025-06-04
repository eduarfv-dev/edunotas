module.exports = {
  root: true, // Importante: Esto evita que ESLint busque configuraciones en carpetas superiores.
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended", // Configuración recomendada básica de ESLint
    // Si quieres usar la guía de estilo de Google y la tienes en tu package.json de functions:
    // "google",
  ],
  parserOptions: {
    ecmaVersion: 2020, // O la versión de ECMAScript que estés usando (e.g., 2018, 2022)
  },
  rules: {
    "quotes": ["error", "double", {"allowTemplateLiterals": true}],
    // Puedes añadir o modificar reglas según tus preferencias.
    // Por ejemplo, si no quieres la regla de JSDoc que a veces añade Firebase:
    "require-jsdoc": "off",
    "camelcase": "off", // Si usas nombres de variables que no son camelCase y ESLint se queja
    "no-restricted-globals": ["error", "name", "length"], // Ejemplo de otra regla
    "prefer-arrow-callback": "error", // Ejemplo de otra regla
  },
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
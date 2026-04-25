// set-env.js
const { writeFileSync } = require('fs');
const { resolve } = require('path');
require('dotenv').config(); // Carga variables desde .env

// Ruta del archivo de entorno de Angular
const targetPath = resolve(__dirname, './src/environments/environment.ts');

// Construir contenido del archivo
const envConfigFile = `export const environment = {
  production: ${process.env.NODE_ENV === 'production'},
  apiUrl: '${process.env.API_URL}',
  appVersion: '${process.env.APP_VERSION}'
};
`;

try {
    writeFileSync(targetPath, envConfigFile);
    console.log(`Archivo environment.ts generado con variables de entorno`);
} catch (err) {
    console.error(' Error al generar environment.ts', err);
    process.exit(1);
}

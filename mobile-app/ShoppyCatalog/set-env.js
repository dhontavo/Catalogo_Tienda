// set-env.js
const { writeFileSync } = require('fs');
const { resolve } = require('path');
require('dotenv').config(); // Carga variables desde .env

// Rutas de los archivos de entorno de Angular
const targetPaths = [
    resolve(__dirname, './src/environments/environment.ts'),
    resolve(__dirname, './src/environments/environment.prod.ts')
];

// Construir contenido del archivo
const envConfigFile = (isProd) => `export const environment = {
  production: ${isProd},
  apiUrl: '${process.env.API_URL}',
  appVersion: '${process.env.APP_VERSION}'
};
`;

try {
    targetPaths.forEach(targetPath => {
        const isProd = targetPath.includes('prod');
        writeFileSync(targetPath, envConfigFile(isProd));
        console.log(`Archivo ${targetPath.split(/[\\/]/).pop()} generado con variables de entorno`);
    });
} catch (err) {
    console.error(' Error al generar los archivos de entorno', err);
    process.exit(1);
}

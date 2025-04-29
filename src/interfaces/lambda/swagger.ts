// src/interfaces/lambda/swagger.ts
import { readFileSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';  // Para convertir YAML a JSON

interface ErrorWithMessage {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    return new Error(String(maybeError));
  }
}

export const handler = async () => {
  try {
    // Leer el archivo YAML
    const yamlPath = join(process.cwd(), process.env.DOCS_PATH || 'docs/openapi.yaml');
    const swaggerDocYaml = readFileSync(yamlPath, 'utf8');

    // Convertir YAML a JSON
    const swaggerDoc = yaml.load(swaggerDocYaml); // Convertir YAML a JSON

    // Generar HTML de Swagger UI
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Medical Appointment API</title>
      <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui.css">
    </head>
    <body>
      <div id="swagger-ui"></div>
      <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-bundle.js"></script>
      <script src="https://unpkg.com/swagger-ui-dist@4.5.0/swagger-ui-standalone-preset.js"></script> <!-- Script necesario para SwaggerUIStandalonePreset -->
      <script>
        const spec = ${JSON.stringify(swaggerDoc)};
        SwaggerUIBundle({
          spec: spec,
          dom_id: '#swagger-ui',
          presets: [
            SwaggerUIBundle.presets.apis,
            SwaggerUIStandalonePreset // Ahora SwaggerUIStandalonePreset está correctamente cargado
          ],
          layout: "StandaloneLayout"
        });
      </script>
    </body>
    </html>
    `;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: html
    };
  } catch (error: unknown) {
    const errorWithMessage = toErrorWithMessage(error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error loading Swagger UI',
        error: errorWithMessage.message
      })
    };
  }
};

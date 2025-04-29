prueba_rimac_2025/
├── generate-tree.js                # Script para generar estructura de carpetas
├── openapi.yaml                    # Documentación OpenAPI/Swagger
├── package-lock.json               # Lockfile de dependencias
├── package.json                    # Configuración de proyecto y dependencias
├── README.md                       # Documentación principal
├── serverless.yml                  # Configuración de infraestructura AWS
├── src/
│   ├── core/
│   │   ├── domain/
│   │   │   ├── appointment.ts      # Entidad principal de cita médica
│   │   ├── ports/                  # Interfaces/contratos
│   │   │   ├── appointment-repository.ts  # Puerto para repositorios
│   │   │   ├── confirmation-sender.ts     # Puerto para envío de confirmaciones
│   │   │   ├── event-publisher.ts         # Puerto para publicación de eventos
│   │   ├── use-cases/              # Lógica de negocio
│   │   │   ├── base-appointment-processor.ts  # Clase base Strategy
│   │   │   ├── cl-appointment-processor.ts    # Procesador para Chile
│   │   │   ├── create-appointment.ts          # Caso de uso creación
│   │   │   ├── get-appointments.ts            # Caso de uso consulta
│   │   │   ├── pe-appointment-processor.ts    # Procesador para Perú
│   ├── infrastructure/             # Implementaciones concretas
│   │   ├── aws/
│   │   │   ├── event-bridge.ts     # Config EventBridge
│   │   │   ├── sns.ts              # Config SNS
│   │   ├── database/
│   │   │   ├── dynamodb.ts         # Repositorio DynamoDB
│   │   │   ├── rds.ts              # Repositorio MySQL
│   │   ├── event-bus/
│   │   │   ├── confirmation.ts     # Implementación de envío de confirmaciones
│   ├── interfaces/                 # Puntos de entrada
│   │   ├── http/
│   │   │   ├── controllers.ts      # Controladores API HTTP
│   │   ├── lambda/                 # Handlers Lambda
│   │   │   ├── appointment-cl.ts   # Lambda procesador Chile
│   │   │   ├── appointment-pe.ts   # Lambda procesador Perú
│   │   │   ├── appointment.ts      # Lambda principal API
│   │   │   ├── confirmation.ts     # Lambda confirmaciones
│   ├── shared/
│   │   ├── logger.ts               # Utilidad de logging centralizado
├── tests/                          # Pruebas unitarias
│   ├── appointment.test.ts         # Pruebas entidad Appointment
│   ├── use-cases/
│   │   ├── create-appointment.test.ts  # Pruebas caso de uso creación
├── tsconfig.json                   # Configuración TypeScript
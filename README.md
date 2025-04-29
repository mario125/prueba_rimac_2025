# **prueba_rimac_2025 - Medical Appointment API**

## **Descripción del Proyecto**

**prueba_rimac_2025** es un proyecto de agendamiento de citas médicas diseñado para trabajar con **Serverless Framework** en **AWS Lambda**. La API permite gestionar citas médicas en dos países, **Perú** y **Chile**, utilizando varios servicios de AWS como **API Gateway**, **SNS**, **SQS**, **EventBridge**, **DynamoDB** y **RDS**. El propósito de este proyecto es demostrar cómo integrar estos servicios en un sistema de microservicios altamente escalable, sin servidores.

### **Arquitectura del Sistema**

El sistema está basado en una **arquitectura serverless**, lo que significa que no se necesitan servidores dedicados para ejecutar las funciones. Las funciones se ejecutan a través de **AWS Lambda**, y las interacciones entre ellas se gestionan mediante **API Gateway**, **SNS** para notificaciones, **SQS** para colas de procesamiento, **DynamoDB** para almacenamiento, y **RDS** para datos estructurados.

#### **Servicios de AWS Utilizados:**
1. **AWS Lambda**: Funciones que ejecutan la lógica de negocio y procesan solicitudes.
2. **API Gateway (HTTP v2)**: Expone las rutas y las APIs de manera RESTful.
3. **SNS (Simple Notification Service)**: Servicio de mensajería para enviar notificaciones.
4. **SQS (Simple Queue Service)**: Utilizado para manejar las colas de mensajes (para Perú y Chile).
5. **DynamoDB**: Base de datos NoSQL para el almacenamiento de citas médicas.
6. **RDS (MySQL)**: Base de datos relacional utilizada para gestión de datos adicionales.
7. **EventBridge**: Para manejar eventos entre servicios y realizar integraciones.

### **Estructura del Proyecto**

```
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
```

---

## **Instalación y Configuración**

### **Requisitos previos**
- **Node.js**: Debes tener **Node.js** versión 18 o superior instalado.
- **Serverless Framework**: Instalar el Serverless Framework de manera global:
  ```bash
  npm install -g serverless
  ```

### **Pasos para ejecutar localmente**:
1. **Clonar el repositorio**:
   ```bash
   git clone <url-del-repositorio>
   cd prueba_rimac_2025
   ```

2. **Instalar las dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar el proyecto de manera local**:
   Puedes ejecutar el proyecto localmente usando el plugin **`serverless-offline`**, que simula los servicios de AWS en tu máquina.
   ```bash
   npm run offline
   ```

4. **Acceder a la API localmente**:
   Una vez que el servidor esté en ejecución, puedes acceder a la API localmente en:
   ```
   http://localhost:3000/dev/api-docs
   ```

### **Desplegar a AWS (Producción)**:
1. **Configurar las credenciales de AWS**: Para desplegar en AWS, primero asegúrate de tener configuradas las credenciales de AWS. Si aún no lo has hecho, usa:
   ```bash
   aws configure
   ```

2. **Desplegar el proyecto a AWS**:
   Puedes desplegar el proyecto a la nube de AWS usando el siguiente comando:
   ```bash
   npm run deploy
   ```

3. **Acceder a la API en Producción**:
   Una vez que el despliegue sea exitoso, accederás a la API en el endpoint proporcionado por **API Gateway**. Este endpoint tendrá una forma similar a:
   ```
   https://<api-id>.execute-api.us-east-1.amazonaws.com/dev/api-docs
   ```

---

## **Lógica de las APIs**

### **1. API para Crear Citas Médicas (`POST /appointments`)**
Este endpoint permite crear una nueva cita médica. El cuerpo de la solicitud debe ser un JSON con los siguientes parámetros:
- **appointmentId**: ID único de la cita.
- **insuredId**: ID del asegurado (5 dígitos).
- **scheduleId**: ID del horario disponible.
- **countryISO**: País del asegurado (PE o CL).
- **status**: Estado de la cita ("pending" o "completed").
- **createdAt**: Fecha de creación de la cita.
- **updatedAt**: Fecha de última actualización de la cita.

**Respuesta esperada (código 202)**:
```json
{
  "message": "Appointment scheduling in process",
  "appointmentId": "appt-vbobp755dx"
}
```

### **2. API para Obtener Citas Médicas por `insuredId` (`GET /appointments/{insuredId}`)**
Este endpoint permite obtener todas las citas asociadas a un asegurado específico. El parámetro `insuredId` es parte de la ruta.

**Respuesta esperada (código 200)**:
```json
[
  {
    "appointmentId": "appt-pk4jwp48cb",
    "insuredId": "12346",
    "scheduleId": 1,
    "countryISO": "PE",
    "status": "completed",
    "createdAt": "2025-04-28T01:32:57.644Z",
    "updatedAt": "2025-04-28T01:32:57.784Z"
  },
  {
    "appointmentId": "appt-all93vmr6x",
    "insuredId": "12346",
    "scheduleId": 1,
    "countryISO": "PE",
    "status": "completed",
    "createdAt": "2025-04-28T01:25:23.285Z",
    "updatedAt": "2025-04-28T01:25:24.150Z"
  }
]
```

---

## **Tecnologías utilizadas**
- **AWS Lambda**: Funciones sin servidor para ejecutar la lógica de negocio.
- **AWS API Gateway**: Para exponer las rutas y manejar las solicitudes HTTP.
- **AWS SNS/SQS**: Para manejar la mensajería y las colas de tareas.
- **AWS DynamoDB**: Base de datos NoSQL para almacenar las citas médicas.
- **AWS RDS**: Base de datos relacional utilizada para gestión de datos adicionales.
- **Serverless Framework**: Para automatizar el despliegue y la infraestructura.
- **TypeScript**: Para una programación más robusta y escalable.

---

## **Autor**
**Desarrollado por**: [Tu Nombre]  
**Fecha**: Mayo 2025

---

Este **README.md** proporciona todos los detalles necesarios para desplegar y ejecutar el proyecto tanto en local como en producción, explicando la arquitectura, las APIs disponibles y cómo interactuar con ellas. Si tienes alguna otra pregunta o necesitas más detalles, ¡no dudes en contactarme!

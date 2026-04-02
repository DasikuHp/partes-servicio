<div align="center">
  <h1>🛠️ API REST Gestión de Partes de Servicio</h1>
  <p><em>Plataforma web completa (Frontend + Backend) para creación, firma digital y envío de albaranes técnicos.</em></p>

  <!-- Badges -->
  <img src="https://img.shields.io/badge/Node.js-18.x-43853D?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
</div>

<hr />

> [!NOTE]
> Permite a los técnicos de campo registrar horas, desplazamientos, materiales, adjuntar fotografías, recoger firmas *in-situ* e incluso enviar por correo electrónico el parte generado automáticamente en formato PDF.

## 🚀 Tech Stack

### ⚙️ Backend
| Tecnología | Versión | Rol |
| :--- | :--- | :--- |
| **Node.js** | `>=18` | Entorno de ejecución |
| **Express** | `^4.21.2` | Framework, enrutamiento y middleware |
| **SQLite** | `Built-in` | Base de datos usando el driver nativo `node:sqlite` |
| **express-session**| `^1.19.0` | Gestión de estado y sesiones |
| **bcryptjs** | `^3.0.3` | Encriptación de contraseñas |
| **multer** | `^2.1.1` | Motor de subida de imágenes/fotografías |
| **nodemailer** | `^8.0.4` | Despliegue de correos vía SMTP |

### 🎨 Frontend
| Tecnología | Rol |
| :--- | :--- |
| **HTML5 / CSS / Vanilla JS** | SPA Responsive Mobile-First |
| **jsPDF** *v2.5.1* | Generación de documentos PDF en el navegador |
| **html2canvas** *v1.4.1* | Renderizado del DOM a imágenes (capturas in-browser) |
| **Signature Pad** *v4.1.7*| Captura de firmas manuscritas con `<canvas>` |

---

## ✨ Key Features

- 🔒 **Login por Sesiones:** Acceso protegido en memoria/cookie y validación con *Hashes BCrypt* en `.env` para técnicos designados ('ruben', 'tono').
- 📝 **Gestión de Albaranes:** Control minucioso de empresa, horas laborables, descripción del trabajo y materiales utilizados en tablas dinámicas.
- 📸 **Evidencia Fotográfica:** Integración con `multer` para subida de fotos del trabajo asociadas al registro localmente.
- 🖋️ **Firma Digital In Situ:** Registro en la pantalla del dispositivo tanto del cliente como del técnico con vista previa en vivo.
- 📄 **Generación Offline-First de PDFs:** Descarga la carga del servidor convirtiendo los HTML en PDFs localmente usando `jsPDF` y `html2canvas` del lado cliente.
- 📧 **Envío Automatizado:** Sistema de mailing por CC con el PDF finalizado usando `nodemailer` y un servidor SMTP a elección.

---

## 🗂️ Folder Structure

```text
/
├── .env.example          # 📄 Plantilla de variables obligatorias
├── package.json          # 📦 Metadatos y dependencias
├── public/               # 🌐 Frontend y Assets
│   └── partes.html       # 📱 SPA principal (interfaz móvil)
├── src/                  # 💻 Core del Backend
│   ├── index.js          # ▶️ Entry point (Express server)
│   ├── db/               # 🗃️ Capa de Base de Datos
│   │   ├── index.js      # ⚙️ Driver SQLite (Modo WAL)
│   │   └── schema.sql    # 📜 DDL: Creación de tabla 'partes'
│   ├── middleware/       
│   │   └── auth.js       # 🛡️ Protección de rutas
│   ├── routes/           # 🛤️ Endpoints API
│   │   ├── auth.js       # 🔑 Login / Logout / Me
│   │   └── partes.js     # ⚙️ Gestión CRUD / SMTP / Uploads
│   └── scripts/
│       └── genHashes.js  # 🔐 Utilidad CLI para generar hashes
├── data/                 # 💾 [Auto] Contiene SQLite 'partes.db'
└── uploads/              # 🖼️ [Auto] Almacena las fotos subidas
```

---

## 🛠️ Installation

**1. Clonar el repositorio y descargar dependencias:**
```bash
git clone <tu-repositorio>
cd <nombre-repo>
npm install
```

**2. Preparar el Entorno:**
```bash
cp .env.example .env
```

**3. Generar contraseñas seguras:**
> [!IMPORTANT]
> El sistema requiere Hashes para el login. Usa la herramienta del backend para encriptar las contraseñas reales de los operarios.
```bash
node src/scripts/genHashes.js mI_PaSsWord RubeNPass
```
*Copia el resultado de la consola a tus variables de entorno `HASH_RUBEN` y `HASH_TONO` en el archivo `.env`.*

**4. Levantar servidor:**
```bash
# Modo de producción
npm start 

# Modo dev (watch)
npm run dev
```

> [!TIP]
> **No necesitas poblar la Base de Datos**. Al primer arranque, el motor de SQLite se encargará de ejecutar automáticamente el script `schema.sql` para crear e inicializar la base de datos `partes.db` dentro del directorio `data/`.

---

## ⚙️ Configuration / Environment Variables

<details>
<summary><strong>Ver Variables en <code>.env</code></strong> <i>(Click para expandir)</i></summary>
<br>

| Variable | Descripción |
| :--- | :--- |
| `PORT=3000` | Puerto designado al servidor web (API Express). |
| `SESSION_SECRET` | Cadena firme y secreta para protección de cookie HTTP. |
| `HASH_RUBEN` | String Hash (BCrypt) para validación de login del técnico 1. |
| `HASH_TONO` | String Hash (BCrypt) para validación de login del técnico 2. |
| `SMTP_HOST` | Host para correos (Ej: `smtp.office365.com`, `smtp.gmail.com`). |
| `SMTP_PORT` | `587` (TLS) ó `465` (SSL). |
| `SMTP_SECURE` | `true` ó `false` dependiendo del host saliente. |
| `SMTP_USER` | Email autenticado. |
| `SMTP_PASS` | Contraseña nativa o AppPassword del correo emisor. |
| `SMTP_FROM` | Alias Remitente (Ej: `Empresa Service <soporte@domain.com>`) |

</details>

---

## 📡 API Endpoints

<details>
<summary><strong>🔑 Autenticación (<code>/api/auth</code>)</strong></summary>
<br>

*   `POST` `/api/auth/login` - Body: `{ "tech": "ruben", "password": "..."}` -> *Inicia sesión en backend (crea cookie)*.
*   `POST` `/api/auth/logout` -> *Destruye la sesión actual.*
*   `GET` `/api/auth/me` -> *Retorna el nombre si la cookie es válida, verificando autenticación activa.*
</details>

<details>
<summary><strong>📋 Gestión de Partes (<code>/api/partes</code>)</strong></summary>
<br>

*   `GET` `/api/partes` -> *Lista Partes sin PDF en payload (ligero). Soporta query params: `?tech=`, `?status=` y búsqueda libre `?q=`.*
*   `POST` `/api/partes` -> *Crea un nuevo Borrador (Draft) en la DB SQLite.*
*   `PUT` `/api/partes/:id` -> *Modificando la data individual (Campos base, fotos, array interno JSON de mats, etc).*
*   `GET` `/api/partes/:id` -> *Retorna los detalles íntegros de un solo parte.*
*   `DELETE` `/api/partes/:id` -> *Elimina del registro de la tabla local.*
</details>

<details>
<summary><strong>📧 Envío & Subida Especial</strong></summary>
<br>

*   **Subida Fotografía (POST)** `/api/upload` - *[Multipart Form, campo: `file`]* -> *Almacena en binario local y devuelve un JSON con URL en string.*
*   **Envío de PDF por Correo (POST)** `/api/partes/:id/send`
    *   **Body:** `{ "para": "client@mail.com", "cc": ["...", "..."], "pdfBase64": "data:pdf...", "filename": "albaran.pdf" }`
    *   **Acuse:** Actualiza la DB SQLite incrustando el String en Base64 de forma temporal/pesada, dispara un email a los destinatarios mediante *Nodemailer* por SMTP cambiando el estado exitoso de proceso al ticket completo (Status > Sent).
</details>

---

## 💻 Usage Examples

Aprovecha tu terminal para interactuar con la API de forma programática (usando `curl`):

```bash
# 1. Hacer Login y guardar las cookies
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"tech": "ruben", "password": "mipassword"}' \
  -c cookies.txt

# 2. Consultar mis partes pendientes en estado draft utilizando autenticación
curl -X GET "http://localhost:3000/api/partes?status=draft" \
  -b cookies.txt
```

---

## 🧠 How It Works (Data Flow)

1. 📲 **Captura de Data Front-End:** El Frontend es una _Single Page Application_ (SPA/Vanilla). Mantiene el historial de cada ticket en un estado dinámico temporal sin obligar a refrescar la página.
2. 📸 **Intercambio Multipart:** Al subir evidencias fotográficas, el componente JS manda al vuelo hacia `/api/upload` el Buffer. El back (usando Multer) las deposita en el disco `/uploads` y retorna un URI público limpio para la interfaz.
3. 🖋️ **Firma Digital Vectorial:** Apoyado en `SignaturePad`, ambas firmas (técnico y cliente) son convertidas desde un elemento `<canvas>` vivo directamente a imagen codificada formato `Base64 (PNG)` integrándose al objeto.
4. 💾 **Sincronización:** Mediante petición hacia la ruta controladora local, se guardan y serializan los materiales en `.db` (`schema` tipo SQLite usando librerías nativas actualizadas e instanciando modo *WAL*).
5. 🖨️ **Baking del Comprobante PDF Creado Al Vuelo:** Un `div` virtual HTML pre-maquetado es rellenado con plantillas. Acto seguido `html2canvas` inyecta dicho ticket a una simulación tipo imagen y lo remueve en formato PDF usando el generador `jsPDF` codificando el base64 de vuelta. El servidor **no consume la CPU**, lo hace el navegador por delante.
6. 🚀 **Distribución Asíncrona SMTP:** El Archivo base64 validado hace push a `/api/partes/:id/send`, la ruta prepara el buffer re-acondicionando su cabecera y delega un servicio de Email con `Nodemailer`.


## 📝 LICENCIA - Business Source License 1.1 (BSL 1.1)

**Aparte** está protegido bajo la **BSL 1.1**.

* **Permitido**: Uso personal, investigación, desarrollo interno y contribuciones.
* **Prohibido**: Uso comercial directo, hosting como SaaS, redistribución o creación de productos competidores sin licencia.

📧 **Contacto Comercial**: [dasikuhp@gmail.com](mailto:dasikuhp@gmail.com)

---

<div align="center">
  <p>Autor: <strong>DasikuHp</strong> | Versión: aparte-alfa | Actualizado: 2026-04-02</p>
  <p>🚀 <em>Ready to revolutionize local development.</em></p>
</div>

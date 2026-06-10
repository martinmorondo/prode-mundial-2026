# 🏆 Prode La Ronda - Copa Mundial 2026

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Plataforma interactiva de pronósticos deportivos (Prode) desarrollada para la comunidad **La Ronda** de cara a la **Copa Mundial de la FIFA 2026**. Diseñada con un fuerte enfoque en la gamificación, la participación de los usuarios y la seguridad de los datos.

---

## 🚀 Características Principales

### 🎯 Sistema de Puntaje Inteligente
- **3 puntos** por acertar el resultado exacto.
- **1 punto** por acertar únicamente la tendencia (local, empate o visitante).

### 🃏 Mecánica de Comodín (Joker)
- Cada usuario puede activar un **comodín por grupo**.
- Los puntos obtenidos en ese partido se multiplican por **2**.

### 🔥 Motor de Gamificación

#### Rachas
- Detección automática y cronológica de aciertos consecutivos.

#### 🛡️ Cazagigantes
- Recompensa especial para quienes acierten resultados contrarios a la tendencia mayoritaria de la comunidad.

### 📊 Termómetro Social
- Visualización en tiempo real de los porcentajes de votación:
  - Local
  - Empate
  - Visitante

### 📸 Exportación de Pronósticos
- Generación nativa de imágenes **PNG** para compartir resultados y predicciones en redes sociales.

### 🌎 Internacionalización de Horarios
- Sincronización automática mediante `Date.UTC`.
- Bloqueo automático de pronósticos **1 hora antes** del inicio oficial de cada encuentro.

---

## 🔐 Seguridad y Privacidad de Datos

La transparencia y la seguridad son pilares fundamentales del proyecto.

### 1. Autenticación Delegada
La gestión de usuarios y contraseñas se realiza mediante **Firebase Authentication**.

> Este proyecto **no almacena**, **no procesa** y **no tiene acceso** a las contraseñas de los usuarios en texto plano.

### 2. Base de Datos Segura
Se utilizan **Firestore Security Rules** para garantizar que cada usuario solo pueda modificar sus propios documentos de predicción mediante su identificador único (`uid`).

### 3. Transparencia de Datos
Los únicos datos visibles para la comunidad son:

- Nombre de usuario
- Avatar (emoji)
- Pronósticos realizados

No se comparte información personal adicional.

---

## 🏗️ Arquitectura Técnica

El proyecto sigue una arquitectura basada en componentes reutilizables y *Custom Hooks*, separando claramente la lógica de negocio de la interfaz de usuario.

### `useProdeData.js`
Actúa como el núcleo de la aplicación:

- Suscripciones en tiempo real a Firestore.
- Procesamiento de datos y rankings.
- Cálculo de medallas y estadísticas.
- Optimización mediante `useMemo`.

### `App.jsx`
Componente principal encargado de:

- Orquestar la navegación interna.
- Gestionar estados globales.
- Administrar notificaciones y eventos generales.

### 🎨 Interfaz
- Desarrollada con **Tailwind CSS**.
- Diseño totalmente responsivo.
- Iconografía implementada con **lucide-react**.

---

## 🛠️ Instalación y Uso Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/TU-USUARIO/prode-mundial-2026.git
```

### 2. Ingresar al proyecto

```bash
cd prode-mundial-2026
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Configurar Firebase

Crear un archivo `.env` en la raíz del proyecto e incorporar las credenciales correspondientes de Firebase.

### 5. Ejecutar el entorno de desarrollo

```bash
npm run dev
```

---

## 📂 Tecnologías Utilizadas

- React
- Vite
- Firebase Authentication
- Cloud Firestore
- Tailwind CSS
- Lucide React

---

## 📄 Licencia

Este proyecto fue desarrollado para uso comunitario y educativo.

El código fuente se encuentra disponible para auditoría, aprendizaje y mejora continua.
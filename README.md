# Neuro-Access BCI: Traductor de Intención Motora

> **Prototipo Educativo y Experimental desarrollado para el Hacktoberfest Hack Day La Paz 2026**  
> *Plataforma de Interfaz Cerebro-Computador (BCI) no invasiva asistida por IA empática (Gemma 4 / Gemini) y procesamiento de señales en tiempo real.*

---

## 1. Nombre del Proyecto
**Neuro-Access BCI: Traductor de Intención Motora y Simulador de Persona Virtual**

---

## 2. Descripción Breve: Qué hace y para quién
**Neuro-Access BCI** es una aplicación web de una sola página (SPA) que simula y decodifica señales electroencefalográficas (EEG) en tiempo real a 250 Hz para traducir la intención motora (*Motor Imagery*) en comandos de autonomía física y digital.

Está diseñada principalmente para **personas con movilidad severamente reducida** (como pacientes con secuelas de Esclerosis Lateral Amiotrófica - ELA, tetraplejia traumática o accidentes cerebrovasculares) y para **investigadores, clínicos y desarrolladores de neurotecnología** que requieren evaluar algoritmos BCI de decodificación y biofeedback sin necesidad de adquirir de inmediato costosos cascos de EEG ni manipular datasets clínicos pesados.

---

## 3. Problema Identificado: Necesidad que se desea atender
Millones de personas en el mundo viven con discapacidades motoras graves que les impiden mover sus extremidades o comunicarse mediante el habla y el teclado convencional, a pesar de conservar intactas sus capacidades cognitivas y de planificación motora cortical.

Los desafíos actuales en el campo de las Interfaces Cerebro-Computador (BCI) son:
1. **Barreras de Entrada y Dependencia de Datasets Pesados:** La investigación y prototipado temprano se ven obstaculizados por la necesidad de hardware EEG costoso y datasets de gigabytes difíciles de procesar en navegadores web.
2. **Falta de Empatía y Calidez en la Respuesta de la Interfaz:** Las interfaces BCI convencionales suelen arrojar códigos binarios impersonales o alertas frías (*"Error en umbral 0x01"*), aumentando la frustración y la fatiga cognitiva del usuario.
3. **Ausencia de Simuladores Dinámicos Inter-individuales:** La mayoría de los entornos de prueba utilizan bucles pregrabados estáticos que no reflejan la variabilidad fisiológica real entre diferentes personas (diferencias de frecuencia dominante Mu, niveles de impedancia y ruido).

---

## 4. Solución Propuesta: Cómo responde al problema
**Neuro-Access BCI** aborda estos retos mediante una solución integral de tres pilares:

1. **Simulador Fisiológico de Persona Virtual (250 Hz):**
   - Modela la señal continua siguiendo la formulación biofísica:  
     $$\text{EEG}(t) = \text{ritmo cerebral} + \text{variación aleatoria} + \text{ruido} + \text{efecto del estado experimental} + \text{deriva lenta}$$
   - Simula los canales clave del sistema internacional 10-20: **C3** (mano derecha), **Cz** (vertex/sensorial) y **C4** (mano izquierda).
   - Simula con fidelidad el fenómeno de **Desincronización Relacionada con Eventos (ERD)**: en reposo la onda Mu (~10 Hz) oscila de forma sincrónica y suave; durante la imaginación motora, la amplitud cae drásticamente ($-50\%$ a $-80\%$) y emerge la banda Beta (~20 Hz).
   - Generador de *"Nueva persona"* que introduce variabilidad biológica controlada entre sesiones.

2. **Protocolo Experimental Automatizado (5 Etapas):**
   - Ejecuta un ciclo guiado con cuenta regresiva en vivo:  
     `REPOSO (5s)` $\rightarrow$ `MANO DERECHA (5s)` $\rightarrow$ `REPOSO (5s)` $\rightarrow$ `MANO IZQUIERDA (5s)` $\rightarrow$ `ESTÍMULO SENSORIAL (5s)`.
   - Permite realizar múltiples ensayos (*Ensayo 1, Ensayo 2, Ensayo 3...*) para calcular automáticamente la **repetibilidad**, el **promedio de ERD** y el **Coeficiente de Variación (CV%)**.

3. **Intérprete Empático Gemma 4 / Gemini:**
   - La IA decodifica la caída espectral y responde con retroalimentación en lenguaje natural cálido, humano y alentador, reconociendo el esfuerzo mental del paciente.
   - Conexión con efectores de autonomía asistiva: avance de diapositivas de presentación, giro de silla de ruedas, activación de llamada a enfermería y control domótico de iluminación.
   - Síntesis de voz accesible en español (*Web Speech API*) y exportación de reportes clínicos de sesión en formato `.txt`.

---

## 5. Tecnologías Utilizadas

### Lenguajes y Frameworks
- **TypeScript 5.x / JavaScript ES2022:** Tipado estricto para modelos biomédicos, interfaces de hardware y cálculo DSP.
- **React 19:** Arquitectura modular de componentes funcionales, hooks y estado reactivo.
- **Vite 8:** Entorno de compilación ultrarrápido y servidor de desarrollo.
- **Tailwind CSS v4:** Sistema de diseño con paleta cálida y human-centric (*#FAFAFA, #F5EBE0, #E07A5F, #81B29A*).

### Bibliotecas y APIs
- **Chart.js:** Osciloscopio multicanal continuo con montaje clínico separado, sin parpadeos ni tirones (`animation: false`).
- **Lucide React:** Iconografía vectorial estilizada para electrodos y actuadores.
- **Canvas Confetti:** Retroalimentación visual positiva ante la traducción exitosa de la intención motora.
- **Web Speech API (`SpeechSynthesis`):** Síntesis de voz para accesibilidad auditiva universal.

---

## 6. Uso de Inteligencia Artificial

### Modelo Utilizado
- **Gemma 4 / Google Gemini (Gemini 2.5 Flash API):** SDK `@google/genai` y conector `fetch()` con soporte para inferencia de borde (*edge*) y modelos generativos multimodales de Google.

### Función que cumple en el Proyecto
1. **Traducción Empática de Señales Crudas:** Convierte parámetros biofísicos de telemetría (desincronización ERD en C3, atenuación espectral Mu en $\mu\text{V}^2$, emergencia Beta y SNR) en un mensaje empático y alentador orientado a la rehabilitación motora.
2. **Validación Contextual de Comandos Asistivos:** Confirma la ejecución de comandos para la autonomía física (avanzar diapositivas, timbrar asistencia, modular silla de ruedas).
3. **Generación de Notas Clínicas:** Redacta resúmenes neurofisiológicos de apoyo para el personal de salud y cuidadores.

### Razón de su Elección
- **Baja latencia:** Crucial en interfaces cerebro-computador de interacción casi en tiempo real.
- **Capacidad de alineación empática:** Permite alejarse de las respuestas mecánicas y técnicas tradicionales de los dispositivos médicos, tratando al usuario con respeto y calidez.
- **Integración nativa:** Fácil conexión cliente/servidor mediante las APIs de Google Cloud y AI Studio.

---

## 7. Repositorio y Arquitectura del Código Fuente

El código se organiza bajo una arquitectura modular desacoplada:

```
src/
├── types/
│   └── bci.ts                    # Interfaces de electrodos, métricas DSP, personas virtuales y ensayos
├── services/
│   ├── eegDataSource.ts          # Arquitectura desacoplada: IEEGDataSource (SimuladorEEG | DispositivoEEGReal)
│   ├── dspEngine.ts              # Algoritmos Goertzel, cálculo de potencia espectral, ERD y SNR
│   └── geminiService.ts          # Integración con Gemma 4, Web Speech API y generador de reporte .txt
├── components/
│   ├── TopBanner.tsx             # Banner oficial Hacktoberfest Hack Day La Paz 2026
│   ├── BrainMap.tsx              # Mapa cerebral SVG 10-20 con pulsos animados en C3, Cz y C4
│   ├── OscilloscopeChart.tsx     # Osciloscopio Chart.js multicanal (montaje clínico separado, gain controls)
│   ├── ExtractedFeaturesPanel.tsx# Panel "Características EEG extraídas" y repetibilidad inter-ensayos
│   ├── GemmaConsole.tsx          # Consola de interpretación empática de IA y efectores
│   ├── VirtualSubjectModal.tsx   # Modal de ajuste de parámetros fisiológicos de la persona virtual
│   └── InfoModal.tsx             # Documentación de fundamentos clínicos y neuroéticos
├── App.tsx                       # Orquestador principal de la aplicación SPA
└── standalone_neuro_access_bci.html # Versión autocontenida portátil (HTML+CSS+JS en 1 solo archivo)
```

### Arquitectura de Adquisición Preparada para Hardware Real
```
                     ┌───────────────────────────┐
                     │  Fuente EEG (IEEGSource)  │
                     └─────────────┬─────────────┘
                                   │
              ┌────────────────────┴────────────────────┐
              ▼                                         ▼
   ┌───────────────────────┐               ┌───────────────────────────┐
   │     SimuladorEEG      │               │   DispositivoEEGReal      │
   │  (Sintético 250 Hz)   │               │ (OpenBCI / Web-Bluetooth) │
   └──────────┬────────────┘               └─────────────┬─────────────┘
              │                                          │
              └────────────────────┬─────────────────────┘
                                   ▼
                   ┌───────────────────────────────┐
                   │  Filtros DSP Pasa-banda/Notch │
                   └───────────────┬───────────────┘
                                   ▼
                   ┌───────────────────────────────┐
                   │  Extracción de Características│
                   └───────────────┬───────────────┘
                                   ▼
                   ┌───────────────────────────────┐
                   │ Intérprete IA Gemma 4 / UI   │
                   └───────────────────────────────┘
```

---

## 8. Instrucciones para Probar el Prototipo

### Requisitos Previos
- Node.js (versión 18 o superior)
- Navegador web moderno (Chrome, Edge, Safari, Firefox)

### Ejecución Local
1. **Clonar o descargar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd neuro-access-bci
   ```
2. **Instalar dependencias:**
   ```bash
   npm install
   ```
3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
4. **Abrir en el navegador:**
   - Ingresar a: `http://localhost:3000`

### Probar la Versión Portátil sin Instalación
- Abrir directamente con doble clic el archivo `standalone_neuro_access_bci.html` en cualquier navegador (no requiere Node.js ni conexión a internet).

### Pasos de Evaluación Sugeridos
1. Observar la señal en **REPOSO**: el canal C3 mostrará una oscilación rítmica armónica a ~10 Hz (Ritmo Mu rolándico sincronizado).
2. Pulsar **"INICIAR EXPERIMENTO"**: el sistema guiará automáticamente las 5 fases de 5 segundos cada una. Observar cómo al llegar a *"IMAGINA MOVER MANO DERECHA"*, la amplitud de C3 se reduce (ERD) y el mapa cerebral activa el pulso en el hemisferio izquierdo.
3. Al finalizar, revisar el panel **"Características EEG extraídas"** para ver los valores calculados de potencia Mu, potencia Beta, ERD% y latencia.
4. Repetir la prueba para observar cómo se calculan la **estabilidad entre ensayos** y el **Coeficiente de Variación (CV%)**.
5. Pulsar **"Nueva persona"** para generar un perfil virtual distinto y comparar las respuestas biométricas.
6. Pulsar **"Descargar Reporte (.txt)"** para obtener el resumen clínico completo en archivo plano.

---

## 9. Demostración y Enlaces

- **Demo en Vivo (Entorno AI Studio Cloud):**  
  [https://ais-pre-p5tbsx7zf34ntoxif56qhq-900298878558.us-east1.run.app](https://ais-pre-p5tbsx7zf34ntoxif56qhq-900298878558.us-east1.run.app)
- **Entorno de Desarrollo:**  
  [https://ais-dev-p5tbsx7zf34ntoxif56qhq-900298878558.us-east1.run.app](https://ais-dev-p5tbsx7zf34ntoxif56qhq-900298878558.us-east1.run.app)
- **Demostración en Video:**  
  *(Enlace al video de YouTube / Loom / Drive de la presentación del equipo)*

---

## 10. Integrantes del Equipo y Contribuciones

| Integrante | Rol Principal | Contribución en el Proyecto |
| :--- | :--- | :--- |
| **Mauricio Cachi** | *Líder de Proyecto & Neuroingeniería* | Conceptualización del modelo de intención motora, formulación del generador DSP a 250 Hz, diseño del protocolo experimental de 5 etapas y arquitectura desacoplada `IEEGDataSource`. |
| **Equipo Neuro-Access** | *Desarrollo Frontend & UI/UX* | Implementación de componentes en React, estilización *Warm & Human-Centric* en Tailwind CSS, trazado SVG del sistema 10-20 y osciloscopio Chart.js. |
| **Equipo IA & Accesibilidad** | *Integración Gemma 4 / Gemini* | Diseño del prompt empático, modelado de la retroalimentación en lenguaje natural, síntesis de voz Web Speech API y exportación de reportes clínicos. |

---

## 11. Categorías a las que Postula

El proyecto postula a las siguientes categorías del **Hacktoberfest Hack Day La Paz 2026**:

1. **Salud, Accesibilidad e Inclusión Social:**  
   Aplicación directa orientada a devolver autonomía y canales de comunicación y control ambiental a personas con cuadriplejia o enfermedades neurodegenerativas sin requerir movimiento muscular.
2. **Inteligencia Artificial con Propósito e Impacto Humano:**  
   Uso de modelos generativos (Gemma / Gemini) no como simples clasificadores fríos, sino como traductores empáticos que reducen la carga cognitiva y aportan contención emocional.
3. **Innovación Abierta y Neurotecnología Educativa:**  
   Provisión de un simulador sintético ligero y desacoplado que democratiza el aprendizaje y prueba de algoritmos BCI en estudiantes e investigadores sin recursos para costosos cascos de EEG.

# Nombres de Participantes
Barrionuevo Aparicio Luis Ernesto
Cachi Tola Mao Gregorio 
Saico Kama Teddy Fredrick
---


## Transparencia y Responsabilidad Científica

> **AVISO IMPORTANTE:**  
> Este proyecto es un prototipo desarrollado con fines **estrictamente educativos y de simulación de ingeniería biomédica**.  
> Los datos presentados son **completamente sintéticos** y calculados mediante funciones matemáticas en tiempo real.  
> **NO constituyen datos médicos de pacientes reales y NO deben utilizarse para diagnosticar Esclerosis Lateral Amiotrófica (ELA), accidentes cerebrovasculares ni ninguna otra afección clínica.**  
> El objetivo científico del prototipo es: *"Simular, detectar y cuantificar cambios en actividad EEG sensoriomotora durante diferentes tareas controladas."*

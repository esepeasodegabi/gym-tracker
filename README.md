# Mi Rutina · Gym Tracker

Aplicación Angular, móvil y sin backend para llevar una rutina semanal de gimnasio. Guarda todo en IndexedDB, propone automáticamente los valores de la última sesión y muestra la evolución de peso y volumen.

## Funcionalidades

- Pantalla **Hoy** basada en el día actual.
- Rutina inicial de fuerza/hipertrofia y biblioteca de 33 ejercicios.
- Registro de peso, repeticiones y estado serie por serie.
- Precarga exacta de la última sesión de cada ejercicio.
- Histórico de sesiones e histórico específico por ejercicio.
- Detección sencilla de récord por peso máximo o volumen.
- Estadísticas semanales, mensuales, totales y gráficas con Chart.js.
- Editor semanal con alta, baja, orden y valores recomendados.
- Ejercicios personalizados y buscador de biblioteca.
- Exportación e importación preventiva en JSON.
- PWA instalable y disponible sin conexión tras la primera carga.
- Diseño mobile-first y navegación inferior de cuatro secciones.

## Tecnología y arquitectura

- Angular 22, standalone components, lazy loading, signals y TypeScript estricto.
- IndexedDB mediante `idb`, detrás de `ExerciseRepository`, `RoutineRepository` y `WorkoutRepository`.
- Dominio y cálculos como funciones puras, independientes de Angular.
- Chart.js cargado únicamente al abrir Estadísticas.
- Angular Service Worker para PWA/offline.
- Rutas con hash para que GitHub Pages funcione también al recargar.

```text
src/app/
├── core/
│   ├── data/       # IndexedDB, repositorios, seed y store
│   └── domain/     # modelos, fechas, progreso y tests
└── features/
    ├── today/      # entrenamiento del día
    ├── workout/    # registro serie por serie
    ├── history/    # sesiones e histórico por ejercicio
    ├── routine/    # editor y backup
    └── stats/      # métricas y gráficas
```

## Desarrollo local

Requiere Node.js 22 o superior.

```bash
npm ci
npm start
```

La aplicación queda disponible en `http://localhost:4200`.

## Calidad

```bash
npm test -- --watch=false
npm run lint
npm run build
```

Las pruebas cubren cálculo de volumen, récords, última sesión, propuesta de series y persistencia de repositorios IndexedDB.

## Persistencia y privacidad

La base `gym-tracker-db` usa un esquema versionado (versión 1). En la primera apertura, si no existe una rutina, se cargan la biblioteca y la rutina de ejemplo. El seed no vuelve a ejecutarse y nunca sobrescribe cambios del usuario.

No existe cuenta, servidor ni transferencia de datos. Borrar los datos del navegador elimina la información. En **Rutina → Copia de seguridad** se puede descargar o restaurar un JSON.

## Despliegue

El workflow `.github/workflows/deploy-pages.yml` ejecuta tests, lint y build de producción en cada push a `main`, configura el `base-href` con el nombre real del repositorio y publica `dist/gym-tracker/browser` en GitHub Pages.

En GitHub, Pages debe usar **GitHub Actions** como origen. Los permisos y la concurrencia ya están declarados en el workflow.

## Limitaciones del MVP

- Los datos pertenecen exclusivamente al navegador y dispositivo actual.
- No hay sincronización ni autenticación.
- No incluye temporizador de descanso ni edición retroactiva de sesiones.
- El cálculo de volumen usa únicamente series marcadas como completadas.

(() => {
  const ready = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn)
    : fn();

  ready(() => {
    const STORAGE_MODE = 'angularAulaLearningMode';
    const STORAGE_CHECKS = 'angularAulaFileChecksV1';

    const stageMeta = {
      instalacion: {
        before: 'El computador todavía no está preparado para ejecutar Angular.',
        after: 'Node, npm y Angular CLI responden correctamente desde la terminal.',
        files: ['node -v responde', 'npm -v responde', 'ng version responde']
      },
      crear: {
        before: 'No existe todavía el proyecto Angular Aula.',
        after: 'Existe angular-aula/ y ng serve puede iniciar la aplicación.',
        files: ['Proyecto angular-aula creado', 'Dependencias instaladas', 'ng serve funciona']
      },
      estructura: {
        before: 'Ves muchas carpetas pero todavía no sabes para qué sirven.',
        after: 'Puedes ubicar src/, app/, public/, angular.json y package.json.',
        files: ['Reconozco src/', 'Reconozco src/app/', 'Sé para qué sirve package.json']
      },
      raiz: {
        before: 'La aplicación conserva el contenido inicial generado por Angular.',
        after: 'El componente raíz ya tiene estructura propia para Angular Aula.',
        files: ['app.ts revisado', 'app.html modificado', 'app.css modificado']
      },
      binding: {
        before: 'El HTML es estático y no reacciona a datos o eventos.',
        after: 'El template muestra propiedades y ejecuta métodos del componente.',
        files: ['Interpolación funciona', 'Property binding funciona', 'Event binding funciona']
      },
      signals: {
        before: 'El estado se maneja como valores normales.',
        after: 'La lista y el total reaccionan cuando cambia un Signal.',
        files: ['signal() creado', 'update() probado', 'computed() probado']
      },
      control: {
        before: 'No se repiten ni condicionan fragmentos del template.',
        after: '@if y @for controlan qué HTML aparece.',
        files: ['@if funciona', '@for recorre la lista', 'track está definido']
      },
      modelo: {
        before: 'Los estudiantes son datos sin una estructura TypeScript formal.',
        after: 'La interface Estudiante define campos y tipos.',
        files: ['models/ creado', 'estudiante.ts creado', 'Interface compila']
      },
      tarjeta: {
        before: 'El HTML de cada estudiante tendría que repetirse.',
        after: 'Existe EstudianteCard como componente reutilizable.',
        files: ['Componente generado', 'Template de tarjeta creado', 'CSS de tarjeta creado']
      },
      comunicacion: {
        before: 'Padre e hijo todavía no intercambian datos ni eventos.',
        after: 'input() envía el estudiante y output() devuelve el ID.',
        files: ['input.required() definido', 'output() definido', '$event llega al padre']
      },
      servicio: {
        before: 'Cada página podría terminar administrando sus propios datos.',
        after: 'Un servicio centraliza lista, total, agregar y eliminar.',
        files: ['Servicio generado', 'Signal privado creado', 'agregar/eliminar funcionan']
      },
      listado: {
        before: 'No existe una página completa para buscar y listar estudiantes.',
        after: 'Estudiantes combina búsqueda, tarjetas y eliminación.',
        files: ['Página generada', 'FormsModule importado', 'Filtro funciona']
      },
      formulario: {
        before: 'No existe una interfaz para registrar nuevos estudiantes.',
        after: 'El formulario valida, guarda y navega al listado.',
        files: ['ngModel funciona', 'Validaciones funcionan', 'Guardar navega']
      },
      rutas: {
        before: 'La aplicación funciona como una única pantalla.',
        after: 'Cada URL selecciona una página mediante Angular Router.',
        files: ['Rutas definidas', 'routerLink funciona', 'router-outlet funciona']
      },
      'inicio-page': {
        before: 'No existe un dashboard que resuma el estado.',
        after: 'Inicio muestra métricas derivadas del servicio.',
        files: ['Página Inicio creada', 'total visible', 'Navegación a Nuevo funciona']
      },
      storage: {
        before: 'Un F5 elimina los estudiantes creados durante la sesión.',
        after: 'localStorage conserva y restaura la lista.',
        files: ['guardar() implementado', 'leer() implementado', 'F5 conserva datos']
      },
      http: {
        before: 'Los datos solo existen localmente.',
        after: 'HttpClient puede obtener usuarios externos y convertirlos en Estudiante.',
        files: ['provideHttpClient() agregado', 'HttpClient inyectado', 'Importación funciona']
      },
      estados: {
        before: 'La petición no comunica si está cargando, tuvo éxito o falló.',
        after: 'La interfaz representa loading, success y error.',
        files: ['Signal cargando creado', 'Mensaje visible', 'Botón se deshabilita']
      },
      acabado: {
        before: 'La aplicación funciona pero todavía tiene estilos desiguales.',
        after: 'Angular Aula presenta una interfaz coherente y responsive.',
        files: ['Responsive revisado', 'Estados hover/focus revisados', 'Vista móvil comprobada']
      },
      build: {
        before: 'Solo se ha ejecutado la aplicación en modo desarrollo.',
        after: 'ng build genera una versión lista para publicar.',
        files: ['ng build finaliza sin error', 'dist/ generado', 'Resultado final revisado']
      }
    };

    const commonErrors = {
      instalacion: ['ng no se reconoce', 'Angular CLI no está disponible en el PATH o la terminal debe reiniciarse después de instalarlo.'],
      crear: ['ng serve falla inmediatamente', 'Comprueba que estás dentro de la carpeta angular-aula y que npm install terminó correctamente.'],
      raiz: ['El template no cambia', 'Revisa que templateUrl apunte a ./app.html y que estés editando el proyecto correcto.'],
      binding: ['La expresión aparece como texto', 'En Angular una interpolación necesita doble llave: {{ valor }}.'],
      signals: ['Se imprime la función y no el valor', 'Los Signals se leen con paréntesis: estudiantes(), no estudiantes.'],
      modelo: ['TypeScript marca una propiedad faltante', 'El objeto debe cumplir la interface o la propiedad debe declararse opcional con ?.'],
      comunicacion: ['$event llega como undefined', 'Comprueba que el hijo haga emit(valor) y que el padre escuche exactamente el mismo output.'],
      servicio: ['NullInjectorError', 'Normalmente significa que Angular no sabe cómo crear la dependencia. Revisa @Injectable y providedIn.'],
      listado: ["Can't bind to 'ngModel'", 'Falta importar FormsModule en el componente standalone.'],
      formulario: ['El botón nunca se habilita', 'Revisa required, email, min/max y que cada control tenga name cuando sea necesario.'],
      rutas: ['La URL cambia pero no aparece la página', 'Comprueba que app.html contenga router-outlet y que RouterOutlet esté importado.'],
      storage: ['JSON.parse lanza error', 'Puede existir contenido inválido en localStorage. Usa un valor por defecto y controla errores de parseo.'],
      http: ['No provider for HttpClient', 'Agrega provideHttpClient() en app.config.ts.'],
      estados: ['Importar ejecuta varias peticiones', 'Deshabilita el botón mientras cargando() sea true.'],
      build: ['ng build falla aunque ng serve funcionaba', 'Lee el primer error de compilación: el build suele ser más estricto con tipos y templates.']
    };

    const challenges = {
      binding: {
        text: 'Agrega una propiedad subtitulo y muéstrala debajo del título usando interpolación.',
        hints: ['Crea subtitulo = ... dentro de la clase.', 'En HTML usa {{ subtitulo }}.'],
        solution: "subtitulo = 'Gestión sencilla';\n\n<p>{{ subtitulo }}</p>"
      },
      signals: {
        text: 'Crea un computed que indique si hay al menos un estudiante.',
        hints: ['Debe depender de estudiantes().length.', 'El resultado puede ser booleano.'],
        solution: 'hayEstudiantes = computed(() => this.estudiantes().length > 0);'
      },
      control: {
        text: 'Muestra “No hay estudiantes” cuando el array esté vacío.',
        hints: ['Puedes usar @empty dentro de @for.', 'El bloque va después del contenido repetido.'],
        solution: '@for (e of estudiantes(); track e.id) { ... } @empty { <p>No hay estudiantes</p> }'
      },
      modelo: {
        text: 'Agrega una propiedad opcional telefono de tipo string.',
        hints: ['Una propiedad opcional lleva ?.', 'La sintaxis combina nombre?: tipo.'],
        solution: 'telefono?: string;'
      },
      tarjeta: {
        text: 'Agrega visualmente el semestre del estudiante a la tarjeta.',
        hints: ['La tarjeta ya recibe un Estudiante.', 'Lee estudiante().semestre desde el template.'],
        solution: '<p>Semestre {{ estudiante().semestre }}</p>'
      },
      comunicacion: {
        text: 'Crea un output llamado editar que emita el id.',
        hints: ['Se parece a eliminar.', 'El tipo del output puede ser number.'],
        solution: 'editar = output<number>();\n\nthis.editar.emit(this.estudiante().id);'
      },
      servicio: {
        text: 'Crea un método buscarPorId(id) que devuelva el estudiante encontrado.',
        hints: ['Lee this._estudiantes().', 'Array.find() sirve para encontrar un elemento.'],
        solution: 'buscarPorId(id: number) { return this._estudiantes().find(e => e.id === id); }'
      },
      listado: {
        text: 'Haz que el buscador también encuentre estudiantes por correo.',
        hints: ['El filtro ya compara nombre y programa.', 'Agrega otra condición con email.toLowerCase().includes(filtro).'],
        solution: 'estudiante.email.toLowerCase().includes(filtro)'
      },
      formulario: {
        text: 'Impide registrar un semestre menor que 1 o mayor que 10.',
        hints: ['Los inputs numéricos aceptan min y max.', 'Angular incorporará esas reglas al estado del formulario.'],
        solution: '<input type="number" min="1" max="10" ...>'
      },
      rutas: {
        text: 'Crea una ruta /acerca que muestre el componente Acerca.',
        hints: ['Agrégala al array Routes.', "El path se escribe sin / inicial."],
        solution: "{ path: 'acerca', component: Acerca }"
      },
      'inicio-page': {
        text: 'Muestra una métrica con el número de estudiantes de semestre mayor que 5.',
        hints: ['Puede ser computed().', 'Usa filter(...).length.'],
        solution: 'avanzados = computed(() => this.estudiantes().filter(e => e.semestre > 5).length);'
      },
      storage: {
        text: 'Cambia la clave de localStorage por angular-aula-v2.',
        hints: ['Busca la constante o propiedad que contiene la clave.', 'Guardar y leer deben usar exactamente la misma clave.'],
        solution: "private clave = 'angular-aula-v2';"
      },
      http: {
        text: 'Importa solo los primeros 3 usuarios de la API.',
        hints: ['La lista ya usa slice().', 'slice(0, 3) toma posiciones 0,1,2.'],
        solution: 'usuarios.slice(0, 3).map(...)'
      },
      estados: {
        text: 'Muestra un texto diferente mientras se importan estudiantes.',
        hints: ['Ya existe cargando().', 'Puedes usar un operador ternario en interpolación.'],
        solution: "{{ cargando() ? 'Importando...' : 'Importar desde API' }}"
      },
      acabado: {
        text: 'Agrega un estado :focus-visible claro para botones y enlaces.',
        hints: ['Usa outline.', 'No elimines el foco sin reemplazarlo por otro indicador.'],
        solution: 'button:focus-visible, a:focus-visible { outline: 3px solid #8b5cf6; outline-offset: 2px; }'
      }
    };

    const exercises = {
      binding: {
        title: 'Completa un event binding',
        prompt: 'Escribe un botón que ejecute guardar() al hacer clic.',
        starter: '<button\n  ______="guardar()">\n  Guardar\n</button>',
        require: ['(click)', 'guardar()'],
        solution: '<button (click)="guardar()">Guardar</button>'
      },
      signals: {
        title: 'Crea un Signal',
        prompt: 'Declara contador con valor inicial 0.',
        starter: 'contador = ______;',
        require: ['signal(0)'],
        solution: 'contador = signal(0);'
      },
      control: {
        title: 'Repite estudiantes',
        prompt: 'Escribe un @for que recorra estudiantes() usando e.id como track.',
        starter: '@for (__________) {\n  <p>{{ e.nombre }}</p>\n}',
        require: ['@for', 'e of estudiantes()', 'track e.id'],
        solution: '@for (e of estudiantes(); track e.id) { <p>{{ e.nombre }}</p> }'
      },
      modelo: {
        title: 'Tipa una propiedad',
        prompt: 'Declara semestre como número dentro de una interface.',
        starter: 'semestre: ______;',
        require: ['semestre:', 'number'],
        solution: 'semestre: number;'
      },
      comunicacion: {
        title: 'Emite un ID',
        prompt: 'Emite id usando el output eliminar.',
        starter: 'this.eliminar.________;',
        require: ['emit', 'id'],
        solution: 'this.eliminar.emit(id);'
      },
      formulario: {
        title: 'Two-way binding',
        prompt: 'Vincula el input con formulario.nombre usando ngModel.',
        starter: '<input ______="formulario.nombre">',
        require: ['[(ngmodel)]', 'formulario.nombre'],
        solution: '<input [(ngModel)]="formulario.nombre">'
      },
      rutas: {
        title: 'Define una ruta',
        prompt: 'Crea la ruta estudiantes para el componente Estudiantes.',
        starter: "{ path: '____', component: ______ }",
        require: ["path: 'estudiantes'", 'component: estudiantes'],
        solution: "{ path: 'estudiantes', component: Estudiantes }"
      },
      http: {
        title: 'Petición GET tipada',
        prompt: 'Completa una petición GET que espere UsuarioApi[].',
        starter: "this.http.______<________>('...')",
        require: ['get<usuarioapi[]>'],
        solution: "this.http.get<UsuarioApi[]>('https://jsonplaceholder.typicode.com/users')"
      }
    };

    const quizzes = {
      raiz: {
        q: '¿Qué archivo contiene principalmente la lógica del componente?',
        options: ['app.css', 'app.ts', 'app.html'],
        correct: 1,
        explain: 'app.ts contiene la clase, imports, propiedades, Signals y métodos.'
      },
      binding: {
        q: '¿Qué sintaxis escucha un clic?',
        options: ['[click]', '{{ click }}', '(click)'],
        correct: 2,
        explain: 'Los paréntesis representan event binding.'
      },
      signals: {
        q: '¿Cómo se lee el valor de un Signal llamado total?',
        options: ['total', 'total()', 'total.value'],
        correct: 1,
        explain: 'Los Signals se leen invocándolos: total().'
      },
      comunicacion: {
        q: '¿Qué herramienta envía un evento del hijo al padre?',
        options: ['input()', 'output()', 'computed()'],
        correct: 1,
        explain: 'output() permite emitir eventos hacia el componente padre.'
      },
      servicio: {
        q: '¿Dónde conviene centralizar los estudiantes compartidos?',
        options: ['En cada tarjeta', 'En el servicio', 'En app.css'],
        correct: 1,
        explain: 'El servicio mantiene una sola fuente de estado para varias páginas.'
      },
      formulario: {
        q: '¿Qué permite [(ngModel)]?',
        options: ['Solo leer', 'Sincronizar input y propiedad', 'Crear una ruta'],
        correct: 1,
        explain: 'Es two-way binding: vista y propiedad quedan sincronizadas.'
      },
      rutas: {
        q: '¿Dónde aparece el componente de la ruta activa?',
        options: ['router-outlet', 'package.json', 'localStorage'],
        correct: 0,
        explain: 'router-outlet actúa como espacio de renderizado de la ruta.'
      },
      storage: {
        q: '¿Por qué usamos JSON.stringify() antes de guardar objetos?',
        options: ['Para convertirlos en texto', 'Para ordenarlos', 'Para borrarlos'],
        correct: 0,
        explain: 'localStorage guarda strings, por eso serializamos objetos y arrays.'
      },
      http: {
        q: '¿Qué función transforma UsuarioApi a Estudiante en el ejemplo?',
        options: ['filter()', 'map()', 'includes()'],
        correct: 1,
        explain: 'map() convierte cada elemento de una forma a otra.'
      },
      build: {
        q: '¿Qué comando prepara la aplicación para distribución?',
        options: ['ng serve', 'ng build', 'ng version'],
        correct: 1,
        explain: 'ng build genera los archivos optimizados de salida.'
      }
    };

    const origins = {
      raiz: ['@Component', 'Decorador de Angular', 'Conecta la clase con metadata como selector, template e imports.'],
      signals: ['signal() / computed()', 'Primitivas reactivas de Angular', 'Permiten modelar estado y valores derivados sin actualizar la vista manualmente.'],
      modelo: ['Omit<T, K>', 'Utility type de TypeScript', 'Crea un tipo a partir de otro quitando determinadas propiedades.'],
      comunicacion: ['input() / output()', 'API de componentes Angular', 'Define el contrato de comunicación entre componentes.'],
      servicio: ['inject()', 'Inyección de dependencias Angular', 'Pide a Angular una instancia ya administrada de un servicio u otra dependencia.'],
      formulario: ['[(ngModel)]', 'FormsModule de Angular', 'Combina property binding + event binding para sincronización bidireccional.'],
      rutas: ['router-outlet', 'Angular Router', 'Marca el lugar del template donde se inserta la página de la ruta activa.'],
      http: ['Observable / pipe / tap', 'RxJS', 'Modelan flujos asíncronos y permiten encadenar operaciones sobre ellos.'],
      estados: ['subscribe()', 'RxJS', 'Activa el consumo del Observable y permite manejar next/error.']
    };

    const glossary = [
      ['Componente','Pieza de interfaz Angular formada por lógica, template y estilos.'],
      ['Template','HTML que Angular procesa para renderizar un componente.'],
      ['Signal','Contenedor reactivo de estado que se lee con paréntesis.'],
      ['computed','Valor reactivo calculado a partir de otros Signals.'],
      ['Servicio','Clase para lógica o estado compartido entre componentes.'],
      ['Inyección de dependencias','Mecanismo por el que Angular entrega servicios ya creados.'],
      ['SPA','Aplicación de una sola página donde cambia el contenido sin recargar todo el documento.'],
      ['Router','Sistema que asocia URLs con componentes.'],
      ['router-outlet','Lugar donde Angular inserta el componente de la ruta activa.'],
      ['Binding','Conexión entre TypeScript y el template.'],
      ['Interpolación','Sintaxis {{ valor }} para mostrar datos como texto.'],
      ['Event binding','Sintaxis (evento) para ejecutar lógica cuando ocurre una acción.'],
      ['Property binding','Sintaxis [propiedad] para controlar propiedades desde TypeScript.'],
      ['Two-way binding','Sincronización en ambas direcciones, por ejemplo [(ngModel)].'],
      ['Interface','Contrato TypeScript que describe la forma de un objeto.'],
      ['Observable','Flujo asíncrono utilizado ampliamente por RxJS y HttpClient.'],
      ['HttpClient','Servicio Angular para realizar peticiones HTTP.'],
      ['localStorage','Almacenamiento simple de strings dentro del navegador.'],
      ['Provider','Configuración que le indica a Angular cómo disponer una dependencia.'],
      ['Standalone','Componente Angular que declara directamente sus imports sin NgModule propio.'],
      ['@if','Control flow de Angular para renderizado condicional.'],
      ['@for','Control flow de Angular para repetir contenido.'],
      ['input','Dato que un componente hijo recibe desde su padre.'],
      ['output','Evento que un hijo emite hacia el padre.'],
      ['Build','Proceso que transforma el código fuente en archivos listos para distribución.']
    ];

    function escapeHtml(value='') {
      return value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    }

    function insertAfter(ref, node) {
      ref.parentNode.insertBefore(node, ref.nextSibling);
    }

    function create(html) {
      const tpl = document.createElement('template');
      tpl.innerHTML = html.trim();
      return tpl.content.firstElementChild;
    }

    function setupMode() {
      const top = document.querySelector('.top-actions');
      if (!top) return;
      let btn = document.getElementById('learningModeBtn');
      if (!btn) {
        btn = create('<button class="mode-btn" id="learningModeBtn" type="button">Modo: <span>Principiante</span></button>');
        top.prepend(btn);
      }
      const saved = localStorage.getItem(STORAGE_MODE) || 'beginner';
      document.body.dataset.learningMode = saved;
      const render = () => {
        const normal = document.body.dataset.learningMode === 'normal';
        btn.querySelector('span').textContent = normal ? 'Normal' : 'Principiante';
        btn.title = normal ? 'Mostrar explicaciones para principiantes' : 'Ocultar ayudas extra';
      };
      btn.addEventListener('click', () => {
        const next = document.body.dataset.learningMode === 'normal' ? 'beginner' : 'normal';
        document.body.dataset.learningMode = next;
        localStorage.setItem(STORAGE_MODE, next);
        render();
      });
      document.querySelectorAll('.code-explanation,.mini-example,.syntax-lab,.syntax-breakdown,.beginner-note').forEach(el => el.classList.add('beginner-extra'));
      render();
    }

    function enhanceStages() {
      Object.entries(stageMeta).forEach(([id, meta]) => {
        const section = document.getElementById(id);
        if (!section || section.querySelector('.stage-delta')) return;
        const head = section.querySelector('.section-head');
        if (head) insertAfter(head, create(
          '<div class="stage-delta beginner-extra">' +
            '<div class="stage-delta__box"><b>ANTES</b><p>'+escapeHtml(meta.before)+'</p></div>' +
            '<div class="stage-delta__arrow">→</div>' +
            '<div class="stage-delta__box after"><b>DESPUÉS DE ESTA ETAPA</b><p>'+escapeHtml(meta.after)+'</p></div>' +
          '</div>'
        ));

        const mission = section.querySelector('.mission');
        if (mission && !section.querySelector('.file-checklist')) {
          const saved = JSON.parse(localStorage.getItem(STORAGE_CHECKS) || '{}');
          const body = meta.files.map((item, index) => {
            const key = id + ':' + index;
            const checked = !!saved[key];
            return '<label class="file-check '+(checked?'done':'')+'"><input type="checkbox" data-file-check="'+escapeHtml(key)+'" '+(checked?'checked':'')+'><span>'+escapeHtml(item)+'</span></label>';
          }).join('');
          mission.parentNode.insertBefore(create(
            '<div class="file-checklist beginner-extra"><div class="file-checklist__head"><strong>✓ Checklist antes de avanzar</strong><span>'+meta.files.length+' puntos</span></div><div class="file-checklist__body">'+body+'</div></div>'
          ), mission);
        }
      });

      document.addEventListener('change', e => {
        const cb = e.target.closest('[data-file-check]');
        if (!cb) return;
        const saved = JSON.parse(localStorage.getItem(STORAGE_CHECKS) || '{}');
        saved[cb.dataset.fileCheck] = cb.checked;
        localStorage.setItem(STORAGE_CHECKS, JSON.stringify(saved));
        cb.closest('.file-check')?.classList.toggle('done', cb.checked);
      });
    }

    function addErrors() {
      Object.entries(commonErrors).forEach(([id,[title,body]]) => {
        const section = document.getElementById(id);
        if (!section || section.querySelector('[data-common-error]')) return;
        const target = section.querySelector('.codebox,.term,.command-explain');
        if (!target) return;
        insertAfter(target, create(
          '<div class="common-error beginner-extra" data-common-error="'+id+'"><div class="common-error__head">⚠ Error común: '+escapeHtml(title)+'</div><div class="common-error__body"><b>Qué revisar:</b> '+escapeHtml(body)+'</div></div>'
        ));
      });
    }

    function addChallenges() {
      Object.entries(challenges).forEach(([id,data]) => {
        const section = document.getElementById(id);
        if (!section || section.querySelector('[data-challenge]')) return;
        const mission = section.querySelector('.mission');
        if (!mission) return;
        const card = create(
          '<div class="challenge-card beginner-extra" data-challenge="'+id+'">' +
            '<div class="challenge-card__head"><strong>🎯 Mini reto</strong><span>Inténtalo antes de ver la solución</span></div>' +
            '<div class="challenge-card__body"><p>'+escapeHtml(data.text)+'</p>' +
            '<div class="learning-actions"><button type="button" data-next-hint>Mostrar pista</button><button type="button" data-show-solution>Ver solución</button></div>' +
            '<div class="hint-box" hidden></div><div class="solution-box" hidden><code>'+escapeHtml(data.solution)+'</code></div>' +
            '</div></div>'
        );
        card.dataset.hintIndex = '0';
        mission.parentNode.insertBefore(card, mission);
      });

      document.addEventListener('click', e => {
        const hintBtn = e.target.closest('[data-next-hint]');
        if (hintBtn) {
          const card = hintBtn.closest('[data-challenge]');
          const data = challenges[card.dataset.challenge];
          const box = card.querySelector('.hint-box');
          let i = Number(card.dataset.hintIndex || 0);
          if (i < data.hints.length) {
            box.hidden = false;
            box.innerHTML += (i ? '<br>' : '') + '<b>Pista '+(i+1)+':</b> ' + escapeHtml(data.hints[i]);
            i++;
            card.dataset.hintIndex = String(i);
            hintBtn.textContent = i >= data.hints.length ? 'No hay más pistas' : 'Siguiente pista';
            hintBtn.disabled = i >= data.hints.length;
          }
        }
        const solBtn = e.target.closest('[data-show-solution]');
        if (solBtn) {
          const box = solBtn.closest('[data-challenge]').querySelector('.solution-box');
          box.hidden = !box.hidden;
          solBtn.textContent = box.hidden ? 'Ver solución' : 'Ocultar solución';
        }
      });
    }

    function addExercises() {
      Object.entries(exercises).forEach(([id,data]) => {
        const section = document.getElementById(id);
        if (!section || section.querySelector('[data-exercise]')) return;
        const mission = section.querySelector('.mission');
        if (!mission) return;
        const card = create(
          '<div class="exercise-card beginner-extra" data-exercise="'+id+'">' +
            '<div class="exercise-card__head"><strong>✍ Ejercicio autocorregible · '+escapeHtml(data.title)+'</strong><span>editable</span></div>' +
            '<div class="exercise-card__body"><p>'+escapeHtml(data.prompt)+'</p>' +
            '<textarea spellcheck="false">'+escapeHtml(data.starter)+'</textarea>' +
            '<div class="learning-actions"><button type="button" data-check-exercise>Comprobar</button><button type="button" data-fill-solution>Ver solución</button></div>' +
            '<div class="exercise-feedback" hidden></div></div></div>'
        );
        mission.parentNode.insertBefore(card, mission);
      });

      document.addEventListener('click', e => {
        const check = e.target.closest('[data-check-exercise]');
        if (check) {
          const card = check.closest('[data-exercise]');
          const data = exercises[card.dataset.exercise];
          const value = card.querySelector('textarea').value.toLowerCase().replace(/\s+/g,' ');
          const ok = data.require.every(req => value.includes(req.toLowerCase().replace(/\s+/g,' ')));
          const fb = card.querySelector('.exercise-feedback');
          fb.hidden = false;
          fb.className = 'exercise-feedback ' + (ok?'ok':'bad');
          fb.textContent = ok ? '✓ Bien. La idea principal está correcta.' : 'Todavía falta algo. Revisa la sintaxis y usa una pista del tema si la necesitas.';
        }
        const fill = e.target.closest('[data-fill-solution]');
        if (fill) {
          const card = fill.closest('[data-exercise]');
          card.querySelector('textarea').value = exercises[card.dataset.exercise].solution;
        }
      });
    }

    function addQuizzes() {
      Object.entries(quizzes).forEach(([id,data]) => {
        const section = document.getElementById(id);
        if (!section || section.querySelector('[data-quiz]')) return;
        const mission = section.querySelector('.mission');
        if (!mission) return;
        const options = data.options.map((opt,i) => '<button class="quiz-option" type="button" data-answer="'+i+'">'+escapeHtml(opt)+'</button>').join('');
        mission.parentNode.insertBefore(create(
          '<div class="quiz-card beginner-extra" data-quiz="'+id+'"><div class="quiz-card__head"><strong>❓ Comprueba que lo entendiste</strong><span>1 pregunta</span></div>' +
          '<div class="quiz-card__body"><p><b>'+escapeHtml(data.q)+'</b></p><div class="quiz-options">'+options+'</div><div class="quiz-feedback" hidden></div></div></div>'
        ), mission);
      });

      document.addEventListener('click', e => {
        const btn = e.target.closest('.quiz-option');
        if (!btn) return;
        const card = btn.closest('[data-quiz]');
        const data = quizzes[card.dataset.quiz];
        card.querySelectorAll('.quiz-option').forEach(x => x.classList.remove('selected'));
        btn.classList.add('selected');
        const ok = Number(btn.dataset.answer) === data.correct;
        const fb = card.querySelector('.quiz-feedback');
        fb.hidden = false;
        fb.className = 'quiz-feedback '+(ok?'ok':'bad');
        fb.innerHTML = (ok?'✓ Correcto. ':'Todavía no. ') + escapeHtml(data.explain);
      });
    }

    function addOrigins() {
      Object.entries(origins).forEach(([id,[term,source,meaning]]) => {
        const section = document.getElementById(id);
        if (!section || section.querySelector('[data-origin]')) return;
        const mission = section.querySelector('.mission');
        if (!mission) return;
        mission.parentNode.insertBefore(create(
          '<div class="origin-card beginner-extra" data-origin="'+id+'"><div class="origin-card__head"><strong>🧭 ¿De dónde salió esto? · '+escapeHtml(term)+'</strong><span>contexto</span></div>' +
          '<div class="origin-card__body"><div class="origin-flow"><div><b>Origen</b><br>'+escapeHtml(source)+'</div><span>→</span><div><b>En este proyecto</b><br>'+escapeHtml(meaning)+'</div></div></div></div>'
        ), mission);
      });
    }

    function setupGlossary() {
      if (document.querySelector('.glossary-launch')) return;
      const launch = create('<button class="glossary-launch" type="button">📚 Glosario</button>');
      const panel = create(
        '<aside class="glossary-panel" aria-label="Glosario Angular"><div class="glossary-panel__head"><strong>Glosario rápido</strong><button type="button" aria-label="Cerrar">×</button></div>' +
        '<input class="glossary-search" placeholder="Buscar término..."><div class="glossary-list"></div></aside>'
      );
      document.body.append(launch,panel);
      const list = panel.querySelector('.glossary-list');
      const render = (q='') => {
        q=q.toLowerCase().trim();
        list.innerHTML = glossary.filter(([t,d]) => !q || (t+' '+d).toLowerCase().includes(q))
          .map(([t,d]) => '<div class="glossary-item"><b>'+escapeHtml(t)+'</b><span>'+escapeHtml(d)+'</span></div>').join('');
      };
      render();
      launch.addEventListener('click',()=>panel.classList.toggle('open'));
      panel.querySelector('button').addEventListener('click',()=>panel.classList.remove('open'));
      panel.querySelector('input').addEventListener('input',e=>render(e.target.value));
    }

    function explainLine(text) {
      const t = text.trim();
      const rules = [
        [/^import\b/i,'Importa una herramienta, tipo o clase desde otro archivo o paquete para poder usarla aquí.'],
        [/@Component/,'@Component es metadata de Angular: describe selector, template, estilos e imports del componente.'],
        [/@Injectable/,'@Injectable permite que Angular administre esta clase mediante inyección de dependencias.'],
        [/signal\s*</,'signal<T>() crea estado reactivo del tipo indicado entre < >.'],
        [/computed\s*\(/,'computed() define un valor derivado que se recalcula cuando cambian los Signals que lee.'],
        [/inject\s*\(/,'inject() pide a Angular una instancia administrada de una dependencia.'],
        [/input\.required|input\s*</,'input() declara datos que este componente recibe desde su padre.'],
        [/output\s*</,'output() declara un evento que el componente puede emitir hacia su padre.'],
        [/\.emit\s*\(/,'.emit() envía el valor del output a quien esté escuchando el evento.'],
        [/\[\(ngModel\)\]/,'[(ngModel)] sincroniza en ambos sentidos el valor del input y una propiedad TypeScript.'],
        [/@if\b/,'@if renderiza el bloque únicamente cuando la condición es verdadera.'],
        [/@for\b/,'@for repite el bloque por cada elemento de una colección.'],
        [/router-outlet/i,'router-outlet es el lugar donde Angular inserta la página correspondiente a la ruta activa.'],
        [/routerLink/i,'routerLink navega entre rutas Angular sin recargar toda la página.'],
        [/HttpClient|\.get\s*</,'HttpClient realiza peticiones HTTP. get<T>() indica además el tipo esperado de respuesta.'],
        [/subscribe\s*\(/,'subscribe() comienza a consumir un Observable y permite reaccionar a next/error.'],
        [/\.pipe\s*\(/,'pipe() encadena operadores RxJS sobre un Observable.'],
        [/\btap\s*\(/,'tap() ejecuta una acción secundaria cuando pasa un valor sin reemplazar ese valor.'],
        [/localStorage\.setItem/,'setItem guarda un string bajo una clave en el navegador.'],
        [/localStorage\.getItem/,'getItem recupera el string guardado con una clave.'],
        [/JSON\.stringify/,'JSON.stringify convierte objetos o arrays a texto JSON.'],
        [/JSON\.parse/,'JSON.parse convierte texto JSON nuevamente en objetos o arrays.'],
        [/\bprivate\b/,'private limita el acceso directo de esa propiedad o método a la propia clase.'],
        [/\breadonly\b/,'readonly evita reasignar la propiedad a otra referencia después de inicializarla.'],
        [/Omit\s*</,'Omit<T,K> crea un tipo basado en T pero quitando las propiedades indicadas en K.'],
        [/=>/,'=> define una arrow function. Lo de la izquierda son parámetros y lo de la derecha es el cuerpo o resultado.'],
        [/\.filter\s*\(/,'filter() produce un array nuevo conservando solo elementos que cumplen una condición.'],
        [/\.map\s*\(/,'map() transforma cada elemento de un array y devuelve otro array.'],
        [/\.update\s*\(/,'update() cambia un Signal usando su valor actual como entrada.'],
        [/\.set\s*\(/,'set() reemplaza directamente el valor de un Signal.']
      ];
      const found = rules.find(([re])=>re.test(t));
      return found ? found[1] : 'Lee esta línea por partes: identifica primero la variable o método principal, luego los paréntesis, tipos y operadores. El contexto de las líneas cercanas completa el significado.';
    }

    function setupInspector() {
      if (document.querySelector('.inspector-panel')) return;
      const panel = create('<aside class="inspector-panel"><div class="inspector-panel__head"><strong>🔎 Inspector de código</strong><button type="button">×</button></div><div class="inspector-panel__body"><div class="inspector-code"></div><div class="inspector-explain"></div></div></aside>');
      document.body.append(panel);
      panel.querySelector('button').addEventListener('click',()=> {
        panel.classList.remove('open');
        document.querySelectorAll('.code-line.inspecting').forEach(x=>x.classList.remove('inspecting'));
      });
      document.addEventListener('click', e => {
        const line = e.target.closest('.code-line');
        if (!line) return;
        document.querySelectorAll('.code-line.inspecting').forEach(x=>x.classList.remove('inspecting'));
        line.classList.add('inspecting');
        const text = line.querySelector('.line-code')?.innerText || line.innerText;
        panel.querySelector('.inspector-code').textContent = text;
        panel.querySelector('.inspector-explain').textContent = explainLine(text);
        panel.classList.add('open');
      });
    }

    function updateLearningMap() {
      const completed = new Set(JSON.parse(localStorage.getItem('angularAulaWorkshopV3') || '[]'));
      const phases = [
        {el:'map-phase-1', nums:[1,2,3,4]},
        {el:'map-phase-2', nums:[5,6,7,8]},
        {el:'map-phase-3', nums:[9,10,11,12]},
        {el:'map-phase-4', nums:[13,14,15,16]},
        {el:'map-phase-5', nums:[17,18,19,20]}
      ];
      phases.forEach(p => {
        const el=document.getElementById(p.el); if(!el)return;
        const done=p.nums.filter(n=>completed.has(String(n))).length;
        el.classList.toggle('done',done===p.nums.length);
        el.classList.toggle('current',done>0 && done<p.nums.length);
        el.querySelector('[data-count]')?.replaceChildren(document.createTextNode(done+'/'+p.nums.length+' etapas'));
      });
    }

    function setupPreviewEvolution() {
      document.querySelectorAll('.preview-evolution').forEach(root => {
        root.addEventListener('click',e => {
          const tab=e.target.closest('.preview-tab'); if(!tab)return;
          root.querySelectorAll('.preview-tab').forEach(x=>x.classList.toggle('active',x===tab));
          root.querySelectorAll('.preview-stage').forEach(x=>x.classList.toggle('active',x.dataset.previewStage===tab.dataset.previewTarget));
        });
      });
    }

    function setupDebugLab() {
      document.addEventListener('click', e => {
        const btn=e.target.closest('[data-debug-answer]'); if(!btn)return;
        const box=btn.closest('.debug-case');
        const fb=box.querySelector('.debug-feedback');
        const ok=btn.dataset.debugAnswer==='correct';
        fb.hidden=false;
        fb.className='debug-feedback '+(ok?'ok':'bad');
        fb.textContent=ok ? '✓ Correcto. '+(box.dataset.explanation||'') : 'Aún no. Busca el primer punto donde Angular deja de tener la información o dependencia necesaria.';
      });
    }

    setupMode();
    enhanceStages();
    addErrors();
    addChallenges();
    addExercises();
    addQuizzes();
    addOrigins();
    setupGlossary();
    setupInspector();
    setupPreviewEvolution();
    setupDebugLab();
    updateLearningMap();
    document.querySelectorAll('[data-finish]').forEach(btn=>btn.addEventListener('click',()=>setTimeout(updateLearningMap,0)));
  });
})();
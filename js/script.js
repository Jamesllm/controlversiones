/**
 * ========================================================
 * Task University - Sistema de Gestión Académica
 * Archivo: js/script.js
 * Descripción: Lógica de control para gestión de tareas, 
 *              usuarios y métricas del dashboard.
 * ========================================================
 */

// Modelos de datos y constructores auxiliares
function crearObjetoTarea({ id, titulo, descripcion, idUsuario, completada = false, fechaCreacion = new Date().toLocaleDateString() }) {
    return {
        id,
        titulo,
        descripcion,
        idUsuario: parseInt(idUsuario),
        completada,
        fechaCreacion,
        // Compatibilidad hacia atrás si se accede con nombres en inglés
        get title() { return this.titulo; },
        set title(valor) { this.titulo = valor; },
        get description() { return this.descripcion; },
        set description(valor) { this.descripcion = valor; },
        get userId() { return this.idUsuario; },
        set userId(valor) { this.idUsuario = parseInt(valor); },
        get completed() { return this.completada; },
        set completed(valor) { this.completada = valor; },
        get createdAt() { return this.fechaCreacion; },
        set createdAt(valor) { this.fechaCreacion = valor; }
    };
}

function crearObjetoUsuario({ id, nombre, email, rol }) {
    return {
        id,
        nombre,
        email,
        correo: email,
        rol,
        // Compatibilidad hacia atrás si se accede con nombres en inglés
        get name() { return this.nombre; },
        set name(valor) { this.nombre = valor; },
        get role() { return this.rol; },
        set role(valor) { this.rol = valor; }
    };
}

// Datos iniciales de prueba (Mock Data) con variables en español
let usuarios = [
    crearObjetoUsuario({ id: 1, nombre: "Carlos Arroyo", email: "carlos@taskuni.edu", rol: "Estudiante - Ing. Sistemas" }),
    crearObjetoUsuario({ id: 2, nombre: "Jhimi Tarrillo", email: "jhimi@taskuni.edu", rol: "Estudiante - Ing. Sistemas" }),
    crearObjetoUsuario({ id: 3, nombre: "James Llapapasca", email: "james@taskuni.edu", rol: "Estudiante - Ing. Sistemas" }),
    crearObjetoUsuario({ id: 4, nombre: "Carlos Bustamante", email: "carlosb@taskuni.edu", rol: "Estudiante - Ing. Sistemas" }),
    crearObjetoUsuario({ id: 5, nombre: "Danna Miñan", email: "danna@taskuni.edu", rol: "Estudiante - Ing. Sistemas" }),
   
];

let tareas = [
    crearObjetoTarea({ id: 1, titulo: "Diseño de Base de Datos", descripcion: "Crear el diagrama Entidad-Relación para el proyecto.", idUsuario: 1, completada: false, fechaCreacion: new Date().toLocaleDateString() }),
    crearObjetoTarea({ id: 2, titulo: "Informe Técnico TPC", descripcion: "Redactar la introducción y arquitectura en formato PDF.", idUsuario: 2, completada: true, fechaCreacion: new Date().toLocaleDateString() })
];

// Instancia del modal de tareas (Bootstrap)
let instanciaModalTarea = null;

// Inicialización cuando el documento HTML está completamente cargado
window.addEventListener('DOMContentLoaded', () => {
    const modalElemento = document.getElementById('taskModal');
    if (modalElemento) {
        instanciaModalTarea = new bootstrap.Modal(modalElemento);
    }
    renderizarTodo();
});

/**
 * Actualiza todas las secciones de la interfaz
 */
function renderizarTodo() {
    renderizarDashboard();
    renderizarTareas();
    renderizarUsuarios();
    cargarDesplegableUsuarios();
}

/**
 * Renderiza los contadores y las tareas recientes en el panel de Dashboard
 */
function renderizarDashboard() {
    const total = tareas.length;
    const completadas = tareas.filter(t => t.completada).length;
    const pendientes = total - completadas;

    const elTotal = document.getElementById('dashTotalTasks');
    const elCompletadas = document.getElementById('dashCompletedTasks');
    const elPendientes = document.getElementById('dashPendingTasks');

    if (elTotal) elTotal.textContent = total;
    if (elCompletadas) elCompletadas.textContent = completadas;
    if (elPendientes) elPendientes.textContent = pendientes;

    // Renderizar la tabla de tareas recientes
    const cuerpoRecientes = document.getElementById('dashRecentTasksTable');
    if (!cuerpoRecientes) return;

    cuerpoRecientes.innerHTML = '';

    if (tareas.length === 0) {
        cuerpoRecientes.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No hay tareas registradas.</td></tr>`;
        return;
    }

    const tareasRecientes = [...tareas].reverse().slice(0, 5);
    tareasRecientes.forEach(tarea => {
        const usuario = usuarios.find(u => u.id === parseInt(tarea.idUsuario));
        const nombreUsuario = usuario ? usuario.nombre : 'Sin Asignar';
        const etiquetaEstado = tarea.completada 
            ? `<span class="badge bg-success-subtle text-success badge-status"><i class="fa-solid fa-circle-check me-1"></i>Completada</span>`
            : `<span class="badge bg-warning-subtle text-warning badge-status"><i class="fa-solid fa-clock me-1"></i>Pendiente</span>`;

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td class="ps-4 fw-semibold text-dark">${escaparHtml(tarea.titulo)}</td>
            <td>${escaparHtml(nombreUsuario)}</td>
            <td>${etiquetaEstado}</td>
            <td class="pe-4 text-muted small">${tarea.fechaCreacion || 'Reciente'}</td>
        `;
        cuerpoRecientes.appendChild(fila);
    });
}

/**
 * Renderiza el listado de tareas con filtros de búsqueda y estado
 */
function renderizarTareas() {
    const cuerpoTabla = document.getElementById('tasksTableBody');
    if (!cuerpoTabla) return;

    const inputBusqueda = document.getElementById('taskSearchInput');
    const selectFiltro = document.getElementById('taskStatusFilter');

    const textoBusqueda = inputBusqueda ? inputBusqueda.value.toLowerCase().trim() : '';
    const estadoFiltro = selectFiltro ? selectFiltro.value : 'ALL';

    cuerpoTabla.innerHTML = '';

    const tareasFiltradas = tareas.filter(t => {
        const coincideBusqueda = (t.titulo || '').toLowerCase().includes(textoBusqueda) || 
                                 (t.descripcion || '').toLowerCase().includes(textoBusqueda);
        const coincideEstado = estadoFiltro === 'ALL' || 
                              (estadoFiltro === 'COMPLETED' && t.completada) || 
                              (estadoFiltro === 'PENDING' && !t.completada);
        return coincideBusqueda && coincideEstado;
    });

    if (tareasFiltradas.length === 0) {
        cuerpoTabla.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No se encontraron tareas.</td></tr>`;
        return;
    }

    tareasFiltradas.forEach(tarea => {
        const usuario = usuarios.find(u => u.id === parseInt(tarea.idUsuario));
        const nombreUsuario = usuario ? usuario.nombre : 'Usuario No Encontrado';

        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td class="ps-4 text-muted">${tarea.id}</td>
            <td>
                <div class="fw-bold ${tarea.completada ? 'text-decoration-line-through text-muted' : 'text-dark'}">${escaparHtml(tarea.titulo)}</div>
                <div class="small text-muted">${escaparHtml(tarea.descripcion)}</div>
            </td>
            <td>
                <span class="badge bg-light text-dark border"><i class="fa-solid fa-user me-1 text-secondary"></i>${escaparHtml(nombreUsuario)}</span>
            </td>
            <td>
                <button class="btn btn-sm ${tarea.completada ? 'btn-success' : 'btn-outline-warning'}" onclick="cambiarEstadoTarea(${tarea.id})">
                    <i class="fa-solid ${tarea.completada ? 'fa-check-circle' : 'fa-circle'} me-1"></i>
                    ${tarea.completada ? 'Completada' : 'Marcar Completada'}
                </button>
            </td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editarTarea(${tarea.id})" title="Editar Tarea">
                    <i class="fa-solid fa-pen"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarTarea(${tarea.id})" title="Eliminar Tarea">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

/**
 * Abre el modal para crear o editar una tarea
 * @param {number|null} idTarea 
 */
function abrirModalTarea(idTarea = null) {
    const formulario = document.getElementById('taskForm');
    if (formulario) formulario.reset();

    cargarDesplegableUsuarios();

    const campoId = document.getElementById('taskId');
    const campoTitulo = document.getElementById('taskTitle');
    const campoDescripcion = document.getElementById('taskDescription');
    const campoAsignado = document.getElementById('taskAssignedTo');
    const etiquetaModal = document.getElementById('taskModalLabel');

    if (idTarea) {
        const tarea = tareas.find(t => t.id === idTarea);
        if (tarea) {
            if (campoId) campoId.value = tarea.id;
            if (campoTitulo) campoTitulo.value = tarea.titulo;
            if (campoDescripcion) campoDescripcion.value = tarea.descripcion;
            if (campoAsignado) campoAsignado.value = tarea.idUsuario;
            if (etiquetaModal) etiquetaModal.textContent = 'Editar Tarea';
        }
    } else {
        if (campoId) campoId.value = '';
        if (etiquetaModal) etiquetaModal.textContent = 'Nueva Tarea';
    }

    if (instanciaModalTarea) {
        instanciaModalTarea.show();
    }
}

/**
 * Maneja el envío del formulario para crear o actualizar una tarea
 * @param {Event} evento 
 */
function manejarEnvioTarea(evento) {
    evento.preventDefault();

    const campoId = document.getElementById('taskId');
    const campoTitulo = document.getElementById('taskTitle');
    const campoDescripcion = document.getElementById('taskDescription');
    const campoAsignado = document.getElementById('taskAssignedTo');

    const id = campoId ? campoId.value : '';
    const titulo = campoTitulo ? campoTitulo.value.trim() : '';
    const descripcion = campoDescripcion ? campoDescripcion.value.trim() : '';
    const idUsuario = campoAsignado ? parseInt(campoAsignado.value) : NaN;

    if (!titulo || !descripcion || isNaN(idUsuario)) {
        mostrarNotificacion("Por favor complete todos los campos.");
        return;
    }

    if (id) {
        // Editar Tarea existente
        const tarea = tareas.find(t => t.id === parseInt(id));
        if (tarea) {
            tarea.titulo = titulo;
            tarea.descripcion = descripcion;
            tarea.idUsuario = idUsuario;
            mostrarNotificacion("Tarea actualizada exitosamente.");
        }
    } else {
        // Crear nueva Tarea
        const nuevaTarea = crearObjetoTarea({
            id: tareas.length ? Math.max(...tareas.map(t => t.id)) + 1 : 1,
            titulo,
            descripcion,
            idUsuario,
            completada: false,
            fechaCreacion: new Date().toLocaleDateString()
        });
        tareas.push(nuevaTarea);
        mostrarNotificacion("Tarea creada correctamente.");
    }

    if (instanciaModalTarea) {
        instanciaModalTarea.hide();
    }
    renderizarTodo();
}

/**
 * Cambia el estado de completada de una tarea
 * @param {number} id 
 */
function cambiarEstadoTarea(id) {
    const tarea = tareas.find(t => t.id === id);
    if (tarea) {
        tarea.completada = !tarea.completada;
        mostrarNotificacion(tarea.completada ? "Tarea marcada como completada." : "Tarea marcada como pendiente.");
        renderizarTodo();
    }
}

/**
 * Prepara y abre el modal para editar una tarea
 * @param {number} id 
 */
function editarTarea(id) {
    abrirModalTarea(id);
}

/**
 * Elimina una tarea según su ID
 * @param {number} id 
 */
function eliminarTarea(id) {
    if (confirm("¿Está seguro de que desea eliminar esta tarea?")) {
        tareas = tareas.filter(t => t.id !== id);
        mostrarNotificacion("Tarea eliminada.");
        renderizarTodo();
    }
}

/**
 * Renderiza el listado de usuarios en la tabla
 */
function renderizarUsuarios() {
    const cuerpoTabla = document.getElementById('usersTableBody');
    const badgeContador = document.getElementById('userCountBadge');

    if (badgeContador) {
        badgeContador.textContent = `${usuarios.length} usuarios`;
    }
    if (!cuerpoTabla) return;

    cuerpoTabla.innerHTML = '';

    if (usuarios.length === 0) {
        cuerpoTabla.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">No hay usuarios registrados.</td></tr>`;
        return;
    }

    usuarios.forEach(usuario => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td class="ps-4 fw-semibold text-dark">
                <div class="d-flex align-items-center gap-2">
                    <div class="bg-secondary bg-opacity-10 text-secondary rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    ${escaparHtml(usuario.nombre)}
                </div>
            </td>
            <td class="text-muted">${escaparHtml(usuario.email || usuario.correo)}</td>
            <td><span class="badge bg-light text-dark border">${escaparHtml(usuario.rol)}</span></td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-outline-danger" onclick="eliminarUsuario(${usuario.id})" title="Eliminar Usuario">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </td>
        `;
        cuerpoTabla.appendChild(fila);
    });
}

/**
 * Maneja el registro de un nuevo usuario desde el formulario
 * @param {Event} evento 
 */
function manejarEnvioUsuario(evento) {
    evento.preventDefault();

    const inputNombre = document.getElementById('userName');
    const inputEmail = document.getElementById('userEmail');
    const inputRol = document.getElementById('userRole');

    const nombre = inputNombre ? inputNombre.value.trim() : '';
    const email = inputEmail ? inputEmail.value.trim() : '';
    const rol = inputRol ? inputRol.value.trim() : '';

    if (!nombre || !email || !rol) {
        mostrarNotificacion("Complete todos los campos del usuario.");
        return;
    }

    const nuevoUsuario = crearObjetoUsuario({
        id: usuarios.length ? Math.max(...usuarios.map(u => u.id)) + 1 : 1,
        nombre,
        email,
        rol
    });

    usuarios.push(nuevoUsuario);

    const formulario = document.getElementById('userForm');
    if (formulario) formulario.reset();

    mostrarNotificacion("Usuario registrado exitosamente.");
    renderizarTodo();
}

/**
 * Elimina un usuario comprobando previamente que no tenga tareas asignadas
 * @param {number} id 
 */
function eliminarUsuario(id) {
    // Comprobar si el usuario tiene tareas asignadas
    const tieneTareas = tareas.some(t => t.idUsuario === id || t.userId === id);
    if (tieneTareas) {
        alert("No se puede eliminar el usuario porque tiene tareas asignadas. Reasigne o elimine las tareas primero.");
        return;
    }

    if (confirm("¿Está seguro de eliminar este usuario?")) {
        usuarios = usuarios.filter(u => u.id !== id);
        mostrarNotificacion("Usuario eliminado.");
        renderizarTodo();
    }
}

/**
 * Llena el elemento select de asignación con los usuarios disponibles
 */
function cargarDesplegableUsuarios() {
    const selector = document.getElementById('taskAssignedTo');
    if (!selector) return;

    const valorActual = selector.value;
    selector.innerHTML = '<option value="" disabled selected>Seleccione un usuario...</option>';

    usuarios.forEach(usuario => {
        const opcion = document.createElement('option');
        opcion.value = usuario.id;
        opcion.textContent = `${usuario.nombre} (${usuario.rol})`;
        selector.appendChild(opcion);
    });

    if (valorActual) {
        selector.value = valorActual;
    }
}

/**
 * Muestra un mensaje toast en pantalla
 * @param {string} mensaje 
 */
function mostrarNotificacion(mensaje) {
    const elementoToast = document.getElementById('liveToast');
    const elementoMensaje = document.getElementById('toastMessage');

    if (!elementoToast || !elementoMensaje) return;

    elementoMensaje.textContent = mensaje;
    const notificacionToast = new bootstrap.Toast(elementoToast, { delay: 3000 });
    notificacionToast.show();
}

/**
 * Escapa caracteres HTML para prevenir inyecciones XSS
 * @param {string} cadena 
 */
function escaparHtml(cadena) {
    return String(cadena)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ==========================================
// Exposición Global y Alias de Compatibilidad
// ==========================================
window.usuarios = usuarios;
window.tareas = tareas;
window.abrirModalTarea = abrirModalTarea;
window.renderizarTareas = renderizarTareas;
window.manejarEnvioUsuario = manejarEnvioUsuario;
window.manejarEnvioTarea = manejarEnvioTarea;
window.cambiarEstadoTarea = cambiarEstadoTarea;
window.editarTarea = editarTarea;
window.eliminarTarea = eliminarTarea;
window.eliminarUsuario = eliminarUsuario;
window.renderizarTodo = renderizarTodo;
window.renderizarDashboard = renderizarDashboard;
window.renderizarUsuarios = renderizarUsuarios;
window.cargarDesplegableUsuarios = cargarDesplegableUsuarios;
window.mostrarNotificacion = mostrarNotificacion;
window.escaparHtml = escaparHtml;

// Alias en inglés para compatibilidad total
window.users = usuarios;
window.tasks = tareas;
window.openTaskModal = abrirModalTarea;
window.renderTasks = renderizarTareas;
window.handleUserSubmit = manejarEnvioUsuario;
window.handleTaskSubmit = manejarEnvioTarea;
window.toggleTaskStatus = cambiarEstadoTarea;
window.editTask = editarTarea;
window.deleteTask = eliminarTarea;
window.deleteUser = eliminarUsuario;
window.renderAll = renderizarTodo;
window.renderDashboard = renderizarDashboard;
window.renderUsers = renderizarUsuarios;
window.populateUserDropdown = cargarDesplegableUsuarios;
window.showToast = mostrarNotificacion;
window.escapeHtml = escaparHtml;

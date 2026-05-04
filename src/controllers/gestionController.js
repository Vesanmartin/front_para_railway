// Arreglo en memoria donde guardamos los datos (ej: proyectos)
let proyectos = [];

//  GET → obtener todos los proyectos
const getGestion = (req, res) => {
    // Devuelve todo el arreglo
    res.json(proyectos);
};

//  POST → crear proyecto con validación
const crearGestion = (req, res) => {

    //  Validar que venga el campo "nombre"
    if (!req.body.nombre) {
        return res.status(400).json({
            mensaje: "El campo nombre es obligatorio"
        });
    }

    //  Crear objeto con ID automático
    const nuevo = {
        id: proyectos.length + 1,
        nombre: req.body.nombre
    };

    // Guardar en el arreglo
    proyectos.push(nuevo);

    // Respuesta
    res.json({
        mensaje: "Proyecto creado correctamente",
        data: nuevo
    });
};

//  PUT → actualizar un proyecto por id (posición en el arreglo)
//  PUT → actualizar proyecto con validación
const actualizarGestion = (req, res) => {

    const id = parseInt(req.params.id); // Convertir a número

    //  Validar que el proyecto exista
    if (!proyectos[id - 1]) {
        return res.status(404).json({
            mensaje: "Proyecto no encontrado"
        });
    }

    //  Validar que venga el campo "nombre"
    if (!req.body.nombre) {
        return res.status(400).json({
            mensaje: "El campo nombre es obligatorio"
        });
    }

    // Actualizar el proyecto
    proyectos[id - 1] = {
        id: id,
        nombre: req.body.nombre
    };

    res.json({
        mensaje: "Proyecto actualizado correctamente"
    });
};

//  DELETE → eliminar un proyecto por id
const eliminarGestion = (req, res) => {
    const id = parseInt(req.params.id);

    // Si no existe, error 404
    if (!proyectos[id]) {
        return res.status(404).json({ mensaje: "No encontrado" });
    }

    // Elimina 1 elemento desde esa posición
    proyectos.splice(id, 1);

    res.json({ mensaje: "Proyecto eliminado" });
};

// Exporta las funciones para usarlas en las rutas
module.exports = {
    getGestion,
    crearGestion,
    actualizarGestion,
    eliminarGestion
};
import jwt from 'jsonwebtoken';
import Docentes from '../models/Docentes.js';  // Asegúrate de importar el modelo Docentes
import Nino from '../models/Nino.js';
import Administradores from '../models/admin.js';

const verificarAutenticacion = async (req, res, next) => {
    // Verificar si el token está presente en los headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: "Lo sentimos, debes proporcionar un token válido" });
    }

    const token = authHeader.split(' ')[1]; // Extraer el token del encabezado

    try {
        // Verificar y decodificar el token
        const { id, rol } = jwt.verify(token, process.env.JWT_SECRET);

        // Verificar si el rol es docente
        if (rol === "docente") {
            // Obtener el docente de la base de datos
            req.docenteBDD = await Docentes.findById(id).lean().select("-password");
            if (!req.docenteBDD) {
                return res.status(404).json({ msg: "Docente no encontrado" });
            }
            
            // Obtener la clase del docente
            const clase = req.docenteBDD.clase; // Suponiendo que la clase está en el modelo docente

            // Añadir la clase del docente a la solicitud
            req.claseDocente = clase;

            next(); // Continuar con la siguiente función
        } else if (rol === "nino") {
            req.ninoBDD = await Nino.findById(id).lean().select("-password");
            if (!req.ninoBDD) {
                return res.status(404).json({ msg: "Niño no encontrado" });
            }
            next();
        } else if (rol === "admin") {
            req.adminBDD = await Administradores.findById(id).lean().select("-password");
            if (!req.adminBDD) {
                return res.status(404).json({ msg: "Administrador no encontrado" });
            }
            next();
        } else {
            return res.status(403).json({ msg: "Acceso denegado: rol no autorizado" });
        }
    } catch (error) {
        return res.status(401).json({ msg: "Token no válido o expirado" });
    }
};

export default verificarAutenticacion;

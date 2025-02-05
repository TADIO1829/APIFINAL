import jwt from 'jsonwebtoken';
import Docentes from '../models/Docentes.js';
import Nino from '../models/Nino.js';
import Administradores from '../models/admin.js';

const verificarAutenticacion = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: "Lo sentimos, debes proporcionar un token válido" });
    }

    const token = authHeader.split(' ')[1]; 
    console.log("Token recibido:", token); 

    try {
        
        if (rol === "docente") {
            req.docenteBDD = await Docentes.findById(id).lean().select("-password");
            if (!req.docenteBDD) {
                return res.status(404).json({ msg: "Docente no encontrado" });
            }
            req.claseDocente = req.docenteBDD.clase;  
            next();
        } else if (rol === "nino") {
            req.nino = await Nino.findById(id).lean().select("-password"); 
            if (!req.nino) {
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
        console.error("Error al verificar el token:", error);
        return res.status(401).json({ msg: "Token no válido o expirado" });
    }
};

export default verificarAutenticacion;

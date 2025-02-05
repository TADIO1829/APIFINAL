import Nino from "../models/Nino.js";
import generarJWT from "../helpers/CrearJWT.js"
import Actividad from "../models/Actividad.js";

const loginNino = async (req, res) => {
    const { email, password } = req.body;

    // Verificar que los campos no estén vacíos
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }

    try {
        // Buscar el niño por su correo electrónico y excluir campos innecesarios
        const ninoBDD = await Nino.findOne({ "tutor.emailPadres": email }).select("-estado -__v -token -updatedAt -createdAt");

        // Verificar si el niño existe
        if (!ninoBDD) {
            return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" });
        }

        // Verificar la contraseña
        const verificarPassword = await ninoBDD.matchPassword(password);
        if (!verificarPassword) {
            return res.status(404).json({ msg: "Lo sentimos, el password no es el correcto" });
        }

        // Generar el token
        const token = generarJWT(ninoBDD._id, "nino");

        // Desestructurar los datos del niño para devolverlos
        const { nombre, tutor, clase, _id } = ninoBDD;

        // Responder con el token y los datos del niño
        res.status(200).json({
            token,
            nombre,
            tutor: tutor.nombre,
            clase,
            _id,
            email: ninoBDD.tutor.emailPadres
        });

    } catch (error) {
        console.error("Error en el login:", error);
        res.status(500).json({ msg: "Hubo un error en el inicio de sesión, intente más tarde" });
    }
};


const perfilNino =(req,res)=>{
    delete req.ninoBBD.token
    delete req.ninoBBD.confirmEmail
    delete req.ninoBBD.createdAt
    delete req.ninoBBD.updatedAt
    delete req.ninoBBD.__v
    res.status(200).json(req.ninoBBD)
}


const obtenerActividadesPorClase = async (req, res) => {
    try {
        // Acceder a la clase del niño desde los datos del usuario autenticado
        const nino = await Nino.findById(req.nino._id);
        
        if (!nino) {
            return res.status(404).json({ msg: "Niño no encontrado." });
        }

        // Buscar actividades relacionadas con la clase del niño
        const actividades = await Actividad.find({ clase: nino.clase }).select('nombre descripcion fecha hora');

        if (!actividades.length) {
            return res.status(200).json({ msg: "No hay actividades registradas para esta clase." });
        }

        // Responder con las actividades encontradas
        res.status(200).json({ actividades });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al obtener las actividades." });
    }
};


export {
    loginNino,
    perfilNino,
    obtenerActividadesPorClase
    
};

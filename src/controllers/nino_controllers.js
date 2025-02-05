import Nino from "../models/Nino.js";
import generarJWT from "../helpers/CrearJWT.js"
import Actividad from "../models/Actividad.js";
import { sendMailToRecoveryPasswordNino } from "../config/nodemailer.js";

const loginNino = async (req, res) => {
    const { email, password } = req.body;
    if (Object.values(req.body).includes("")) {
        return res.status(400).json({ msg: "Lo sentimos, debes llenar todos los campos" });
    }
    try {
        const ninoBDD = await Nino.findOne({ "tutor.emailPadres": email }).select("-estado -__v -token -updatedAt -createdAt");
        if (!ninoBDD) {
            return res.status(404).json({ msg: "Lo sentimos, el usuario no se encuentra registrado" });
        }

        const verificarPassword = await ninoBDD.matchPassword(password);
        if (!verificarPassword) {
            return res.status(404).json({ msg: "Lo sentimos, el password no es el correcto" });
        }
        const token = generarJWT(ninoBDD._id, "nino");
        const { nombre, tutor, clase, _id } = ninoBDD;
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

const recuperarPasswordNino = async (req, res) => {
    const { email } = req.body;

    if (!email) return res.status(400).json({ msg: "Debes proporcionar un correo" });

    const ninoBDD = await Nino.findOne({ "tutor.emailPadres": email });

    if (!ninoBDD) return res.status(404).json({ msg: "No se encontró un niño con este correo de los padres" });

    const token = ninoBDD.crearToken();
    ninoBDD.token = token;

    await ninoBDD.save();
    await sendMailToRecoveryPasswordNino(email, token);

    res.status(200).json({ msg: "Revisa tu correo electrónico para restablecer la contraseña" });
};

const comprobarTokenPasswordNino = async (req, res) => {
    const { token } = req.params;

    if (!token) return res.status(400).json({ msg: "Token no válido" });

    const ninoBDD = await Nino.findOne({ token });

    if (!ninoBDD) return res.status(404).json({ msg: "Token inválido o expirado" });

    res.status(200).json({ msg: "Token confirmado, ahora puedes cambiar la contraseña" });
};

const nuevoPasswordNino = async (req, res) => {
    const { password, confirmpassword } = req.body;

    if (!password || !confirmpassword) return res.status(400).json({ msg: "Debes llenar todos los campos" });

    if (password !== confirmpassword) return res.status(400).json({ msg: "Las contraseñas no coinciden" });

   const ninoBDD = await Nino.findOne({ token: req.params.token });

   if (ninoBDD?.token !== req.params.token) return res.status(404).json({ msg: "Lo sentimos, no se puede validar la cuenta" });
    ninoBDD.token = null;
    ninoBDD.password = await ninoBDD.encrypPassword(password);
    await ninoBDD.save();

    res.status(200).json({ msg: "Contraseña actualizada correctamente, ya puedes iniciar sesión" });
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
    recuperarPasswordNino,
    comprobarTokenPasswordNino,
    nuevoPasswordNino,
    perfilNino,
    obtenerActividadesPorClase
    
};

import {sendMailToRecoveryPassword,sendMailToUser, sendMailToParents} from "../config/nodemailer.js"
import Docentes from "../models/Docentes.js"
import generarJWT from "../helpers/CrearJWT.js"
import mongoose from "mongoose";
import Nino from "../models/Nino.js";
import Actividad from "../models/Actividad.js";

const login =async(req,res)=>{
    const {email,password} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const docenteBDD = await Docentes.findOne({email}).select("-status -__v -token -updatedAt -createdAt")
    if(docenteBDD?.confirmEmail===false) return res.status(403).json({msg:"Lo sentimos, debe verificar su cuenta"})
    if(!docenteBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const verificarPassword = await docenteBDD.matchPassword(password)
    if(!verificarPassword) return res.status(404).json({msg:"Lo sentimos, el password no es el correcto"})
        const token = generarJWT(docenteBDD._id,"docente")
        const {nombre,apellido,direccion,telefono,_id} =docenteBDD
    res.status(200).json({
        token,
        nombre,
        apellido,
        direccion,
        telefono,
        _id,
        email:docenteBDD.email
    })
}
const perfilDocente = (req, res) => {
    if (!req.docenteBDD) {
        return res.status(404).json({ msg: "No se encontró el perfil del niño." });
    }
    // Eliminar propiedades innecesarias antes de enviar la respuesta
    const { token, confirmEmail, createdAt, updatedAt, __v, ...perfil } = req.docenteBDD;

    res.status(200).json(perfil);
};

const recuperarPassword= async(req,res)=>{
    const {email} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    const docenteBDD = await Docentes.findOne({email})
    if(!docenteBDD) return res.status(404).json({msg:"Lo sentimos, el usuario no se encuentra registrado"})
    const token = docenteBDD.crearToken()
    docenteBDD.token=token
    await sendMailToRecoveryPassword(email,token)
    await docenteBDD.save()
    res.status(200).json({msg:"Revisa tu correo electrónico para reestablecer tu cuenta"})
}
const comprobarTokenPasword = async (req,res)=>{
    if(!(req.params.token)) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    const docenteBDD = await Docentes.findOne({token:req.params.token})
    if(docenteBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    await docenteBDD.save()
  
    res.status(200).json({msg:"Token confirmado, ya puedes crear tu nuevo password"}) 
}

const nuevoPassword = async (req,res)=>{
    const{password,confirmpassword} = req.body
    if (Object.values(req.body).includes("")) return res.status(404).json({msg:"Lo sentimos, debes llenar todos los campos"})
    if(password != confirmpassword) return res.status(404).json({msg:"Lo sentimos, los passwords no coinciden"})
    const docenteBDD = await Docentes.findOne({token:req.params.token})
    if(docenteBDD?.token !== req.params.token) return res.status(404).json({msg:"Lo sentimos, no se puede validar la cuenta"})
    docenteBDD.token = null
    docenteBDD.password = await docenteBDD.encrypPassword(password)
    await docenteBDD.save()
    res.status(200).json({msg:"Felicitaciones, ya puedes iniciar sesión con tu nuevo password"}) 
}

const obtenerNinosPorClase = async (req, res) => {
    try {
        // Acceder a la clase del docente desde el middleware
        const clase = req.claseDocente;

        // Buscar niños que pertenezcan a esa clase, y solo seleccionar el nombre, el nombre del tutor y el estado
        const ninos = await Nino.find({ clase })
            .select('nombre tutor.nombre estado')  // Seleccionar solo los campos necesarios

        
        if (!ninos.length) {
            return res.status(404).json({ msg: "No se encontraron niños en tu clase" });
        }

        
        res.status(200).json(ninos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al obtener los niños" });
    }
};



const actualizarPerfil = async (req, res) => {
    if (!req.docenteBDD) {
        return res.status(403).json({ msg: "Acceso denegado: solo los docentes pueden actualizar su perfil" });
    }

    try {
        // Actualizar el perfil del docente autenticado
        const docenteActualizado = await Docentes.findByIdAndUpdate(req.docenteBDD._id, req.body, {
            new: true,
        }).select("-password");

        if (!docenteActualizado) {
            return res.status(404).json({ msg: "No se pudo actualizar el perfil" });
        }

        res.status(200).json(docenteActualizado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Hubo un error al actualizar el perfil" });
    }
};

const crearActividad = async (req, res) => {
    try {
        const { nombre, descripcion, fecha, hora, clase } = req.body;

        // Verificar si el docente está autenticado y si la clase coincide
        const docente = await Docentes.findById(req.docenteBDD._id);
        if (!docente) {
            return res.status(404).json({ message: 'Docente no encontrado.' });
        }

        // Verificar si la clase es la misma que la del docente
        if (docente.clase !== clase) {
            return res.status(403).json({ message: 'No tienes permiso para crear actividades en esta clase.' });
        }

        // Crear el objeto de actividad
        const actividad = new Actividad({
            nombre,
            descripcion,
            fecha,
            hora,
            clase, // Clase proporcionada en el cuerpo de la solicitud
            creadaEn: new Date(), // Fecha actual de creación
        });

        // Guardar la actividad en la base de datos
        await actividad.save();

        // Obtener los niños de la clase de la actividad
        const ninos = await Nino.find({ clase: actividad.clase }).select('tutor.emailPadres'); // Accedemos a emailPadres

        if (!ninos.length) {
            return res.status(404).json({ msg: "No se encontraron niños en esta clase" });
        }

        // Enviar correo a los padres de los niños de la clase
        for (let nino of ninos) {
            console.log("Correo del tutor:", nino.tutor.emailPadres);  // Verifica si se está extrayendo correctamente
            const activityDetails = {
                name: actividad.nombre,
                description: actividad.descripcion,
                date: actividad.fecha,
                time: actividad.hora,
            };

            // Verifica si el correo es válido antes de enviar el correo
            if (nino.tutor.emailPadres) {
                await sendMailToParents(nino.tutor.emailPadres, activityDetails);
            } else {
                console.log(`No se encontró correo para el tutor de ${nino.nombre}`);
            }
        }

        // Responder con éxito
        return res.status(201).json({
            message: 'Actividad creada con éxito y notificación enviada a los padres.',
            actividad,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al crear la actividad o enviar el correo.' });
    }
};


export {
    login,
    perfilDocente,
	recuperarPassword,
    comprobarTokenPasword,
	nuevoPassword,
    actualizarPerfil,
    obtenerNinosPorClase,
    crearActividad
}
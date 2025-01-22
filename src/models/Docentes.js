import { Schema, model } from 'mongoose';
import bcrypt from "bcryptjs";

const docenteSchema = new Schema({
    nombre: {
        type: String,
        require: true,
        trim: true
    },
    apellido: {
        type: String,
        require: true,
        trim: true
    },
    direccion: {
        type: String,
        trim: true,
        default: null
    },
    telefono: {
        type: Number,
        trim: true,
        default: null
    },
    email: {
        type: String,
        require: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    status: {
        type: Boolean,
        default: true
    },
    token: {
        type: String,
        default: null
    },
    confirmEmail: {
        type: Boolean,
        default: false
    },
    clase: {
        type: String, // Puedes usar String o cualquier otro tipo que represente la clase
        required: true, // Asegúrate de que el docente tenga asignada una clase
        trim: true
    }
}, {
    timestamps: true
});

// Método para cifrar el password del docente
docenteSchema.methods.encrypPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    const passwordEncryp = await bcrypt.hash(password, salt);
    return passwordEncryp;
}

// Método para verificar si el password ingresado es el mismo de la BDD
docenteSchema.methods.matchPassword = async function (password) {
    const response = await bcrypt.compare(password, this.password);
    return response;
}

// Método para crear un token 
docenteSchema.methods.crearToken = function () {
    const tokenGenerado = this.token = Math.random().toString(36).slice(2);
    return tokenGenerado;
}

export default model('Docente', docenteSchema);

import { Schema, model } from 'mongoose';
import bcrypt from "bcryptjs";

const adminSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido: {
        type: String,
        required: true,
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
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true
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
    }
}, {
    timestamps: true
});

adminSchema.methods.encrypPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    const passwordEncryp = await bcrypt.hash(password, salt);
    return passwordEncryp;
};

adminSchema.methods.matchPassword = async function (password) {
    const response = await bcrypt.compare(password, this.password);
    return response;
};

adminSchema.methods.crearToken = function () {
    const tokenGenerado = this.token = Math.random().toString(36).slice(2);
    return tokenGenerado;
};

export default model('Administrador', adminSchema);

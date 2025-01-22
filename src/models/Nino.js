import { Schema, model } from 'mongoose';
import bcrypt from "bcryptjs";

const ninoSchema = new Schema({
    nombre: {
        type: String,
        require: true,
        trim: true
    },
    clase: {
        type: String,
        require: true,
        trim: true 
    },
    tutor: {
        nombre: {
            type: String,
            require: true,
            trim: true
        },
        celular: {
            type: String,
            require: true,
            trim: true
        },
        emailPadres: {
            type: String,
            require: true,
            trim: true
        }
    },
    fechaIngreso: {
        type: Date,
        require: true,
        default: Date.now()
    },
    password: {
        type: String,
        require: true
    },
    estado: {
        type: Boolean,
        default: true 
    },
    token: {
        type: String,
        default: null
    },
    observaciones: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

ninoSchema.methods.encrypPassword = async function (password) {
    const salt = await bcrypt.genSalt(10);
    const passwordEncryp = await bcrypt.hash(password, salt);
    return passwordEncryp;
};

ninoSchema.methods.matchPassword = async function (password) {
    const response = await bcrypt.compare(password, this.password);
    return response;
};


ninoSchema.methods.crearToken = function () {
    const tokenGenerado = this.token = Math.random().toString(36).slice(2);
    return tokenGenerado;
}

export default model('Nino', ninoSchema);
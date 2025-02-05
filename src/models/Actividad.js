import mongoose from 'mongoose';

const actividadSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
    },
    descripcion: {
        type: String,
        required: true,
        trim: true,
    },
    fecha: {
        type: String,
        required: true,
    },
    hora: {
        type: String,
        required: true,
    },
    clase: {
        type: String,

        required: true,
    },
    creadaEn: {
        type: Date,
        default: Date.now, // Registra la fecha de creación automáticamente
    },
    status: {
        type: Boolean,
        default: true, // Puede ser útil si deseas controlar el estado de la actividad
    },
}, {
    timestamps: true, // Añade automáticamente los campos createdAt y updatedAt
});

export default mongoose.model('Actividad', actividadSchema);

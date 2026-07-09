const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 80; // inside docker we expose 80, mapped to 8080

app.use(cors());
app.use(express.json());

// Set up storage
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})
const upload = multer({ storage: storage })

// Endpoints
app.get('/api/requirements', async (req, res) => {
    try {
        const route = await prisma.userRoute.findFirst();
        const requirements = await prisma.requirement.findMany();
        res.json({ route, requirements });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/route', async (req, res) => {
    try {
        const { origin, destination } = req.body;
        let user = await prisma.user.findFirst();
        if (!user) {
            user = await prisma.user.create({ data: { name: 'Viajero', email: 'viajero@salsinmiedo.com' }});
        }
        
        let route = await prisma.userRoute.findFirst({ where: { userId: user.id }});
        if (!route) {
            route = await prisma.userRoute.create({ data: { userId: user.id, origin, destination, reason: 'Estudios', progress: 0 }});
        } else {
            route = await prisma.userRoute.update({ where: { id: route.id }, data: { origin, destination } });
        }
        
        // Limpiar documentos asociados para evitar Foreign Key Constraint Error
        const oldReqs = await prisma.requirement.findMany({ where: { routeId: route.id }});
        const oldReqIds = oldReqs.map(r => r.id);
        await prisma.document.deleteMany({ where: { requirementId: { in: oldReqIds } } });
        
        // Limpiar requisitos antiguos
        await prisma.requirement.deleteMany({ where: { routeId: route.id }});
        
        // Crear nuevos requisitos según el destino
        let newReqs = [];
        if (destination === 'España') {
            newReqs = [
                { title: 'DNI peruano o Pasaporte vigente', source: 'RENIEC / Migraciones Perú', isCritical: true, status: 'PENDING' },
                { title: 'Visa de estudiante (Estancia por estudios)', source: 'Consulado General de España en Lima', isCritical: true, status: 'PENDING' },
                { title: 'Seguro médico internacional', source: 'Requisito para estancia', isCritical: false, status: 'PENDING' },
                { title: 'Comprobante de fondos', source: 'Medios económicos suficientes', isCritical: true, status: 'PENDING' },
            ];
        } else if (destination === 'EE.UU.') {
            newReqs = [
                { title: 'DNI peruano o Pasaporte vigente', source: 'RENIEC / Migraciones Perú', isCritical: true, status: 'PENDING' },
                { title: 'Visa F-1', source: 'Embajada de EE.UU. en Lima', isCritical: true, status: 'PENDING' },
                { title: 'Formulario I-20', source: 'Universidad receptora', isCritical: true, status: 'PENDING' },
                { title: 'Pago de tarifa SEVIS (I-901)', source: 'ICE', isCritical: true, status: 'PENDING' },
            ];
        } else if (destination === 'Canadá') {
            newReqs = [
                { title: 'DNI peruano o Pasaporte vigente', source: 'RENIEC / Migraciones Perú', isCritical: true, status: 'PENDING' },
                { title: 'Permiso de estudio (Study Permit)', source: 'IRCC Canadá', isCritical: true, status: 'PENDING' },
                { title: 'Carta de aceptación (LOA)', source: 'Institución Educativa (DLI)', isCritical: true, status: 'PENDING' },
                { title: 'Examen médico', source: 'Panel Médico Aprobado en Perú', isCritical: false, status: 'PENDING' },
            ];
        } else if (destination === 'Alemania') {
            newReqs = [
                { title: 'DNI peruano o Pasaporte vigente', source: 'RENIEC / Migraciones Perú', isCritical: true, status: 'PENDING' },
                { title: 'Visa Nacional (Estudios)', source: 'Embajada de Alemania en Lima', isCritical: true, status: 'PENDING' },
                { title: 'Cuenta bloqueada (Sperrkonto)', source: 'Banco Alemán', isCritical: true, status: 'PENDING' },
                { title: 'Seguro médico estatal', source: 'TK / AOK / Coracle', isCritical: true, status: 'PENDING' },
            ];
        } else if (destination === 'Argentina') {
            newReqs = [
                { title: 'DNI peruano vigente (o Pasaporte)', source: 'RENIEC', isCritical: true, status: 'PENDING' },
                { title: 'Antecedentes Penales (Apostillados por RREE)', source: 'Policía Nacional del Perú', isCritical: true, status: 'PENDING' },
                { title: 'Partida de Nacimiento (Apostillada)', source: 'RENIEC / RREE', isCritical: true, status: 'PENDING' },
                { title: 'Trámite de Residencia Temporaria MERCOSUR', source: 'Dirección Nacional de Migraciones (Argentina)', isCritical: true, status: 'PENDING' },
            ];
        } else if (['Colombia', 'Chile', 'Bolivia', 'Ecuador', 'Brasil', 'Uruguay', 'Paraguay'].includes(destination)) {
            newReqs = [
                { title: 'DNI peruano vigente (o Pasaporte)', source: 'RENIEC', isCritical: true, status: 'PENDING' },
                { title: 'Antecedentes Penales (Apostillados por RREE)', source: 'Policía Nacional del Perú', isCritical: true, status: 'PENDING' },
                { title: 'Visa o Residencia MERCOSUR/CAN', source: `Autoridad Migratoria de ${destination}`, isCritical: true, status: 'PENDING' },
                { title: 'Carta de Aceptación Universitaria', source: 'Institución Educativa de destino', isCritical: true, status: 'PENDING' },
            ];
        } else {
            newReqs = [
                { title: 'DNI peruano vigente (o Pasaporte)', source: 'RENIEC', isCritical: true, status: 'PENDING' },
                { title: `Visa de estudiante para ${destination}`, source: `Consulado de ${destination} en Perú`, isCritical: true, status: 'PENDING' },
                { title: 'Certificado de antecedentes penales', source: 'Policía Nacional del Perú', isCritical: true, status: 'PENDING' },
                { title: 'Demostración de solvencia económica', source: 'Requisito migratorio general', isCritical: false, status: 'PENDING' },
            ];
        }

        await prisma.requirement.createMany({
            data: newReqs.map(r => ({ ...r, routeId: route.id }))
        });
        
        res.json({ message: 'Ruta actualizada' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/upload', upload.single('document'), async (req, res) => {
    try {
        const { requirementId, sessionTime } = req.body;
        
        // Find or create a mock user
        let user = await prisma.user.findFirst();
        if (!user) {
            user = await prisma.user.create({
                data: { name: 'Viajero Test', email: 'test@salsinmiedo.com' }
            });
        }

        // Get a valid requirement if none provided
        let reqId = requirementId;
        if (!reqId) {
            const firstReq = await prisma.requirement.findFirst();
            if (firstReq) reqId = firstReq.id;
        }

        if (!reqId) {
             return res.status(400).json({ error: 'No requirement ID available to link the document' });
        }

        const doc = await prisma.document.create({
            data: {
                userId: user.id,
                requirementId: reqId,
                fileUrl: `/uploads/${req.file.filename}`
            }
        });
        
        // Update the requirement status to VALIDATED
        await prisma.requirement.update({
            where: { id: reqId },
            data: { status: 'VALIDATED' }
        });
        
        console.log(`[Metric] User session time upon upload: ${sessionTime}s`);
        
        res.json({ message: 'Documento analizado y subido con éxito', document: doc, sessionTime });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// Serve static files safely
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/uploads', express.static(uploadDir));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/app.js', (req, res) => res.sendFile(path.join(__dirname, 'app.js')));
app.get('/styles.css', (req, res) => res.sendFile(path.join(__dirname, 'styles.css')));

app.listen(port, () => {
  console.log(`Sal Sin Miedo server running on port ${port}`);
});

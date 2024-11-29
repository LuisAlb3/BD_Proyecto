const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');  // Para manejar las rutas de archivos estáticos

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos desde la raíz del proyecto (donde está index.html)
app.use(express.static(path.join(__dirname)));

// Cadena de conexión a MongoDB Atlas (reemplaza <db_password> con tu contraseña)
const uri = "mongodb+srv://luis:luis1234@cluster0.szyc1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

// Crea un cliente de MongoDB con la configuración de la API estable
const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    tlsAllowInvalidCertificates: false,  // Asegura certificados válidos
    tlsAllowInvalidHostnames: false,     // Valida el hostname
  });

client.connect()
    .then(() => {
        console.log('Conexión a MongoDB exitosa');
        const db = client.db('inventario');  // Nombre de la base de datos
        const productosCollection = db.collection('productos');  // Colección de productos

        // Ruta para la raíz (/), donde servirás el archivo index.html
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'index.html'));  // Sirve el archivo index.html
        });

        // Ruta para obtener todos los productos desde MongoDB
        app.get('/inventario', async (req, res) => {
            try {
                const productos = await productosCollection.find({}).toArray();  // Obtener productos
                res.json(productos);  // Responder con los productos
            } catch (error) {
                console.log('Error al obtener productos:', error);
                res.status(500).json({ error: 'Error al obtener productos' });
            }
        });

    })
    .catch((error) => {
        console.log('Error al conectar a MongoDB:', error);
    });

// Configurar el puerto para escuchar solicitudes
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

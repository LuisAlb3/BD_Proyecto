const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Reemplaza con tu cadena de conexión a MongoDB Atlas
const url = 'mongodb+srv://luis:miContraseña123@cluster0.mongodb.net/inventario?retryWrites=true&w=majority';

const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect()
    .then(() => {
        console.log('Conexión a MongoDB exitosa');
        const db = client.db('inventario');  // Nombre de la base de datos
        const productosCollection = db.collection('productos');  // Colección de productos

        // Definir la ruta para obtener todos los productos
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

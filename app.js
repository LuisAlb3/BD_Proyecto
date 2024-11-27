const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');

// Configuración de la aplicación
const app = express();
const PORT = 5000;
app.use(bodyParser.json());
app.use(cors());

// Conexión a MongoDB
const url = 'mongodb://localhost:27017';
const dbName = 'inventario';
let db, productosCollection;

MongoClient.connect(url, { useUnifiedTopology: true })
    .then(client => {
        console.log('Conectado a MongoDB');
        db = client.db(dbName);
        productosCollection = db.collection('productos');
    })
    .catch(err => console.error(err));

// Obtener todos los productos
app.get('/inventario', async (req, res) => {
    try {
        const productos = await productosCollection.find({}, { projection: { _id: 0 } }).toArray();
        res.status(200).json(productos);
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
});

// Agregar un producto
app.post('/inventario', async (req, res) => {
    const { nombre, cantidad, precio } = req.body;

    if (nombre && cantidad && precio) {
        try {
            await productosCollection.insertOne({ nombre, cantidad, precio });
            res.status(201).json({ mensaje: 'Producto agregado con éxito' });
        } catch (err) {
            res.status(500).json({ error: 'Error al agregar producto' });
        }
    } else {
        res.status(400).json({ error: 'Datos inválidos' });
    }
});

// Eliminar un producto
app.delete('/inventario/:nombre', async (req, res) => {
    const { nombre } = req.params;

    try {
        const result = await productosCollection.deleteOne({ nombre });
        if (result.deletedCount > 0) {
            res.status(200).json({ mensaje: 'Producto eliminado con éxito' });
        } else {
            res.status(404).json({ error: 'Producto no encontrado' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar producto' });
    }
});

// Actualizar un producto
app.put('/inventario/:nombre', async (req, res) => {
    const { nombre } = req.params;
    const { cantidad } = req.body;

    if (cantidad) {
        try {
            const result = await productosCollection.updateOne(
                { nombre },
                { $set: { cantidad } }
            );
            if (result.matchedCount > 0) {
                res.status(200).json({ mensaje: 'Producto actualizado con éxito' });
            } else {
                res.status(404).json({ error: 'Producto no encontrado' });
            }
        } catch (err) {
            res.status(500).json({ error: 'Error al actualizar producto' });
        }
    } else {
        res.status(400).json({ error: 'Datos inválidos' });
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

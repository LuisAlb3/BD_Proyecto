const express = require('express');
const { MongoClient } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json()); // Para procesar solicitudes JSON

// Servir archivos estáticos desde la raíz del proyecto
app.use(express.static(path.join(__dirname)));

// Conectar a MongoDB
const uri = "mongodb+srv://luis:luis1234@cluster0.szyc1.mongodb.net/inventario?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect()
    .then(() => {
        const db = client.db('inventario');
        const productosCollection = db.collection('productos');

        // Ruta para agregar un producto
        app.post('/inventario', async (req, res) => {
            const { nombre, cantidad, precio } = req.body;
            if (!nombre || !cantidad || !precio) {
                return res.status(400).json({ error: 'Faltan datos en la solicitud' });
            }

            try {
                const producto = { nombre, cantidad, precio };
                const result = await productosCollection.insertOne(producto);
                res.status(201).json({ message: 'Producto agregado con éxito', producto: result.ops[0] });
            } catch (error) {
                console.error('Error al agregar producto:', error);
                res.status(500).json({ error: 'Error al agregar el producto' });
            }
        });

        // Ruta para obtener todos los productos
        app.get('/inventario', async (req, res) => {
            try {
                const productos = await productosCollection.find({}).toArray();
                res.status(200).json(productos);
            } catch (error) {
                console.error('Error al obtener productos:', error);
                res.status(500).json({ error: 'Error al obtener productos' });
            }
        });

        // Ruta para actualizar un producto
        app.put('/inventario/:nombre', async (req, res) => {
            const { nombre } = req.params;
            const { cantidad } = req.body;

            try {
                const result = await productosCollection.updateOne(
                    { nombre },
                    { $set: { cantidad } }
                );

                if (result.modifiedCount > 0) {
                    res.status(200).json({ message: 'Producto actualizado con éxito' });
                } else {
                    res.status(404).json({ message: 'Producto no encontrado' });
                }
            } catch (error) {
                console.error('Error al actualizar producto:', error);
                res.status(500).json({ error: 'Error al actualizar el producto' });
            }
        });

        // Ruta para eliminar un producto
        app.delete('/inventario/:nombre', async (req, res) => {
            const { nombre } = req.params;

            try {
                const result = await productosCollection.deleteOne({ nombre });

                if (result.deletedCount > 0) {
                    res.status(200).json({ message: 'Producto eliminado con éxito' });
                } else {
                    res.status(404).json({ message: 'Producto no encontrado' });
                }
            } catch (error) {
                console.error('Error al eliminar producto:', error);
                res.status(500).json({ error: 'Error al eliminar el producto' });
            }
        });

        // Escuchar en el puerto
        app.listen(port, () => {
            console.log(`Servidor corriendo en http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.error('Error al conectar a MongoDB:', error);
    });

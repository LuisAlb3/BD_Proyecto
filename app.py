from flask import Flask, jsonify, request
from pymongo import MongoClient
from flask_cors import CORS  # Importar la extensión CORS

# Inicializar Flask
app = Flask(__name__)

# Habilitar CORS para todas las rutas
CORS(app)

# Conectar a MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['inventario']
productos_collection = db['productos']

# Ruta para obtener todos los productos (GET)
@app.route('/inventario', methods=['GET'])
def obtener_productos():
    productos = list(productos_collection.find({}, {'_id': 0}))  # Ignorar el campo _id
    return jsonify(productos), 200

# Ruta para agregar un nuevo producto (POST)
@app.route('/inventario', methods=['POST'])
def agregar_producto():
    nuevo_producto = request.get_json()
    nombre = nuevo_producto.get('nombre')
    cantidad = nuevo_producto.get('cantidad')
    precio = nuevo_producto.get('precio')

    if nombre and cantidad and precio:
        productos_collection.insert_one(nuevo_producto)
        return jsonify({"mensaje": "Producto agregado con éxito"}), 201
    else:
        return jsonify({"error": "Datos inválidos"}), 400

# Ruta para eliminar un producto (DELETE)
@app.route('/inventario/<nombre>', methods=['DELETE'])
def eliminar_producto(nombre):
    result = productos_collection.delete_one({"nombre": nombre})
    if result.deleted_count > 0:
        return jsonify({"mensaje": "Producto eliminado con éxito"}), 200
    else:
        return jsonify({"error": "Producto no encontrado"}), 404

# Ruta para actualizar un producto (PUT)
@app.route('/inventario/<nombre>', methods=['PUT'])
def actualizar_producto(nombre):
    nuevo_dato = request.get_json()
    nueva_cantidad = nuevo_dato.get('cantidad')

    if nueva_cantidad:
        result = productos_collection.update_one(
            {"nombre": nombre},
            {"$set": {"cantidad": nueva_cantidad}}
        )
        if result.matched_count > 0:
            return jsonify({"mensaje": "Producto actualizado con éxito"}), 200
        else:
            return jsonify({"error": "Producto no encontrado"}), 404
    else:
        return jsonify({"error": "Datos inválidos"}), 400

if __name__ == '__main__':
    app.run(debug=True)

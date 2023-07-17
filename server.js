const express = require("express");
const { connectToDB, disconnectFromMongoDB } = require("./src/mongodb");
const app = express();
const PORT = process.env.PORT || 3000;
const DATABASE = process.env.MONGODB_DATABASE;
const COLLECTION = process.env.MONGODB_COLLECTION;

app.use(express.json());

// Middleware para establecer el encabezado Content-Type en las respuestas
app.use((req, res, next) => {
  res.header("Content-Type", "application/json; charset=utf-8");
  next();
});

// Ruta de inicio
app.get("/", (req, res) => {
  res.status(200).end("Bienvenido a la API de Supermercado");
});

// Ruta para obtener todos los artículos de supermercado
app.get("/articulos", async (req, res) => {
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de artículos y convertir los documentos a un array
    const db = client.db(DATABASE);
    const articulos = await db.collection(COLLECTION).find().toArray();
    res.json(articulos);
  } catch (error) {
    // Manejo de errores al obtener las frutas
    res.status(500).send("Error al obtener los artículos de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para obtener un artículo por su ID
app.get("/articulo/:id", async (req, res) => {
  const articuloID = parseInt(req.params.id);

  if (isNaN(articuloID)){
    res.status(404).send("Código de Artículo invalido");
    return;
  }

  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de artículos y buscar el artículo por su ID
    const db = client.db(DATABASE);
    const articulo = await db.collection(COLLECTION).findOne({ codigo: articuloID });
    if (articulo) {
      res.json(articulo);
    } else {
      res.status(404).send("Artículo no encontrado");
    }
  } catch (error) {
    // Manejo de errores al obtener el artículo
    res.status(500).send("Error al obtener el artículo de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para obtener un artículo por su nombre
app.get("/articulo/nombre/:nombre", async (req, res) => {
  const articuloQuery = req.params.nombre;
  let articuloNombre = RegExp(articuloQuery, "i");
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de artículos y buscar el artículo por su Nombre
    const db = client.db(DATABASE);
    const articulo = await db
      .collection(COLLECTION)
      .find({ nombre: articuloNombre })
      .toArray();
    
    if (articulo.length > 0) {
      res.json(articulo);
    } else {
      res.status(404).send("Artículo no encontrado");
    }
  } catch (error) {
    // Manejo de errores al obtener el artículo
    res.status(500).send("Error al obtener el artículo de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para obtener un artículo por su categoría
app.get("/articulo/categoria/:categoria", async (req, res) => {
  const articuloQuery = req.params.categoria;
  let articuloCategoria = RegExp(articuloQuery, "i");
  try {
    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de artículos y buscar el artículo por su categoría
    const db = client.db(DATABASE);
    const articulo = await db
      .collection(COLLECTION)
      .find({ categoria: articuloCategoria })
      .toArray();
    
    if (articulo.length > 0) {
      res.json(articulo);
    } else {
      res.status(404).send("Artículo no encontrado");
    }
  } catch (error) {
    // Manejo de errores al obtener el artículo
    res.status(500).send("Error al obtener el artículo de la base de datos");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// // Ruta para obtener un artículo por su precio
// app.get("/articulo/precio/:precio", async (req, res) => {
//   const articuloPrecio = parseInt(req.params.precio);
//   try {
//     // Conexión a la base de datos
//     const client = await connectToDB();
//     if (!client) {
//       res.status(500).send("Error al conectarse a MongoDB");
//       return;
//     }

//     // Obtener la colección de artículos y buscar el artículo por su precio
//     const db = client.db(DATABASE);
//     const articulo = await db
//       .collection(COLLECTION)
//       .find({ precio: { $gte: articuloPrecio } })
//       .toArray();

//     if (articulo.length > 0) {
//       res.json(articulo);
//     } else {
//       res.status(404).send("Artículo no encontrado");
//     }
//   } catch (error) {
//     // Manejo de errores al obtener el artículo
//     res.status(500).send("Error al obtener el artículo de la base de datos");
//   } finally {
//     // Desconexión de la base de datos
//     await disconnectFromMongoDB();
//   }
// });

// Ruta para agregar un nuevo recurso
app.post("/articulo", async (req, res) => {
  const nuevoArticulo = req.body;
  try {
    if (nuevoArticulo === undefined) {
      res.status(400).send("Error en el formato de datos a crear.");
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
    }

    const db = client.db(DATABASE);
    const collection = db.collection(COLLECTION);
    await collection.insertOne(nuevoArticulo);
    console.log("Nuevo artículo creado");
    res.status(201).send(nuevoArticulo);
  } catch (error) {
    // Manejo de errores al agregar el artículo
    res.status(500).send("Error al intentar agregar un nuevo artículo");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

//Ruta para modificar un recurso
app.put("/articulo/:id", async (req, res) => {
  const articuloID = parseInt(req.params.id);

  if (isNaN(articuloID)){
    res.status(404).send("Código de Artículo invalido");
    return;
  }

  const nuevosDatos = req.body;
  const nuevoPrecio = nuevosDatos.precio;

  try {
    if (!nuevosDatos) {
      res.status(400).send("Error en el formato de datos a crear.");
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
    }

    const db = client.db(DATABASE);
    const collection = db.collection(COLLECTION);

    await collection.updateOne({ codigo: articuloID }, { $set:{precio: nuevoPrecio }});

    console.log("Artículo Modificado");

    res.status(200).send(nuevosDatos);
  } catch (error) {
    // Manejo de errores al modificar el artículo
    res.status(500).send("Error al modificar el artículo");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Ruta para eliminar un recurso
app.delete("/articulo/:id", async (req, res) => {
  const articuloID = parseInt(req.params.id);

  if (isNaN(articuloID)){
    res.status(404).send("Código de Artículo invalido");
    return;
  }

  try {
    if (!articuloID) {
      res.status(400).send("Error en el formato de datos a crear.");
      return;
    }

    // Conexión a la base de datos
    const client = await connectToDB();
    if (!client) {
      res.status(500).send("Error al conectarse a MongoDB");
      return;
    }

    // Obtener la colección de artículos, buscar el artículo por su ID y eliminarlo
    const db = client.db(DATABASE);
    const collection = db.collection(COLLECTION);
    const resultado = await collection.deleteOne({ codigo: articuloID });
    if (resultado.deletedCount === 0) {
      res
        .status(404)
        .send("No se encontró ningun artículo con el id seleccionado.");
    } else {
      console.log("Artículo Eliminado");
      res.status(204).send();
    }
  } catch (error) {
    // Manejo de errores al obtener las frutas
    res.status(500).send("Error al eliminar el artículo");
  } finally {
    // Desconexión de la base de datos
    await disconnectFromMongoDB();
  }
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

firebase.initializeApp({
  apiKey: "AIzaSyB6TK0bHCk35TeAbe0BqMGHWLxfjfEdGbI",
  authDomain: "quizmaster-38a6b.firebaseapp.com",
  databaseURL: "https://quizmaster-38a6b-default-rtdb.firebaseio.com",
  projectId: "quizmaster-38a6b",
  storageBucket: "quizmaster-38a6b.appspot.com",
  messagingSenderId: "169546556534",
  appId: "1:169546556534:web:cc7dbfb16ccbf639e92b57",
  measurementId: "G-FQSP9SF6PM",
});

const preguntasCollection = firebase.firestore().collection("Preguntas");

async function obtenerPreguntasPorCategoriaYDificultad(categoria, dificultad) {
  const preguntas = [];

  await paginateQuery(
      preguntasCollection.where("Categoria", "==", categoria).where("Dificultad", "==", dificultad),
      (doc) => {
          preguntas.push(doc.data());
      }
  );

  return preguntas;
}

async function paginateQuery(query, callback) {
  let lastDoc = null;

  while (true) {
      let snapshot;

      if (lastDoc) {
          snapshot = await query.startAfter(lastDoc).limit(10).get();
      } else {
          snapshot = await query.limit(10).get();
      }

      if (snapshot.empty) {
          break;
      }

      snapshot.forEach((doc) => {
          callback(doc);
      });

      lastDoc = snapshot.docs[snapshot.docs.length - 1];
  }
}


async function obtenerCategorias() {
  const categoriasCollection = firebase.firestore().collection("Categorias");
  const categoriasSnapshot = await categoriasCollection.get();
  const categorias = [];
  categoriasSnapshot.forEach((doc) => {
    categorias.push(doc.data().nameCategory);
  });
  return categorias;
}

window.addEventListener("DOMContentLoaded", async () => {
  const preguntasTableBody = document.querySelector(".preguntas");
  const searchForm = document.getElementById("searchForm");

  searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const categoria = document.getElementById("buscadorCategoria").value.trim();
    const dificultad = document
      .getElementById("buscadorDificultad")
      .value.trim();

    const preguntas = await obtenerPreguntasPorCategoriaYDificultad(
      categoria,
      dificultad
    );
    actualizarTablaPreguntas(preguntas);
  });

  async function obtenerPreguntasPorCategoriaYDificultad(
    categoria,
    dificultad
  ) {
    const preguntasSnapshot = await preguntasCollection
      .where("Categoria", "==", categoria)
      .where("Dificultad", "==", dificultad)
      .get();
    const preguntas = [];
    preguntasSnapshot.forEach((doc) => {
      preguntas.push(doc.data());
    });
    return preguntas;
  }

  function actualizarTablaPreguntas(preguntas) {
    const preguntasTableBody = document.querySelector(".preguntas");

    // Limpiar la tabla
    preguntasTableBody.innerHTML = "";

    // Agregar las nuevas preguntas a la tabla
    preguntas.forEach((pregunta) => {
      const row = document.createElement("tr");
      row.innerHTML = `
            <td>${pregunta.Pregunta}</td>
            <td>${pregunta.Respuesta}</td>
            <td>${pregunta.Categoria}</td>
            <td>${pregunta.SubCategoria}</td>
            <td>${pregunta.Dificultad}</td>
            <td>
                <button class="btn btn-primary"  onclick="abrirModal('${pregunta.id}', '${pregunta.Pregunta}', '${pregunta.Respuesta}', '${pregunta.Categoria}', '${pregunta.SubCategoria}', '${pregunta.Dificultad}')">
                    <img src="/Control/img/editar.png" alt="Modificar" style="width: 20px; height: 20px;">
                </button>
                <button class="btn btn-danger" onclick="eliminarPregunta('${pregunta.Pregunta}', '${pregunta.Respuesta}', '${pregunta.Categoria}', '${pregunta.Dificultad}')">
                    <img src="/Control/img/eliminar.png" alt="Eliminar" style="width: 20px; height: 20px;">
                </button>
            </td>
        `;
      preguntasTableBody.appendChild(row);
    });
  }

  await mostrarPreguntasIniciales();
});

async function mostrarPreguntasIniciales() {
  const categoriasSelect = document.getElementById("buscadorCategoria");
  categoriasSelect.innerHTML =
    "<option selected>Selecciona una categoría...</option>";
  try {
    const categorias = await obtenerCategorias();
    categorias.forEach((categoria) => {
      const option = document.createElement("option");
      option.textContent = categoria;
      categoriasSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error al obtener categorías: ", error);
  }
}

async function eliminarPregunta(pregunta, respuesta, categoria, dificultad) {
  try {
    const querySnapshot = await preguntasCollection
      .where("Pregunta", "==", pregunta)
      .where("Respuesta", "==", respuesta)
      .where("Categoria", "==", categoria)
      .where("Dificultad", "==", dificultad)
      .get();

    querySnapshot.forEach(async (doc) => {
      await preguntasCollection.doc(doc.id).delete();
      alert("Pregunta eliminada correctamente");
      await mostrarPreguntasIniciales();
    });
  } catch (error) {
    console.error("Error al eliminar la pregunta:", error);
  }
}

function abrirModal(
  id,
  pregunta,
  respuesta,
  categoria,
  subcategoria,
  dificultad
) {
  const modal = document.getElementById("modalModificar");
  const preguntaInput = document.getElementById("preguntaInput");
  const respuestaInput = document.getElementById("respuestaInput");
  const categoriaInput = document.getElementById("categoriaInput");
  const subcategoriaInput = document.getElementById("subcategoriaInput");
  const dificultadInput = document.getElementById("dificultadInput");
  preguntaInput.value = pregunta;
  respuestaInput.value = respuesta;
  categoriaInput.value = categoria;
  subcategoriaInput.value = subcategoria;
  dificultadInput.value = dificultad;
  buscarDocumentoPorPreguntaYRespuesta(pregunta, respuesta)
    .then((documentoEncontrado) => {
      if (documentoEncontrado) {
        const { id } = documentoEncontrado;
        const formModificar = document.getElementById("formModificar");
        formModificar.dataset.id = id;
      } else {
        console.log(
          "No se encontró ningún documento con la pregunta y respuesta proporcionadas."
        );
      }
    })
    .catch((error) => {
      console.error("Error al buscar el documento:", error);
    });

  modal.style.display = "block";
}

function cerrarModal() {
  const modal = document.getElementById("modalModificar");
  modal.style.display = "none";
}
async function buscarDocumentoPorPreguntaYRespuesta(pregunta, respuesta) {
  try {
    const querySnapshot = await preguntasCollection
      .where("Pregunta", "==", pregunta)
      .where("Respuesta", "==", respuesta)
      .get();

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, data: doc.data() };
    } else {
      console.log(
        "No se encontró ningún documento con la pregunta y respuesta proporcionadas."
      );
      return null;
    }
  } catch (error) {
    console.error("Error al buscar el documento:", error);
    return null;
  }
}

async function guardarCambios(event) {
  event.preventDefault();

  const preguntaInput = document.getElementById("preguntaInput").value;
  const respuestaInput = document.getElementById("respuestaInput").value;
  const categoriaInput = document.getElementById("categoriaInput").value;
  const subcategoriaInput = document.getElementById("subcategoriaInput").value;
  const dificultadInput = document.getElementById("dificultadInput").value;

  const formModificar = document.getElementById("formModificar");
  const id = formModificar.dataset.id;

  try {
    await preguntasCollection.doc(id).update({
      Pregunta: preguntaInput,
      Respuesta: respuestaInput,
      Categoria: categoriaInput,
      SubCategoria: subcategoriaInput,
      Dificultad: dificultadInput,
    });
    alert("Pregunta modificada correctamente");
    cerrarModal();
    await mostrarPreguntasIniciales();
  } catch (error) {
    console.error("Error al modificar la pregunta:", error);
  }
}

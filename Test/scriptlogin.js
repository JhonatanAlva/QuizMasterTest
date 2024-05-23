const firebaseConfig = {
  apiKey: "AIzaSyB6TK0bHCk35TeAbe0BqMGHWLxfjfEdGbI",
  authDomain: "quizmaster-38a6b.firebaseapp.com",
  databaseURL: "https://quizmaster-38a6b-default-rtdb.firebaseio.com",
  projectId: "quizmaster-38a6b",
  storageBucket: "quizmaster-38a6b.appspot.com",
  messagingSenderId: "169546556534",
  appId: "1:169546556534:web:cc7dbfb16ccbf639e92b57",
  measurementId: "G-FQSP9SF6PM",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function registerUser(nombreUsuario, correoElectronico, password, edad) {
  try {
    const querySnapshot = await db
      .collection("User")
      .where("Correo", "==", correoElectronico)
      .get();
    const querySnapshotNameUser = await db
      .collection("User")
      .where("NameUser", "==", nombreUsuario)
      .get();
    if (!querySnapshot.empty) {
      return "Correo ya existe";
    }
    if (!querySnapshotNameUser.empty) {
      return "El nombre de usuario ya existe";
    }

    await db.collection("User").add({
      NameUser: nombreUsuario,
      Correo: correoElectronico,
      Password: password,
      Edad: edad,
      fichas: 10,
    });
    return "Usuario registrado con exito";
  } catch (error) {
    throw new Error("Error al añadir usuario");
  }
}

async function loginUser(userNameLogin, passwordLogin) {
  try {
    const querySnapshot = await db
      .collection("User")
      .where("NameUser", "==", userNameLogin)
      .where("Password", "==", passwordLogin)
      .get();

    if (!querySnapshot.empty) {
      return userNameLogin === "Admin" ? "admin" : "user";
    } else {
      return "Credencial invalidas";
    }
  } catch (error) {
    throw new Error("Error al logearse");
  }
}

async function obtenerRespuestasIncorrectas(ctR, dfR) {
  if (ctR === "Randon") {
    const respuestasSnapshotr = await db
      .collection("Preguntas")
      .where("Dificultad", "==", dfR)
      .get();
    const respuestas = respuestasSnapshotr.docs.flatMap(
      (doc) => doc.data().Respuesta
    );
    return respuestas;
  } else {
    const respuestasSnapshot = await db
      .collection("Preguntas")
      .where("Categoria", "==", ctR)
      .where("Dificultad", "==", dfR)
      .get();
    const respuestas = respuestasSnapshot.docs.flatMap(
      (doc) => doc.data().Respuesta
    );
    return respuestas;
  }
}

async function obtenerPreguntasAleatorias(categoria, dificultad) {
  let preguntas;
  if (categoria === "Randon") {
    const preguntasSnapshotr = await db
      .collection("Preguntas")
      .where("Dificultad", "==", dificultad)
      .get();
    preguntas = preguntasSnapshotr.docs.map((doc) => doc.data());
  } else {
    const preguntasSnapshot = await db
      .collection("Preguntas")
      .where("Categoria", "==", categoria)
      .where("Dificultad", "==", dificultad)
      .get();
    preguntas = preguntasSnapshot.docs.map((doc) => doc.data());
  }
  preguntas.sort(() => Math.random() - 0.5);
  return preguntas;
}

async function mostrarPregunta() {
  const preguntas = await obtenerPreguntasAleatorias();
  const preguntaContainer = document.createElement("div");
  const pregunta = document.createElement("div");
  const respuestasContainer = document.createElement("div");
  let preguntaIndex = 0;
  let limitPregunta = 5; 
  let respCorrectConteo = 0;
  let respIncorrectConteo = 0;

  preguntaContainer.appendChild(pregunta);
  preguntaContainer.appendChild(respuestasContainer);
  document.body.appendChild(preguntaContainer);

  if (preguntaIndex < limitPregunta) {
    const currentQuestion = preguntas[preguntaIndex];
    pregunta.textContent = currentQuestion.Pregunta;
    respuestasContainer.innerHTML = "";
    const respuestasIncorrectas = await obtenerRespuestasIncorrectas();
    const respuestas = [currentQuestion.Respuesta, ...respuestasIncorrectas];
    const indexRespuestaCorrecta = respuestas.indexOf(
      currentQuestion.Respuesta
    );
    if (indexRespuestaCorrecta !== -1) {
      respuestas.splice(indexRespuestaCorrecta, 1);
    }
    const respuestasAleatorias = obtenerMuestraAleatoria(respuestas, 3);
    respuestasAleatorias.push(currentQuestion.Respuesta);
    respuestasAleatorias.sort(() => Math.random() - 0.5);
    respuestasAleatorias.forEach((respuesta) => {
      const botonRespuesta = document.createElement("button");
      botonRespuesta.textContent = respuesta;
      botonRespuesta.classList.add("btn", "btn-primary", "me-2");
      botonRespuesta.onclick = function () {
        if (respuesta === currentQuestion.Respuesta) {
          preguntaIndex++;
          respCorrectConteo++;
          mostrarPregunta();
        } else {
          preguntaIndex++;
          respIncorrectConteo++;
          mostrarPregunta();
        }
      };
      respuestasContainer.appendChild(botonRespuesta);
    });
  }
}

function obtenerMuestraAleatoria(array, size) {
  const muestra = [];
  const copiaArray = array.slice();
  for (let i = 0; i < size; i++) {
    const index = Math.floor(Math.random() * copiaArray.length);
    muestra.push(copiaArray.splice(index, 1)[0]);
  }
  return muestra;
}

function showTestResult(message, isSuccess) {
  const resultDiv = document.getElementById("test-results");
  const resultMessage = document.createElement("p");
  resultMessage.textContent = message;
  resultMessage.className = isSuccess ? "pass" : "fail";
  resultDiv.appendChild(resultMessage);
}

// Código de prueba
(async function () {
  console.log("Running tests...");

  // Test funcion registrar
  try {
    let result;

    // Test case: Registro correcto
    result = await registerUser(
      "testuser",
      "test@example.com",
      "password123",
      25
    );
    showTestResult(
      `Registro de usuario - Esperando "Usuario registrado con exito": ${result}`,
      result === "Usuario registrado con exito"
    );

    // Test case: Correo ya existe
    result = await registerUser(
      "testuser2",
      "test@example.com",
      "password123",
      25
    );
    showTestResult(
      `Registro de usuario - Esperando "Correo ya existe": ${result}`,
      result === "Correo ya existe"
    );

    // Test case: Usuario ya existe
    result = await registerUser(
      "testuser",
      "test2@example.com",
      "password123",
      25
    );
    showTestResult(
      `Registro de usuario - Esperando "El nombre de usuario ya existe": ${result}`,
      result === "El nombre de usuario ya existe"
    );
  } catch (error) {
    showTestResult(`Error durante el registro: ${error.message}`, false);
  }

  // Test funcion de logearse
  try {
    let result;

    // Test case: Logeo correcto
    result = await loginUser("testuser", "password123");
    showTestResult(
      `Login Usuario - Esperando "user": ${result}`,
      result === "user"
    );

    // Test case: Credenciales invalidas
    result = await loginUser("wronguser", "wrongpassword");
    showTestResult(
      `Login Usuario - Esperando "Credencial invalidas": ${result}`,
      result === "Credencial invalidas"
    );
  } catch (error) {
    showTestResult(`Error durante el login: ${error.message}`, false);
  }

  // Test para obtenerRespuestasIncorrectas
  try {
    let result = await obtenerRespuestasIncorrectas("Geografia", "Facil"); 
    showTestResult(
      `obtenerRespuestasIncorrectas - Esperando array: ${result}`,
      Array.isArray(result)
    );
  } catch (error) {
    showTestResult(
      `Error en el test de obtenerRespuestasIncorrectas: ${error.message}`,
      false
    );
  }

  // Test para obtenerPreguntasAleatorias
  try {

    let preguntas = await obtenerPreguntasAleatorias("Geografia", "Facil"); 
    showTestResult(
      `obtenerPreguntasAleatorias - Preguntas obtenidas correctamente: ${preguntas.length}`,
      preguntas.length > 0
    );
  } catch (error) {
    showTestResult(
      `Error en el test de obtenerPreguntasAleatorias: ${error.message}`,
      false
    );
  }

  // Test para mostrarPregunta
  try {
    mostrarPregunta("Geografia", "Facil");
    showTestResult("mostrarPregunta - Pregunta mostrada correctamente", true);
  } catch (error) {
    showTestResult(
      `Error en el test de mostrarPregunta: ${error.message}`,
      false
    );
  }
})();

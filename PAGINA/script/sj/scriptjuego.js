firebase.initializeApp({
  apiKey: "AIzaSyB6TK0bHCk35TeAbe0BqMGHWLxfjfEdGbI",
  authDomain: "quizmaster-38a6b.firebaseapp.com",
  databaseURL: "https://quizmaster-38a6b-default-rtdb.firebaseio.com",
  projectId: "quizmaster-38a6b",
  storageBucket: "quizmaster-38a6b.appspot.com",
  messagingSenderId: "169546556534",
  appId: "1:169546556534:web:cc7dbfb16ccbf639e92b57",
  measurementId: "G-FQSP9SF6PM"
});

const db = firebase.firestore();

let vidas = 4;

function actualizarVidas() {
  document.getElementById('vidas').textContent = vidas;
}

function finDelJuego() {
  alert('¡Fin del juego te quedaste sin vidas!');
  window.location.href = "/Lobby/index.html"; 
}

function respuestaCorrecta() {
  console.log('Respuesta correcta');
}

function respuestaIncorrecta() {
  vidas--;
  actualizarVidas();

  if (vidas === 0) {
    finDelJuego();
  }
}

function incrementarBarraDeProgreso() {
  const barraDeProgreso = document.getElementById('progress');
  let valorActual = parseInt(barraDeProgreso.getAttribute('value'));
  if(ctRan == "Randon"){
      valorActual +=  6.67;
      if (valorActual > 100) {
      valorActual = 100;
      }
  }else{
      valorActual += 20;
      if (valorActual > 100) {
        valorActual = 100;
      }
  }
  
  barraDeProgreso.setAttribute('value', valorActual);
}

function mostrarNombreUsuario(nombreUsuario) {
  document.getElementById("usuario").innerText = nombreUsuario;
}

var nombreUsuario = localStorage.getItem("nameUserLogi");

window.addEventListener("DOMContentLoaded", function () {
  mostrarNombreUsuario(nombreUsuario);
});

const preguntasCollection = db.collection("Preguntas");
let preguntas = [];
let preguntaIndex = 0;
let limitPregunta = 0;
const ctRan = localStorage.getItem("categoria");
if(ctRan == "Randon"){
    limitPregunta = 15;
}else{
    limitPregunta=5;
}

async function obtenerRespuestasIncorrectas(categoria) {
  const ctR = localStorage.getItem("categoria");
  const dfR = localStorage.getItem("dificultad");
  if(ctR == "Randon"){
      const respuestasSnapshotr = await preguntasCollection.where("Dificultad", "==", dfR)
                                                      .get();
      const respuestas = respuestasSnapshotr.docs.flatMap(doc => doc.data().Respuesta);
      return respuestas;
  }else{
      const respuestasSnapshot = await preguntasCollection.where("Categoria", "==", ctR)
                                                      .where("Dificultad", "==", dfR)
                                                      .get();
      const respuestas = respuestasSnapshot.docs.flatMap(doc => doc.data().Respuesta);
      return respuestas;
    }
}

async function obtenerPreguntasAleatorias() {
  const categoria = localStorage.getItem("categoria");
  const dificultad = localStorage.getItem("dificultad");
  if(categoria == "Randon"){
      console.log(categoria, dificultad);
      const preguntasSnapshotr = await preguntasCollection
          .where("Dificultad", "==", dificultad)
          .get(); 
      preguntas = preguntasSnapshotr.docs.map(doc => doc.data());
      preguntas.sort(() => Math.random() - 0.5);
      mostrarPregunta();
  }else{
  console.log(categoria, dificultad);
  const preguntasSnapshot = await preguntasCollection
      .where("Categoria", "==", categoria)
      .where("Dificultad", "==", dificultad)
      .get(); 
  preguntas = preguntasSnapshot.docs.map(doc => doc.data());
  preguntas.sort(() => Math.random() - 0.5);
  mostrarPregunta();
  }
}

let respCorrectConteo = 0;
let respIncorrectConteo = 0;

async function mostrarPregunta() {
  const preguntaContainer = document.getElementById('preguntaContainer');
  const pregunta = document.getElementById('pregunta');
  const respuestasContainer = document.getElementById('respuestas');

  if (preguntaIndex < limitPregunta) {
    const currentQuestion = preguntas[preguntaIndex];
    pregunta.textContent = currentQuestion.Pregunta;
    respuestasContainer.innerHTML = '';
    const respuestasIncorrectas = await obtenerRespuestasIncorrectas();
    const respuestas = [currentQuestion.Respuesta, ...respuestasIncorrectas];
    const indexRespuestaCorrecta = respuestas.indexOf(currentQuestion.Respuesta);
    if (indexRespuestaCorrecta !== -1) {
      respuestas.splice(indexRespuestaCorrecta, 1);
    }
    const respuestasAleatorias = obtenerMuestraAleatoria(respuestas, 3);
    respuestasAleatorias.push(currentQuestion.Respuesta);
    respuestasAleatorias.sort(() => Math.random() - 0.5);
    respuestasAleatorias.forEach(respuesta => {
      const botonRespuesta = document.createElement('button');
      botonRespuesta.textContent = respuesta;
      botonRespuesta.classList.add('btn', 'btn-primary', 'me-2');
      botonRespuesta.onclick = function () {
        if (respuesta === currentQuestion.Respuesta) {
          preguntaIndex++;
          respCorrectConteo++;
          respuestaCorrecta();
          mostrarPregunta();
          incrementarBarraDeProgreso();
        } else {
          preguntaIndex++;
          respIncorrectConteo++;
          respuestaIncorrecta();
          mostrarPregunta();
          incrementarBarraDeProgreso();
        }
      };
      respuestasContainer.appendChild(botonRespuesta);
    });

  } else {
    if (respCorrectConteo == 3) {
      const fichasTotal = 30;
      addFichas(fichasTotal);
    }
    if (respCorrectConteo > 3) {
      addFichas(50);
    }
    mostrarModal(respCorrectConteo, respIncorrectConteo);
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

window.addEventListener('DOMContentLoaded', async () => {
  await obtenerPreguntasAleatorias();
});

document.addEventListener("DOMContentLoaded", function () {
  const nombreUsuario = localStorage.getItem("nameUserLogi");
  const btnAddFichas = document.getElementById("add-fichas");

  btnAddFichas.addEventListener("click", function () {
    mostrarMensajeFlotante("Para conseguir más monedas, responde correctamente todas las preguntas ");
  });

  function mostrarMensajeFlotante(mensaje) {
    alert(mensaje);
  }
  const querySnapshotNameUser = db.collection("User")
    .where("NameUser", "==", nombreUsuario)
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        const fichas = userData.fichas;
        document.getElementById("fichas-cantidad").textContent = fichas;
      });
    })
    .catch((error) => {
      const errorFichas = 0;
      document.getElementById("fichas-cantidad").textContent = errorFichas;
    });
});

async function getUserData() {
  try {
    const nombreUsuario = localStorage.getItem("nameUserLogi");
    const querySnapshot = await db.collection("User").where("NameUser", "==", nombreUsuario).get();
    if (querySnapshot.empty) {
      throw new Error("Usuario no encontrado");
    }
    const userData = {};
    querySnapshot.forEach(doc => {
      userData.id = doc.id;
      Object.assign(userData, doc.data());
    });
    return userData;
  } catch (error) {
    console.error("Error al obtener datos del usuario: ", error);
    throw error;
  }
}

async function addFichas(fichasToAdd) {
  try {
    const nombreUsuario = localStorage.getItem("nameUserLogi");
    const userData = await getUserData(nombreUsuario);
    const updateFichas = userData.fichas + fichasToAdd;
    await db.collection("User").doc(userData.id).update({
      fichas: updateFichas
    });

    console.log("Fichas actualizadas con éxito para el usuario", nombreUsuario);
  } catch (error) {
    console.error("Error al agregar fichas: ", error);
    throw error;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("regresarLobby").addEventListener("click", async (event) => {
    event.preventDefault();
    try {
      window.location.href = "/Lobby/index.html";
    } catch (error) {
      console.error("Error al salir ", error);
      alert("Ocurrió un error al cerrar sesión");
    }
  });
  const audio = document.getElementById("audio");
    audio.play();
    const toggleButton = document.getElementById("toggleButton");
    const ico = document.getElementById("controller-aud");

    toggleButton.addEventListener("click", function () {
        if (audio.paused) {
        audio.play();
        ico.src = "/Lobby/img/volume-full-regular-24.png"
        } else {
        audio.pause();
        ico.src = "/Lobby/img/volume-mute-regular-24.png"
        }
    });
});
function mostrarModal(respCorrectConteo, respIncorrectConteo) {
  document.getElementById("correctas").textContent = respCorrectConteo;
  document.getElementById("incorrectas").textContent = respIncorrectConteo;
  document.getElementById("modal").style.display = "block";
}
document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("GAMEOVER").addEventListener("click", function() {
      document.getElementById("modal").style.display = "none";
      window.location.href = "/Lobby/index.html";
  });
  
  document.getElementById("cerrarModal").addEventListener("click", function() {
      document.getElementById("modal").style.display = "none";
      window.location.href = "/Lobby/index.html";
  });
});
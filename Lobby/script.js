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


document.addEventListener("DOMContentLoaded", function() {
  document.getElementById("regresarLobby").addEventListener("click", async (event) => {
      event.preventDefault();
      try {
          window.location.href = "/LoginQuiz/index.html";
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

    const nombreUsuario =  localStorage.getItem("nameUserLogi");
    const name = document.getElementById("name-player");
    name.textContent = nombreUsuario;


    const btnAddFichas = document.getElementById("add-fichas");

    btnAddFichas.addEventListener("click", function() {
    mostrarMensajeFlotante("Para conseguir más monedas, juega en las diferentes categorias ");
    });

    function mostrarMensajeFlotante(mensaje) {
        alert(mensaje)
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

document.addEventListener("DOMContentLoaded", function() {
    document.querySelectorAll(".boton").forEach(function(boton) {
        boton.addEventListener("click", function() {
            localStorage.setItem("categoria", this.id);
            document.getElementById("modal").style.display = "block";
        });
    });

    document.querySelectorAll(".dificultad").forEach(function(boton) {
        boton.addEventListener("click", function() {
            const categoria = localStorage.getItem("categoria");
            localStorage.setItem("dificultad", this.id);
            document.getElementById("modal").style.display = "none";
            window.location.href = "/PAGINA/preguntas.html";
        });
    });

    document.getElementById("cerrarModal").addEventListener("click", function() {
        document.getElementById("modal").style.display = "none";
    });
});




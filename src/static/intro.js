//======styles import======//
import "/src/styles/style.scss";

//======images import======//
import vs from "/src/images/vs.png";
import warrior1 from "/src/images/warrior1.png";
import warrior2 from "/src/images/warrior2.png";

//======socket.io======//
var socket = io();

//======DOM variables======//
const body = document.body;
const box = document.querySelector("#loginBox");
const logo = document.querySelector("h1");
const input = document.querySelector("input[type='text']");
const loginButton = document.querySelector("#loginButton");

//======dynamic variables======//
let currentOpacity = 0.8;
let currentHeight = 500;
let currentUser;
let currentOpponent;

//======asynchronous login function======//
async function login() {
  //======current interval======//
  let interval = null;

  //======disable button======//
  currentUser = input.value;
  loginButton.disabled = true;

  //======register user======//
  socket.emit("register user", input.value);

  //======collapse box's elements======//
  await new Promise((resolve) => {
    interval = setInterval(function () {
      if (currentOpacity > 0.0) {
        currentOpacity = (currentOpacity - 0.005).toFixed(3);
        logo.style.opacity = currentOpacity;
        input.style.opacity = currentOpacity;
        loginButton.style.opacity = currentOpacity;
      } else {
        logo.style.display = "none";
        input.style.display = "none";
        loginButton.style.display = "none";
        resolve("a");
        clearInterval(interval);
      }
    }, 20);
  });

  //======change box height dynamicly======//
  await new Promise((resolve) => {
    interval = setInterval(function () {
      if (currentHeight > 200) {
        currentHeight = currentHeight - 5;
        box.style.height = `${currentHeight}px`;
      } else {
        resolve("a");
        clearInterval(interval);
      }
    }, 20);
  });

  //======change flex settings======//
  box.style.flexDirection = "row";
  box.style.justifyContent = "space-around";

  //======delete all body's children======//
  body.innerHTML = "";

  //======warrior on left======//
  let img = document.createElement("img");
  img.src = warrior1;
  img.id = "warrior1";
  body.appendChild(img);

  //======add main box again======//
  body.appendChild(box);

  //======warrior on right======//
  img = document.createElement("img");
  img.src = warrior2;
  img.id = "warrior2";
  body.appendChild(img);

  //======player's nickname======//
  let h2 = document.createElement("h2");
  h2.id = "playerNick";
  h2.textContent = input.value || "GUEST";
  box.appendChild(h2);

  //======versus image======//
  img = document.createElement("img");
  img.src = vs;
  img.classList.add("vs");
  box.appendChild(img);

  //======opponent's nickname======//
  h2 = document.createElement("h2");
  h2.id = "opponentNick";
  h2.textContent = "NONE";
  box.appendChild(h2);
}

//======adding button's onclick listener======//
loginButton.addEventListener("click", login);
socket.on("users", function (users) {
  console.log(users);
});

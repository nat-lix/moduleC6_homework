const btnSend = document.querySelector(".j-btn-send");
const btnGeo = document.querySelector(".j-btn-geo");
const messageField = document.querySelector(".message-hist");
const inputTxt = document.querySelector(".j-txt");
const wsUri = "wss://echo-ws-service.herokuapp.com";
let websocket = new WebSocket(wsUri);

websocket.onopen = function(evt) {
    console.log("CONNECTED");
    inputTxt.disabled = false;
    btnSend.disabled = false;
    btnGeo.disabled = false;
    inputTxt.focus();
    inputTxt.placeholder="Здесь вводится текст сообщения";
};

websocket.onclose = function(evt) {
    console.log("DISCONNECTED");
    inputTxt.disabled = true;
    btnSend.disabled = true;
    btnGeo.disabled = true;
    inputTxt.placeholder="Нет подключения";
};

websocket.onerror = function(evt) {
    console.log("CONNECTION ERROR! ");
};

websocket.onmessage = function(evt) {
    if (IsJsonString(evt.data) != true) {
        console.log(evt.data);
        writeToScreen(evt.data, false); 
    } else {
        console.log(evt.data);
    }
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function writeToScreen(message, client) {
    let newDiv = document.createElement('div');
    newDiv.classList.add("message-wrap");
    newDiv.innerHTML = `
        <div class="message-txt">
            <p>${message}</p>
        </div>
    `;
    if (!client) {
        newDiv.style.justifyContent = 'flex-start';
    } else {
        newDiv.style.justifyContent = 'flex-end';
    }
    messageField.insertAdjacentElement("beforeend",newDiv);
    let topPos = newDiv.offsetTop;
    messageField.scrollTop = topPos;
}

btnSend.addEventListener('click', () => {
    let text = inputTxt.value;
    if (text != false) {
        writeToScreen(text, true); 
        websocket.send(text);
        inputTxt.value = '';
        inputTxt.focus();
    }
});

const error = () => {
    writeToScreen("Невозможно определить местоположение", true);
}

const success = (position) => {
    const latitude  = position.coords.latitude;
    const longitude = position.coords.longitude;
    let text = `<a  href="https://www.openstreetmap.org/#map=18/${latitude}/${longitude}" target="_blank">Гео-локация</a>`
    writeToScreen(text, true); 
    let coordOnerver = {
        'latitude': latitude,
        'longitude': longitude,
    }
    websocket.send(JSON.stringify(coordOnerver));
}

btnGeo.addEventListener('click', () => {
    if (!navigator.geolocation) {
        text = "Геолокация не поддерживается вашим браузером";
    } else {
        navigator.geolocation.getCurrentPosition(success, error);
    }
});


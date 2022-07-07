let port = testPort;
if (produccion==true) {
    port = 80;
}

// El primer canvas es la pizarra, el segundo el fondo.
const canvas = document.getElementById("pizarra");
const background = document.getElementById("background");
const ctx = canvas.getContext('2d');
const ctxbg = background.getContext('2d');
const memCanvas =  document.createElement('canvas');
const memCtx = memCanvas.getContext('2d');


// valor tomado como referencia para posteriormente calcular el grosor de la línea.
const defaultDiag = Math.sqrt(Math.pow(1280,2)+Math.pow(720,2));

// la diagonal de la imagen actual. Por defecto null ya que no hay imagen.
let currentDiag = null;
// menor tamaño de imagen permitido dada por su relación aspecto. Viene dada por el 
// tamaño de imagen que no se puede empequeñecer más ya que de hacerlo la línea sería
// menor a un píxel.
let minw;
let minh;

// Última posición conocida
let pos = { x: 0, y: 0 };

// Listener asociados con la interacción con la pizarra.
// Para escritorio.
let eraser = false;

canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mousedown', setPosition);
canvas.addEventListener('mouseenter', setPosition);
canvas.addEventListener('mouseup', saveState);
canvas.addEventListener('touchend', saveState);

// Para táctil.
canvas.addEventListener('touchstart',(e) => {
    e.preventDefault();
    setPosition(e.touches[0]);
});

canvas.addEventListener('touchmove',(e) => {
    e.preventDefault();
    draw(e.touches[0],false);
});

$("#borrarbtn").on('click', () => {
    if (!eraser) {
        $("#pizarra").css('cursor', 'url("/icons/cursor-eraser.png") 6 6,auto');
    } else {
        $("#pizarra").css('cursor', 'url("/icons/cursor-pencil.png") 0 11.99,auto');
    }
    eraser = !eraser;
});

// Calcula la posición del ratón o pulsado (táctil) y la guarda en la variable global pos.
function setPosition(e) {
    const offsetParent = canvas.offsetParent;
    pos.x = e.pageX - offsetParent.offsetLeft;
    pos.y = e.pageY - offsetParent.offsetTop;
}

// Si se dan las condiciones, pinta en el lugar que marca la variable global pos. 
// Si desktop es true, tiene que darse que se esté pulsado el click izquierdo.
function draw(e, desktop = true) {
  // Botón izquierdo ha de ser pulsado si estamos en desktop
  
  if (canvas.classList.contains('disabled')) {return}
  if (e.buttons !== 1 && desktop) return;

  ctx.beginPath(); 
  const lineWidth = Math.max(currentDiag/defaultDiag  * 4,1);
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  let strokeStyle = '#000000';

  ctx.globalCompositeOperation = "source-over"; 

  if (eraser) {
    ctx.globalCompositeOperation = "destination-out";  
    strokeStyle = "rgba(255,255,255,1)";
    ctx.lineWidth = 10;
  }
  
  ctx.strokeStyle = strokeStyle;

  ctx.moveTo(pos.x, pos.y); // desde
  setPosition(e);
  ctx.lineTo(pos.x, pos.y); // hasta

  ctx.stroke(); // pintar
}

// almacenamos estado para recuperarlo tras resize
function saveState() {
    memCanvas.width = canvas.width;
    memCanvas.height = canvas.height;
    memCtx.drawImage(canvas, 0, 0);
}

function disable() {
    if (!canvas.classList.contains("disabled")) {
        canvas.classList.add("disabled");
        document.getElementById("clearbtn").disabled = true;
        document.getElementById("borrarbtn").disabled = true;
        document.getElementById("uploadsketch").disabled = true;
    
        document.getElementById("loading").style.display = 'inline';
    }
}

function enable() { 
    canvas.classList.remove("disabled");
    document.getElementById("clearbtn").disabled = false;
    document.getElementById("borrarbtn").disabled = false;
    document.getElementById("uploadsketch").disabled = false;
    document.getElementById("loading").style.display = 'none';
}

//image size que se mostrará como máximo
let shownHeight = ($(window).height()*0.7);
let shownWidth =  ($(window).width()*0.7)/2;

//var global image vars 
let img;
let width;
let height;
let opacity = 0;
let nombre;
let especie;

//Real image size
let imgWidth = null;
let imgHeight = null;


const imgtodraw = document.getElementById("img-to-draw");

//function start
const next = async() => {
    //deshabilitamos la pizarra y opciones
    disable();
    const url = `http://${window.location.hostname}:${port}/plantas/api/images`;
    const resp = await fetch(url+'/next');

    if (!resp) {
        document.querySelector(".board").remove();
        document.querySelector("#infoContainer").remove();
        return errorServidor();
    }

    if (resp.statusText === "No Content") {
        document.querySelector(".board").remove();
        document.querySelector("#infoContainer").remove();
        return noImagenes();
    } 

    if (resp.status != 200) {
        document.querySelector(".board").remove();
        document.querySelector("#infoContainer").remove();
        return errorServidor();
    }
    
    const res = await resp.json();
    
    allOK();
    especie = res.especie;
    nombre = res.nombre;

    setTreeInfo();
    setBackground(`${url}/${especie}/${nombre}`);
}

const setTreeInfo = () => {
    document.getElementById("nombreT").innerHTML = nombre;
    document.getElementById("especieT").innerHTML = especie;
}

const setBackground = (urlImg) => { 
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    img = new Image();
    img.onload = function() {
        imgWidth = this.width;
        imgHeight = this.height;

        // Dada la diagonal de referencia se calcula que tamaño de imagen es el mínimo para que la línea pintada
        // no sea menor a un píxel.
        minw = (Math.sqrt(((1/16)*defaultDiag*defaultDiag)/(1+Math.pow(imgHeight/imgWidth,2)))).toFixed();
        minh = ((minw*imgHeight) / imgWidth).toFixed();
        
        imgtodraw.onload = function() {
            resizeEvent();
            // habilitamos la pizarra de nuevo
            enable();
        }
        imgtodraw.src = urlImg;
        
    }
    img.src = urlImg;
}  

const checkOrientation = (verticalForced=false) => {
    let portrait = false;

    if (2*width+20 > $(window).width()) {
        portrait = false;
    } else {
        portrait = true;
    }

    if (!portrait || verticalForced) {
        $("#op-selector").hide();
        $("#op-selector2").show();

        $("#img-wrapper").css({
            "display": "block",
            "flex-direction": ""
        });
    } else {
        $("#op-selector").show();
        $("#op-selector2").hide();

        
        $("#img-wrapper").css({
            "display": "flex",
            "flex-direction": "row"
        });
    }
}

const resizeEvent = () => {
    let w = imgtodraw.width;
    let h = imgtodraw.height;
    const wh = $(window).height();
    const ww = $(window).width();

    const prop = imgHeight/imgWidth;
    // caso movil
    if (ww < wh) {
        portraitMode(false);
        h = Math.max(wh * 0.9,minh);
        w = (1/prop)*h;
        if (w > ww*0.95) {
            w = Math.max(ww*0.95,minw);
            h = prop*w;
        }
        document.getElementById("buttonsContainer").style.maxWidth = `${w}px`;

    // caso pc
    } else {
        portraitMode(true);
        w = (ww/2) * 0.8
        h = w*prop

        if (h > wh*0.8) {
            h = Math.max(wh*0.8,minh);
            w = (1/prop)*h;
        }
        document.getElementById("buttonsContainer").style.maxWidth = "";

        //vamos al caso movil
        if ( w < minw || h < minh ) {
            portraitMode(false);
            h = Math.max(wh * 0.9,minh);
            w = (1/prop)*h;
            if (w*0.95 > ww) {
                w = Math.max(ww*0.95,minw);
                h = prop*w;
            }
            document.getElementById("buttonsContainer").style.maxWidth = `${w}px`;
        }
    }
    resize(w,h);
}

const resize = (w,h) => {
    imgtodraw.width = w;
    imgtodraw.height = h;
    
    // cargar la imagen en el canvas
    setImageCanvas(opacity);
}

function portraitMode(enabled = true) {
    if (enabled) {
        $("#op-selector").show();
        $("#op-selector2").hide();

        
        $("#img-wrapper").css({
            "display": "flex",
            "flex-direction": "row"
        });
    } else {
        $("#op-selector").hide();
        $("#op-selector2").show();

        $("#img-wrapper").css({
            "display": "block",
            "flex-direction": ""
        });
    }
}



const getSketch = async() => {
    // limpiamos la memoria
    memCtx.clearRect(0, 0, memCanvas.width, memCanvas.height);
    // Esta es la url de la imagen que se ha de enviar al servidor. Ahora bien, tenemos que
    // redimensionar el boceto al tamaño de la imagen original. Para ello...
    disable();
    let sketch = getDraw();
   
    img = new Image()
    img.onload = async() => {
        // canvas cuya única utilidad será la de poder obtener el boceto, con la resolución de la imagen
        // original.
        let canvas2 = document.createElement('canvas');
        canvas2.width = imgWidth;
        canvas2.height = imgHeight;
        
        canvas2.getContext('2d').drawImage(img, 0, 0, imgWidth, imgHeight);
        let imgUrl = canvas2.toDataURL();

        const url = `http://${window.location.hostname}:${port}/plantas/api/images/sketch/${especie}/${nombre}`;

        let formData = new FormData();

        await fetch(imgUrl)
        .then(res => res.blob())
        .then(blob => {
            const file = new File([blob], 'dot.png', blob);
            formData.append("image", file);
        });
        
        fetch(url,{
            method: 'POST',
            body: formData
        })
        .then( resp => {
            resp.json();
        })
        .then( res => {
            next();
        })
        .catch(err => {
            console.log(err.message);
            alert("Algo fue mal")
            next();
        });
        canvas2.remove();
        clear();     
    }
    img.src = sketch;
 
}

const clear = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const setImageCanvas = (op) => {
    canvas.height = imgtodraw.height;
    canvas.width = imgtodraw.width;
    background.height = imgtodraw.height;
    background.width = imgtodraw.width;

    currentDiag = Math.sqrt(Math.pow(imgtodraw.width,2)+Math.pow(imgtodraw.height,2));
    
    setOpacity(op);
    ctxbg.drawImage(imgtodraw,0,0,imgtodraw.width,imgtodraw.height);
    ctx.drawImage(memCanvas,0,0,imgtodraw.width,imgtodraw.height);
}

const setOpacity = (value) => {
    ctxbg.globalAlpha = value;
    opacity = value;
}

const changeOpacity = (value) => {
    background.height = imgtodraw.height;
    background.width = imgtodraw.width;
    
    setOpacity(value);
    ctxbg.drawImage(imgtodraw,0,0,imgtodraw.width,imgtodraw.height);
}

const getDraw = () => {
    let urlImg = canvas.toDataURL();
    return urlImg;
}


function noImagenes() {
    $("#statusOK").css("display","none");
    $("#statusBAD").css("display","none");
    $("#statusNOIMAGE").css("display","block");
    $("#uploadsketch").css("display","none");
}

function allOK() {
    $("#statusOK").css("display","block");
    $("#statusBAD").css("display","none");
    $("#statusNOIMAGE").css("display","none");
}

function errorServidor() {
    $("#statusOK").css("display","none");
    $("#statusBAD").css("display","block");
    $("#statusNOIMAGE").css("display","none");
    $("#uploadsketch").css("display","none");
}

$("#clearbtn").click(clear);
$("#skipbtn").click(next);
$("#uploadsketch").click(getSketch);

window.addEventListener("resize",resizeEvent);
next();

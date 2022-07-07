const input = document.querySelector('input');
const submitBTN = document.getElementById("submit");
const logoutBTN = document.querySelector("#logoutBTN");
const datasetBTN = document.querySelector('#datasetBTN');

const selector = document.getElementById("selector");
const selectorImg = document.getElementById("imagenes");

const borrarImagenBTN = document.getElementById("borrarImg");
const borrarSketchBTN = document.getElementById("borrarSketch");

let plantas;
let bocetos;
let bocetoEspecie = {};
let especies;

// Número máximo de imágenes a mostrar en el previsualizador.
const maxImgs = 30;

// Boceto seleccionado
let nombreBocetoSel;

const datos = async() => {
    fetch(`http://${window.location.hostname}:${port}/plantas/api/dataset/ficheros`)
        .then(res => {
            res.json().then((resp) =>{
                plantas = resp.Plantas;
                bocetos = resp.Bocetos;
                especies = resp.Especies;
                bocetos.forEach(sketch => {
                    if (bocetoEspecie[sketch.especie]) {
                        bocetoEspecie[sketch.especie].push(sketch.nombre)
                    } else {
                        bocetoEspecie[sketch.especie] = [sketch.nombre];
                    } 
                });

                actualizaEstadisticas();
                cargaVisualizador();
            })
        })
        .catch(err => console.log(err));
}

const actualizaEstadisticas = () => {
    const totalArboles = document.getElementById("totalArboles");
    const totalSketches = document.getElementById("totalSketches");
    const totalEspecies = document.getElementById("totalEspecies");

    totalArboles.innerHTML = totalArboles.innerHTML + plantas.length;
    totalSketches.innerHTML = totalSketches.innerHTML + bocetos.length;
    totalEspecies.innerHTML = totalEspecies.innerHTML + especies.length;
}


const mostrarSketches = (sketches,especie) => {
    const preview = document.getElementById("visualizadorSketches");
    while(preview.firstChild) {
        preview.removeChild(preview.firstChild);
    }

    const aviso = document.createElement('p');
    if (sketches.length == 0) {
        aviso.textContent = "No hay sketches para la imagen seleccionada.";
        preview.appendChild(aviso);
    } else {
        const contenedor = document.createElement('div');
        preview.appendChild(contenedor);

        for(const imagen of sketches) {
            const img = document.createElement('img');
            img.src = `http://${window.location.hostname}:${port}/plantas/api/images/sketch/${especie}/${imagen}`;
            img.addEventListener('click', function() {
                const seleccionada = document.querySelectorAll(".selected"); 
                if (seleccionada.length != 0) {
                    seleccionada[0].classList.remove("selected");
                }
                this.classList.add("selected");
                const url = this.src.split("/");
                nombreBocetoSel = url[url.length-1];
                borrarSketchBTN.innerHTML = `Borrar boceto: ${nombreBocetoSel}`;
            });
            contenedor.appendChild(img);
        }
    }
}

const cargaVisualizador = () => {
    especies.forEach( esp => {
        const opt = document.createElement("option");
        opt.value = esp;
        opt.innerHTML = esp;

        selector.appendChild(opt);
    });
}

const mostrarImagenesSeleccionadas = () => {
    const preview = document.querySelector('.preview');
    while(preview.firstChild) {
        preview.removeChild(preview.firstChild);
    }

    const imagenes = input.files;
    if(imagenes.length === 0) {
        const aviso = document.createElement('p');
        aviso.textContent = 'No hay ninguna imagen seleccionada.';
        preview.appendChild(aviso);
    } else {
        const contenedor = document.createElement('div');
        preview.appendChild(contenedor);

        let i = 1
        for(const imagen of imagenes) {
            if (i >= maxImgs) {
                break;
            }
            if(validFileType(imagen)) {
                i = i+1;
                const img = document.createElement('img');
                img.src = URL.createObjectURL(imagen);
                contenedor.appendChild(img);
            }
        }
    }
}

input.addEventListener('change', mostrarImagenesSeleccionadas);

const fileTypes = [
    "image/apng",
    "image/bmp",
    "image/jpeg",
    "image/pjpeg",
    "image/png",
    "image/tiff",
    "image/webp",
];

function validFileType(file) {
    return fileTypes.includes(file.type);
}

const subirImagenes = async() => {
    await hayToken(false);
    const token = localStorage.getItem('token');
    const url = `http://${window.location.hostname}:${port}/plantas/api/images`;
    const imagenes = input.files;
    
    let aSubir = [];
    if(imagenes.length === 0) {
        return alert("No hay imágenes seleccionadas")
    } else {
        document.querySelector("#submit").disabled = true; 
        
        for(const imagen of imagenes) {
            
            const relativePath = imagen.webkitRelativePath.split('/');

            const especie = relativePath[relativePath.length-2];
            const nombre = imagen.name;

            if(validFileType(imagen)) {
                let formData = new FormData();
                formData.append("image", imagen);
                aSubir.push(
                    fetch(`${url}/${especie}/${nombre}`,{
                        method: 'POST',
                        headers: {'token': token},
                        body: formData
                    })
                );
            }
        }
    }
    
    Promise.all(aSubir)
        .then((res) => {
            const preview = document.querySelector('.preview');
            while(preview.firstChild) {
                preview.removeChild(preview.firstChild);
            }

            const aviso = document.createElement('p');
            let subidas = 'Imágenes subidas: ';
            let noSubidas = 'Imágenes no subidas: ';

            res.forEach((response,i) => {
                if (response.status === 201) {
                    subidas+= ` ${i} `;
                } else {
                    noSubidas+= ` ${i} `;
                }
            })
            aviso.textContent = subidas + noSubidas;
            preview.appendChild(aviso);
            document.querySelector("#submit").disabled = false; 
        })
        .catch((err)=> {
            document.querySelector("#submit").disabled = false; 
            alert(err);
        });
}

const cerrarSesion = () => {
    localStorage.removeItem('token');
    document.location.href = "/";
}

const descargarDataset = () => {
    link = document.createElement('a')
    link.href = `http://${window.location.hostname}:${port}/plantas/api/dataset`;
    document.body.appendChild(link);
    link.click();
}

const borrarImagen = async() => {
    await hayToken(false);
    const nombre = selectorImg.value;
    const especie = selector.value;
    const token = localStorage.getItem('token');

    if (selectorImg.value==="") {
        alert("No hay foto seleccionada");
        return;
    }

    try {
        const resp = await fetch(`http://${window.location.hostname}:${port}/plantas/api/images/${especie}/${nombre}`, {
                        method: 'DELETE',
                        headers: {'token': token}
                    });

        const data = await resp.json();
        selectorImg.childNodes.forEach(opt => {
           
            if(opt.value===selectorImg.value) {
                selectorImg.removeChild(opt);
            }
        });
        borrarImagenBTN.innerHTML = "Borrar imagen";
    } catch (err) {
        console.log(err);
    } 
}

const borrarSketch = async() => {
    await hayToken(false);
    const especie = selector.value;
    const token = localStorage.getItem('token');

    const bocetoSel = document.querySelector(".selected");

    if (!bocetoSel) {
        alert("Selecciona un boceto");
        return;
    }

    try {   
        const resp = await fetch(`http://${window.location.hostname}:${port}/plantas/api/images/sketch/${especie}/${nombreBocetoSel}`, {
                        method: 'DELETE',
                        headers: {'token': token}
                    });

        const data = await resp.json();
        bocetoSel.remove();

        const preview = document.getElementById("visualizadorSketches");

        if(preview.children[0].childElementCount===0) {
            const p = document.createElement("p");
            p.innerHTML = "No hay sketches para la imagen seleccionada.";
            preview.append(p);
        }
        nombreBocetoSel = "";
        borrarSketchBTN.innerHTML = `Borrar boceto`;
    } catch (err) {
        console.log(err);
    } 
}


selector.addEventListener('change', (event) => {
    const especie = event.target.value;

    const imgs = document.getElementById("imagenes");
    imgs.querySelectorAll('*').forEach(n => n.remove());

    const fotosEspecie = fotosPorEspecie(especie);

    fotosEspecie.forEach(foto => {
        const opt = document.createElement("option");
        opt.value = foto;
        opt.innerHTML = foto;
        imgs.appendChild(opt);
    });
});

selectorImg.addEventListener('change', (event) => {
    const nombre = event.target.value;
    const especie = selector.value;

    const imgSel = document.getElementById("imgSeleccionada");
    imgSel.src = `http://${window.location.hostname}:${port}/plantas/api/images/${especie}/${nombre}`;
    const sketches = sketchesPorNombre(nombre,especie);
    mostrarSketches(sketches,especie);
    borrarImagenBTN.innerHTML = `Borrar imagen: ${nombre}`;
});

function fotosPorEspecie(esp) {
    return plantas.filter( p => p.especie==esp)
                  .map( p => p.nombre);
}

function sketchesPorNombre(name="", especie="") {
    let partesNombre = name.split(".");
    partesNombre.pop();
    let nombre = partesNombre.join('.');
    if (!bocetoEspecie[especie]) { return [] }

    return bocetoEspecie[especie].filter(p => {
        // primer split por formato
        let pant = '' + p;
        let partesNombre2 = p.split(".");
        partesNombre2.pop();
        p = partesNombre2.join('.');
        partesNombre2 = p.split("_");
        if(isNumeric(partesNombre2[partesNombre2.length-1]) && partesNombre2.length>1) {
            // si _ no forma parte del nombre 
            partesNombre2.pop();
        }
        p = partesNombre2.join('_');
        return p===nombre;
    });
}

datos();
function isNumeric(str) {
    if (typeof str != "string") return false 
    return !isNaN(str) && 
           !isNaN(parseFloat(str))
}

submitBTN.addEventListener('click',subirImagenes);
logoutBTN.addEventListener('click',cerrarSesion);
datasetBTN.addEventListener('click',descargarDataset);
borrarImagenBTN.addEventListener('click', borrarImagen);
borrarSketchBTN.addEventListener('click', borrarSketch);

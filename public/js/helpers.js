let port = testPort;
if (produccion==true) {
    port = 80;
}


//si hay token nos vamos directamente a la pantalla de admin
const hayToken = async(enLogin=true) => {
    const url = `http://${window.location.hostname}:${port}/plantas/api/login/validate`;
    const token = localStorage.getItem('token');
    
    if (token) { //si hay token
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'token': token
                }
            });
            if (response.status === 200 && enLogin) { 
                document.location.href = "admin"; 
            } else if (response.status != 200 && !enLogin) {
                localStorage.removeItem('token');
                document.location.href = "login"; 
            }
        } catch(err) {
            console.log(err);
            if (!enLogin) {
                document.location.href = "login"; 
            }
        }

    } else if (!token && !enLogin) {
        document.location.href = "login"; 
    }
}


const inicioSesion = async(username, password, errorHTMLTag) => {
    const data = {
        username,
        password
    }

    const url = `https://api-inicio-sesion.herokuapp.com/api/login/`;

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data) // body data type must match "Content-Type" header
        });

        const respuesta = await res.json();

        if (res.status === 200) {
            const token = respuesta.token;
            localStorage.setItem('token', token);
            await hayToken();
        } else {
            error(respuesta.msg,errorHTMLTag);
        }
        
    } catch(err) {
        alert(err);
        error("Error de red",errorHTMLTag);
    }

}


const error = (msg='', errorHTMLTag) => {
    errorHTMLTag.innerText = msg;
}
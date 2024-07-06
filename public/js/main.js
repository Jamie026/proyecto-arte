const fechas = {};
let grafica = null;
let audio = new Audio();

function selectorDinamico(id) {
    const selector = document.getElementById(id);
    new Choices(selector);
}

function formatDateToISO(date) {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const day = String(date.getUTCDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function cargarCalendario(id) {
    window.disableLitepickerStyles = true;
    let dateRangePicker = document.getElementById(id);
    let pickerRange = new Litepicker({
        element: dateRangePicker,
        format: "YYYY-MM-DD",
        singleMode: true,
    });
    pickerRange.on("selected", (fecha) => {
        fechas["fecha"] = formatDateToISO(fecha.dateInstance);
    });
}

function cargarGrafica() {
    document
        .getElementById("datos-weather")
        .addEventListener("submit", async (e) => {
            e.preventDefault();
            let seleccion = e.target.dato.options[0].text;
            const data = {
                dato: e.target.dato.value,
                ubicacion: e.target.ubicacion.value,
                fecha: fechas["fecha"]
            };

            const dataResponse = await axios.post("./consultar", data);
            const dataWeather = dataResponse.data;

            const tiempos = dataWeather.map((item) => item["utc_timestamp"]);
            const valores = dataWeather.map((item) => {
                let valor = item[data.ubicacion + "_" + data.dato];
                return data.dato == "temperature" ? (9 / 5 * valor) + 32 : valor;
            });

            const parsedData = tiempos.map((tiempo, index) => ({
                x: new Date(new Date(tiempo).toUTCString().substr(0, 25)),
                y: valores[index],
                r: 5,
            }));

            let icon = new Image();
            icon.src = data.dato == "temperature" ? "https://cdn-icons-png.flaticon.com/512/2996/2996114.png" :
                "https://cdn-icons-png.flaticon.com/512/4814/4814275.png"
            icon.width = 30;
            icon.height = 30;

            if (grafica != null)
                grafica.destroy();

            const ctx = document.getElementById("myChart").getContext("2d");
            grafica = new Chart(ctx, {
                type: "bubble",
                data: { datasets: [{ label: "Cambios climáticos en el tiempo", data: parsedData }]},
                options: {
                    elements: { point: { pointStyle: icon }},  
                    scales: {
                        x: { type: "time", time: { displayFormats: { hour: "HH:mm:ss" }}, title: { display: true, text: "Horario" }},
                        y: { title: { display: true, text: seleccion }}
                    },
                    maintainAspectRatio: false,
                    onClick: (event, elements, chart) => {
                        if (elements[0]) {            
                            const element = chart.data.datasets[0].data[elements[0].index];
                            const imagen = document.getElementById("imagen-dato");
                            if (audio.duration > 0 && !audio.paused) 
                                audio.pause();

                            if (element.y >= 25 && data.dato == "temperature") {
                                audio.src = "./../sounds/Calor.mp3" 
                                imagen.src = "./../img/calor.jpg";
                            }
                            else if(element.y < 25 && data.dato == "temperature"){
                                audio.src = "./../sounds/Frio.mp3"
                                imagen.src = "./../img/frio.jpg";
                            }
                            else{
                                audio.src = "./../sounds/Radiacion.mp3"
                                imagen.src = "./../img/radiacion.jpg";
                            }            
                            const modal = document.getElementById("modal");  
                            const closeBtn = document.getElementsByClassName("closeBtn")[0]; 
                            closeBtn && (closeBtn.onclick = () => modal.style.display = "none") 
                            modal.style.display = "block"        
                            audio.play()
                        }
                    }
                }
            });
        });
}

window.onload = () => {
    document.getElementById("selector-dinamico-dato") &&
        selectorDinamico("selector-dinamico-dato");
    document.getElementById("selector-dinamico-ubicacion") &&
        selectorDinamico("selector-dinamico-ubicacion");
    document.getElementById("datos-weather") && 
        cargarGrafica();
    document.getElementById("dateRangePicker") &&
        cargarCalendario("dateRangePicker");

    const modal = document.getElementById("modal");
                
    window.onclick = (event) => {
        if (event.target == modal) 
            modal.style.display = "none";
    }

};
document.getElementById('btn-download').addEventListener('click', async e =>{
    xlsDownload();
 });

 document.getElementById('inputFile').addEventListener("change", (event) => {
    selectedFile = event.target.files[0];
    let btn = document.getElementById('btnSendxls');
    if(selectedFile){
        btn.style.display = ""; 
    }else{
        btn.style.display = "none";
    }
  });

 document.getElementById('btn-upload').addEventListener('click', async e =>{
    document.getElementById('modalLabelf').innerHTML = `
        Actualizar ${currentCollection.titulo} desde archivo .xls
    `;
    $('#modalFilexls').modal('show');
 });

 document.getElementById('btnSendxls').addEventListener('click', async e =>{
    xlsUpload();
});



async function xlsDownload() {
    try {
        let copy = currentContent.map(obj => ({ ...obj }));
        copy.forEach(obj => {
            currentKeys.forEach(item => {
                obj[item.alias] = obj[item.campo];
                delete obj[item.campo];
            });
        });
        const filename = `${currentCollection.titulo}.xlsx`;
        const ws_name = "Hoja1";
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(copy);
        XLSX.utils.book_append_sheet(wb, ws, ws_name);
        XLSX.writeFile(wb, filename);
    } catch (error) {
        console.error("Error al generar el archivo Excel:", error);
        toastr.error("Error al generar el archivo Excel. Por favor, inténtalo de nuevo.");
    }
}




async function xlsUpload() {
    try {
     // Leer el archivo seleccionado como una cadena binaria
        const fileData = await new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.onload = () => resolve(fileReader.result);
            fileReader.onerror = reject;
            fileReader.readAsBinaryString(selectedFile);
        });

        // Parsear el contenido del archivo Excel
        const workbook = XLSX.read(fileData, { type: "binary" });
        const sheet = workbook.SheetNames[0];
        const rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);

        // Agregar el modelo al primer objeto
        rowObject.forEach(obj => obj.modelo = currentCollection.modelo);

        // Convertir los alias en nombres de campo en cada objeto
        rowObject.forEach(obj => {
            currentKeys.forEach(item => {
                obj[item.campo] = obj[item.alias];
                delete obj[item.alias];
            });
        });

        // Preparar el objeto para enviar al servidor
        const dataToSend = {
            modelo: currentCollection.modelo,
            documentos: rowObject
        };

        // Enviar los datos parseados al servidor
        const res = await fetch('/editor/save', {    
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToSend)
        });

        // Manejar la respuesta del servidor
        const data = await res.json();
        if (data.fail) {
            toastr.error(data.message);
            return;
        }
        toastr.info(data.message);
        this.renderTable();
    } catch (error) {
        console.error("Error al cargar el archivo Excel:", error);
        toastr.error("Error al cargar el archivo Excel. Por favor, inténtalo de nuevo.");
    }
}


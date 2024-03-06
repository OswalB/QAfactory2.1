let currentCollection


document.getElementById("btn_guardar").addEventListener('click', async e => {
   
    const submit = document.getElementsByClassName("form-snd");
    const objeto = {
        _id: currentDocumentId,
    };

    for (const element of submit) {
        if (element.type === 'text' || element.type === 'number') {
            objeto[element.id] = element.value;
        } else if (element.type === 'checkbox') {
            objeto[element.id] = element.checked;
        }
    }
    if (!applyValidation()) {
        alert('El formulario tiene campos no válidos, por favor revise la información e intente nuevamente.');
        return; 
    }
    let msg = '¿CREAR este NUEVO documento?'
    if(role == 'edit') msg = 'Guardar CAMBIOS?'
    const result = window.confirm(msg);
    if (!result) {
        return;
    }

    const res = await fetch('/core/save', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "PUT",
        body: JSON.stringify({ 'documentos': [objeto], 'modelo': currentCollection.modelo })
    });

    const data = await res.json();
    if (data.fail) {
        toastr.error(data.message);
        return;
    }

    toastr.info(data.message);
    $('#modalEditor').modal('hide');
    renderTable();
});


document.getElementById('btnNuevo').addEventListener('click',async e =>{
    role = 'nuevo';
    currentDocumentId = null;
    let titulo = document.getElementById('modal-title');
    titulo.innerHTML = `Nuevo ${currentCollection.titulo}` ;
    //applyValidation();
    renderModalEditor(currentKeys);
    
    
})

document.getElementById('listDocuments').addEventListener('click',async e =>{
    workFilter.currentPage = 1;
    let m =e.target.getAttribute('_modelo');
    let t =e.target.getAttribute('_titulo');
    currentCollection ={"titulo":t, "modelo":m};
    workFilter.modelo = m;
    let boton = document.getElementById('btnChose');
    boton.innerHTML = t;
    workFilter.filterStatus = 'off';
    showAlertFilter();
    setFilter();
    loadFilter();
    await renderTable();
    //setFilter();
    await footer();
    renderFilter();
    paintFilter();
})

document.getElementById('bodyContainer').addEventListener('dblclick',async e =>{
    let idt = e.target.getAttribute('_id');
    userId = idt;
    role = 'edit';
    currentDocumentId = idt;
    let titulo = document.getElementById('modal-title');
    titulo.innerHTML = `Editar ${currentCollection.titulo}` ;
    renderModalEditor(currentKeys);
    //applyValidation();
    
});

document.getElementById("btn_reset").addEventListener('click',async e =>{
    result = window.confirm('Seguro que desea cambiar el PASSWORD?');
    if(!result) return;
    const res = await fetch('/core/reset-pass', {    
            headers: {
                'Content-Type': 'application/json'
              },
              method: "POST",
              body: JSON.stringify({"_id": userId})
            });
    const data = await res.json();
    toastr.success(data);
    $('#modalEditor').modal('hide');
    
});



//=========================== FUNCTIONS =============================================
async function init(){
    document.getElementById('title-main').innerHTML='Editor';

    workFilter.modelo = '';
    
    backFilter.filterBy = '0';
    backFilter.filterTxt = '';
    backFilter.limitar = 10;
    backFilter.max = '';
    backFilter.min = '';
    backFilter.datemax = '';
    backFilter.datemin = '';
    backFilter.otrosMatch = [];
    backFilter.proyectar = [];
    backFilter.saltar = 0;
    backFilter.sortBy = '0';
    backFilter.sortOrder = 1;
    backFilter.valorBoolean = 'false';
    backFilter.group='itemspp';
    backFilter.datepp = formatDate(new Date());
    backFilter.keyGroup = 'createdAt'
    //backFilter.keyGroup = 'delivery';
    
    
    await loadList();

};

function afterLoad(){
    fadeInputs();
};

async function renderTable(){
    let response = await fetch("/core/keys",{
        headers: {'content-type': 'application/json'},
        method: 'POST',
        body: JSON.stringify({'modelo':workFilter.modelo})
    })
    let data = await response.json();
    if(data.message){
        toastr.error(data.message);
        return;
    }
    currentKeys = data;

    const container = document.getElementById('encabezado');
    container.innerHTML = '';
    
    data.forEach(columna =>{
        const th = document.createElement('th');
        th.innerHTML= `
            ${columna.alias}                
        `;
        container.appendChild(th);
    });

    //crea la cuadricula con los datos:
    workFilter.funcion = 'content';
    response = await fetch("/core/editor-content",{
        headers: {'content-type': 'application/json'},
        method: 'POST',
        body: JSON.stringify(workFilter)
    })
    const dataList = await response.json();
    sizeCollection = dataList[0].countTotal;
    dataList.shift();
    if(data.fail){
        toastr.error(data.message);
        return;
    }
    currentContent = dataList;
    //crea las filas de la cuadricula
    const bodyContainer = document.getElementById('bodyContainer');
    bodyContainer.innerHTML = '';
    dataList.forEach(item => {
        const tr = document.createElement('tr');
        tr.id = item._id;
        bodyContainer.appendChild(tr);
    });
    //crea las coluns de cada fila
    dataList.forEach(item =>{
        let filaContainer = document.getElementById(item._id);
        filaContainer.innerHTML = '';
        data.forEach(columna =>{
            
            let codigo = `item.${columna.campo}`;  //concatena las dos referencias y eval() lo convierte en linea de codig
            const td = document.createElement('td');
            td.setAttribute('_id',item._id);
            if(columna.tipo == 'boolean'){
                if(eval(codigo)){
                    td.innerHTML= `Si`;
                }
                else{
                    td.innerHTML= `No`;
                }
            }else{
               td.innerHTML= `${eval(codigo)}`; 
            }

            
            filaContainer.appendChild(td);
        })
    })

}

async function loadList(){
    let listaEditables =  await fetch("/core/list-collections");
    listaEditables = await listaEditables.json();
    const container = document.getElementById('listDocuments');
    container.innerHTML='';
    listaEditables.forEach(item =>{
        const li = document.createElement('li');
        li.innerHTML= `
        <a _modelo="${item.modelo}" _titulo="${item.titulo}" class="dropdown-item" href="#">${item.titulo}</a>
        `;
        container.appendChild(li);
    })   
}




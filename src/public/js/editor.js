let currentCollection

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

//=========================== FUNCTIONS =============================================
async function init(){
    document.getElementById('title-main').innerHTML='Editor';

    workFilter.modelo = '';
    
    backFilter.filterBy = '0';
    backFilter.filterTxt = '';
    backFilter.limitar = 10;
    backFilter.max = '';
    backFilter.min = '';
    backFilter.otrosMatch = [{'state':0}];
    backFilter.proyectar = [];
    backFilter.saltar = 0;
    backFilter.sortBy = '0';
    backFilter.sortOrder = 1;
    backFilter.valorBoolean = 'false';
    
    
    await loadList();
};

function afterLoad(){

};

async function renderTable(){
    let response = await fetch("/editor/keys",{
        headers: {'content-type': 'application/json'},
        method: 'POST',
        body: JSON.stringify({'modelo':workFilter.modelo})
    })
    let data = await response.json();
    if(data.fail){
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
    response = await fetch("/api/content",{
        headers: {'content-type': 'application/json'},
        method: 'POST',
        body: JSON.stringify(workFilter)
    })
    const dataList = await response.json();
    
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
    let listaEditables =  await fetch("/api/editor/listCollections");
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



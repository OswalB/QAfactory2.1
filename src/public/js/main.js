var currentKeys =[], backFilter ={}, workFilter={}, tgg = true, role;
let k_filterBy, k_filterTxt, k_limitar, k_max, k_min, k_saltar;
let k_sortBy, k_sortOder, k_valorBoolean;

document.addEventListener('DOMContentLoaded', async () => {
   
    k_filterBy= document.getElementById('in-filterBy');
    k_filterTxt= document.getElementById('in-filterTxt');
    k_limitar= document.getElementById('in-limitar');
    k_max= document.getElementById('in-max');
    k_min= document.getElementById('in-min');
    k_sortBy= document.getElementById('in-sortBy');
    k_checkAsc= document.getElementById('checkAsc');
    k_checkDsc= document.getElementById('checkDsc');
    k_valorBoolean= document.getElementById('in-valorBoolean');
   
    workFilter.filterStatus = 'off';
    workFilter.funcion = 'count';
    workFilter.currentPage = 1;

    await init();
    setFilter();
    loadFilter();
    await footer();
    await renderTable();
    renderFilter();
    afterLoad();
})

document.getElementById('pagination_container').addEventListener('click',async e =>{
    let i =e.target.getAttribute('_id');
    
    await footer(i); 
    renderTable(); 
})

document.getElementById('alertFilter').addEventListener('click', async (e) => {
    const frole = e.target.getAttribute('id');

    if (frole === 'alertCancelar') {
        workFilter.filterStatus = 'off';
        setFilter();
        loadFilter();
        await footer();
        await renderTable();
        paintFilter();
    } else if (frole === 'alertAplicar') {
        workFilter.filterStatus = 'active';
        loadFilter();
        await footer();
        await renderTable();
    }

    showAlertFilter();
});



document.getElementById('form-filtro').addEventListener('change',async e =>{
    workFilter.filterStatus = 'change';
    showAlertFilter();
    paintFilter();
    //setFilter('panel');
    //await footer(); 
    //renderTable(); 
})



function paintFilter() {
    const filtroPor = currentKeys.find(actuales => actuales.campo === k_filterBy.value);
    
    const tipoSelected = filtroPor?filtroPor.tipo:'0';
    const tipoEstiloMap = {
        '0': ['none', 'none', 'none', 'none'],
        'string': ['block', 'none', 'none', 'none'],
        'number': ['none', 'block', 'block', 'none'],
        'boolean': ['none', 'none', 'none', 'block']
    };

    const [filterTxtStyle, minStyle, maxStyle, valorBooleanStyle] = tipoEstiloMap[tipoSelected];

    k_filterTxt.style.display = filterTxtStyle;
    k_min.style.display = minStyle;
    k_max.style.display = maxStyle;
    k_valorBoolean.style.display = valorBooleanStyle;
}




function renderFilter(){

    addOptionsToSelect('in-sortBy', currentKeys);
    addOptionsToSelect('in-filterBy', currentKeys);


}

function addOptionsToSelect(selectId, keys) {
    const container = document.getElementById(selectId);
    container.innerHTML = '';

    const op = document.createElement('option');
    op.setAttribute("value", 0);
    op.innerHTML = 'Ninguno';
    container.appendChild(op);

    keys.forEach(item => {
        const op = document.createElement('option');
        op.setAttribute("value", item.campo);
        op.innerHTML = item.alias;
        container.appendChild(op);
    });
}


function setFilter() {  

    k_filterBy.value = backFilter.filterBy ;
    k_filterTxt.value = backFilter.filterTxt;
    k_limitar.value = backFilter.limitar ;
    k_max.value = backFilter.max ;
    k_min.value = backFilter.min ;
    workFilter.saltar = backFilter.saltar;
    k_sortBy.value = backFilter.sortBy;
    k_checkAsc.checked = backFilter.sortOrder === 1;
    k_checkDsc.checked = backFilter.sortOrder === -1;
    k_valorBoolean.value = backFilter.valorBoolean;
    
}  

function loadFilter(){

    workFilter.filterBy = k_filterBy.value === '0'?'':k_filterBy.value;
    workFilter.filterTxt = k_filterTxt.offsetParent?k_filterTxt.value:'';
    workFilter.limitar = k_limitar.value;
    workFilter.max = k_max.offsetParent?parseInt(k_max.value):'';
    workFilter.min = k_min.offsetParent?parseInt(k_min.value):'';
    workFilter.sortBy = k_sortBy.value === '0'?'':k_sortBy.value;
    workFilter.sortOrder = k_checkAsc.checked?1:-1;
    workFilter.valorBoolean = k_valorBoolean.offsetParent?k_valorBoolean.value:'';
    workFilter.otrosMatch = backFilter.otrosMatch;
    workFilter.proyectar = backFilter.proyectar;
            
            
}

function applyValidation(){
    let validate = true
    const form = document.querySelector('.needs-validation');
              if (form.checkValidity()) {
                // El formulario es válido, puedes realizar acciones aquí
                console.log('Formulario válido, realizar acciones...');
              } else {
                validate = false;
                // El formulario no es válido, aplicar estilos de validación
                form.classList.add('was-validated');
              }
    return validate;
           
}

function showAlertFilter() {
    const alerta = document.getElementById('alertFilter');
    let message = '', tipo = '';

    if (workFilter.filterStatus === 'change') {
        tipo = 'warning';
        message = `El filtro está configurado pero no aplicado, desea 
        <a id="alertAplicar" href="#"> aplicar</a> o 
        <a id="alertCancelar" href="#">cancelar?</a>`;
    } else if (workFilter.filterStatus === 'active') {
        tipo = 'danger';
        message = `El filtro está activado, desea 
        <a id="alertCancelar" href="#"> desactivarlo?</a>`;
    }

    alerta.style.display = workFilter.filterStatus !== 'off' ? 'block' : 'none';
    alerta.setAttribute('class', `alert alert-${tipo}`);
    alerta.innerHTML = `${message}`;
}


//***********     pendientes por aprobacion */

document.getElementById('btn-refrescar').addEventListener('click',async e =>{
    workFilter.currentPage =1
    await footer(); 
    renderTable(); 
})





//-------------------------- MENU LATERAL  --------------------------------------

$(".sidebar ul li").on('click', function () {
    $(".sidebar ul li.active").removeClass('active');
    $(this).addClass('active');
})

$(".btnmenu").on('click', function () {

    if (tgg) {
        $('.sidebar').addClass('active');
        $('#nav-menu').addClass('active');
        $('.content-w').addClass('active');
        
    } else {
       
        $('.sidebar').removeClass('active');
        $('#nav-menu').removeClass('active');
        $('.content-w').removeClass('active');
    }
    tgg = !tgg
});

$(".content-w").on('click', function () {

    if (!tgg) {
        
        $('.sidebar').removeClass('active');
        $('#nav-menu').removeClass('active');
        $('.content-w').removeClass('active');
    }
    tgg = !tgg
})

//-------------------------- FUNCIONES  --------------------------------------


//-------------------------- PAGINATION AND FILTER  --------------------------------------



async function footer(npage){
    workFilter.currentPage = npage?npage:1; 

    workFilter.saltar = (workFilter.currentPage - 1) * workFilter.limitar;
    workFilter.funcion = 'count';
  //consultar tamaño de coleccion
    let response = await fetch("/api/content",{
        headers: {'content-type': 'application/json'},
        method: 'POST',
        body: JSON.stringify(workFilter)
    })
    let data = await response.json();
    sizeCollection = data[0].countTotal;

    let winL, winR, winMax;
    let pags = Math.trunc(sizeCollection/workFilter.limitar);
    if(sizeCollection%workFilter.limitar != 0){pags += 1;}
    document.getElementById('lbl_results').innerHTML=`Resultados: ${sizeCollection}`;
    const pagContainer = document.getElementById('pagination_container');
    pagContainer.innerHTML='';
    if(workFilter.currentPage<(pags-2)){winL = workFilter.currentPage-2;}
    else{winL = pags-5;}
    if(winL < 2 || pags < 8 ){winL = 2;}
    winR= winL+4;
    if(winR>(pags-1)){winR=pags-1}
    if(pags > 0){this.addPag(pagContainer,1,workFilter.currentPage);}
    if(winL > 2){this.addPag(pagContainer,0,workFilter.currentPage);}
    for(let i = winL; i<= winR; i++){
        this.addPag(pagContainer,i,workFilter.currentPage);
    }
    if(pags - winR  > 1){this.addPag(pagContainer,0,workFilter.currentPage);}
    if(pags > 1){this.addPag(pagContainer,pags,workFilter.currentPage);}
}

function addPag(pagContainer,i){
    
    const lipag = document.createElement('li');
    let clase = 'page-item';
    if(i==workFilter.currentPage){clase += ' active';}
    lipag.setAttribute('class', clase);
    if(i==0){
        lipag.innerHTML = `<label class="px-2"> ... </label>`;
    }else{
        lipag.innerHTML = `<a class="page-link " _id=${i} href="#" id="page${i}">${i}</a>`;
    }
    pagContainer.appendChild(lipag);
}

function fadeInputs(){
    const fadeInputs = document.querySelectorAll('.fade-input');

fadeInputs.forEach(input => {
  input.addEventListener('input', () => {
    input.classList.add('changed'); // Aplica el color de fondo cambiado
    clearTimeout(input.fadeTimeout); // Cancela el timeout anterior (si existe)
  });

  input.addEventListener('blur', () => {
    input.fadeTimeout = setTimeout(() => {
      input.classList.remove('changed'); // Remueve el color de fondo cambiado después de un tiempo
    }, 1000); 
  });
});

}

async function renderModalEditor() {
    const cambio = document.getElementById('btn_reset');
    cambio.style.display = currentCollection.modelo === 'User' ? '' : 'none';
    
    const ind = role === 'edit' ? currentContent.findIndex(content => content._id === currentDocumentId) : 0;
    document.getElementById('btn_borrar').style.display = role === 'edit' ? '' : 'none';

    const bodyTable = document.getElementById('bodyTable');
    bodyTable.innerHTML = '';

    currentKeys.forEach(item => {
        console.log
        const contenido = role === 'edit' ? currentContent[ind][item.campo] : (item.default !== undefined ? item.default : '');

        const inputType = getInputType(item.tipo);
        const inputClass = getInputClass(item.tipo);
        
        const tr = document.createElement('tr');
        const tdLabel = document.createElement('td');
        tdLabel.innerHTML = `<span class="input-group-text" id="addon-wrapping">${item.alias}:</span>`;
        tr.appendChild(tdLabel);

        const tdInput = document.createElement('td');
        const input = document.createElement('input');
        input.id = item.campo;
        input.type = inputType;
        input.classList.add(inputClass, 'form-snd');
        input.value = contenido;
        input.required = item.require;
        if (item.minlength !== undefined) {
            input.minLength = item.minlength;
        }
        
        if (item.maxlength !== undefined) {
            input.maxLength = item.maxlength;
        }
        
        if (item.min !== undefined) {
            input.min = item.min;
        }
        
        if (item.max !== undefined) {
            input.max = item.max;
        }
        tdInput.appendChild(input);

        const invalidFeedback = document.createElement('div');
        invalidFeedback.classList.add('invalid-feedback');
        invalidFeedback.textContent = item.failMsg;
        tdInput.appendChild(invalidFeedback);

        tr.appendChild(tdInput);
        bodyTable.appendChild(tr);

        if (item.tipo === 'boolean' && contenido) {
            input.checked = true;
        }
    });

    $('#modalEditor').modal('show');
}

function getInputType(tipo) {
    switch (tipo) {
        case 'boolean':
            return 'checkbox';
        case 'date':
            return 'date';
        case 'number':
            return 'number';
        default:
            return 'text';
    }
}

function getInputClass(tipo) {
    return tipo === 'boolean' ? 'form-check-input' : 'form-control';
}


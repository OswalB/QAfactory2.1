let currentCollection, listTemplates, selectedTemplate, currentInput = {};
const defaults = {
    col: 6,
    height: 15,
    siBorde: true,
    align: 0,
    sizeFont: 11,
    paddingX: 2,
    paddingY: 0,
    colorFont: "#000000",
    colorBg: "#111111",
    siBg: false,
    originControl: '0',
    formatControl: '0'
}

const inputFieldO = document.getElementById('in-fieldOrder');
const listOrderData = document.getElementById('listOrderData');

// Delegación de eventos: escuchamos los clicks en el contenedor de la lista
listOrderData.addEventListener('click', function (event) {
    event.preventDefault();
    if (event.target.classList.contains('drop-order')) {
       
        inputFieldO.value = event.target.textContent;
        fillLocalDesign(inputFieldO);
    }
});


const inputField = document.getElementById('in-fieldFilter');
const listFilterData = document.getElementById('listFilterData');

// Delegación de eventos: escuchamos los clicks en el contenedor de la lista
listFilterData.addEventListener('click', function (event) {
    event.preventDefault();
    if (event.target.classList.contains('drop-filter')) {
      
        inputField.value += event.target.textContent;
        fillLocalDesign(inputField);
    }
});

const inputFieldG = document.getElementById('in-fieldGroup');
const listFilterDataG = document.getElementById('listGroupData');

// Delegación de eventos: escuchamos los clicks en el contenedor de la lista
listFilterDataG.addEventListener('click', function (event) {
    event.preventDefault();
    if (event.target.classList.contains('drop-group')) {
       
        inputFieldG.value = event.target.textContent;
        fillLocalDesign(inputFieldG);
    }
});

const listSections = ['headerReport', 'headerPage', 'headerGroup', 'headerDetail', 'detail'];

document.getElementById("accordionDesign").addEventListener('click', async e => {
    const role = e.target.getAttribute('role');
    const section = e.target.getAttribute('data-section');

    processRole(role, section); // Agrega un input a la sección 'headerReport'


    /*if (role === 'addHeaderReport') {
        const inputs = document.getElementById('acc-headerReport').querySelectorAll('input');
        const index = inputs.length;
        console.log('click en boton ', role, index);
        renderInputs('acc-headerReport', index, section);
        defaultValues();
    }
    if (role === 'delHeaderReport') {
        const section = document.getElementById('acc-headerReport');
        const inputs = section.querySelectorAll('input');
        if (inputs.length > 0) {
            const lastInput = inputs[inputs.length - 1];
            section.removeChild(lastInput);
            localDesign.headerReport.pop();
        } else {
            console.log('No hay inputs para eliminar.');
        }

    }*/

})



function processRole(role, section) {
    // Definir el ID del contenedor basado en la sección
    const containerId = `acc-${section}`;
    const sectionElement = document.getElementById(containerId);

    if (!sectionElement) {
        console.log(`No se encontró el contenedor para la sección: ${section}`);
        return;
    }

    if (role === 'addSection') {
        const inputs = sectionElement.querySelectorAll('input');
        const index = inputs.length;
        console.log(`Agregando input en sección: ${section}, índice: ${index}`);
        renderInputs(containerId, index, section);
        if (!localDesign[section]) {
            localDesign[section] = [];
        }
        if (!localDesign[section][index]) {
            localDesign[section][index] = { ...defaults };
        }

    } else if (role === 'delSection') {
        const inputs = sectionElement.querySelectorAll('input');
        if (inputs.length > 0) {
            const lastInput = inputs[inputs.length - 1];
            sectionElement.removeChild(lastInput);
            if (localDesign[section]) {
                localDesign[section].pop(); // Eliminar el último elemento del array correspondiente
            }
        } else {
            console.log(`No hay inputs para eliminar en la sección: ${section}`);
        }
    } else {
        console.log(`Acción no válida: ${role}`);
    }
}





function renderInputs(container, index, section, value = '') {
    const containerElement = document.getElementById(container);
    if (index === 0) {
        containerElement.innerHTML = '';
    }
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-control';
    input.placeholder = '';
    input.name = 'texto';
    input.setAttribute('data-index', index);
    input.setAttribute('data-section', section);
    input.style.width = '100%';
    input.value = value;
    containerElement.appendChild(input);
}






const formSection = document.getElementById('accordionDesign');
formSection.addEventListener('focus', function (event) {
    const input = event.target;
    if (input.hasAttribute('data-section') && input.hasAttribute('data-index')) {
        currentInput = {
            section: input.getAttribute('data-section'),
            index: input.getAttribute('data-index'),
            fieldName: input.name
        }
        toggleInputs({ bloquear: false });
        console.log('seccion: ', currentInput.section, currentInput.index)
    } else {
        if (role != 'property') {
            currentInput.section = '';
            toggleInputs({ bloquear: true });
        }
    }
    const titulo = updateTitle();
    document.getElementById('title-properties').innerHTML = titulo
}, true); // 'true' para que el evento se capture en la fase de captura




let currentInput2 = null; // Variable para almacenar el input donde ocurrió el dblclick

// Escucha el evento dblclick en la sección
formSection.addEventListener('dblclick', function (event) {
    if (event.target.tagName === 'INPUT') {
        currentInput2 = event.target; // Almacena el input donde se hizo el dblclick
        mostrarListaOpciones(event.target);
    }
});

// Función para mostrar la lista de opciones basadas en currentKeys
function mostrarListaOpciones(input) {
    const listaContainer = document.createElement('div');
    listaContainer.style.position = 'absolute';
    listaContainer.style.top = `${input.offsetTop + input.offsetHeight}px`;
    listaContainer.style.left = `${input.offsetLeft}px`;
    listaContainer.style.border = '1px solid #ccc';
    listaContainer.style.background = '#fff';
    listaContainer.style.zIndex = 1000;

    currentKeys.forEach(key => {
        const opcion = document.createElement('div');
        opcion.textContent = key.alias;
        opcion.style.padding = '5px';
        opcion.style.cursor = 'pointer';

        opcion.addEventListener('click', function () {
            input.value = key.alias; // Asigna el alias al input
            document.body.removeChild(listaContainer); // Elimina la lista de la vista
        });

        listaContainer.appendChild(opcion);
    });

    document.body.appendChild(listaContainer);

    // Elimina la lista si haces clic fuera de ella
    document.addEventListener('click', function removerLista(event) {
        if (!listaContainer.contains(event.target) && event.target !== currentInput2) {
            document.body.removeChild(listaContainer);
            document.removeEventListener('click', removerLista); // Remueve el listener después de la ejecución
        }
    });
}









function updateTitle() {
    const translations = {
        'headerReport': 'Encabezado de informe'
    };
    if (translations.hasOwnProperty(currentInput.section)) {
        return `${translations[currentInput.section]}[${parseInt(currentInput.index) + 1}]`;
    } else {
        return 'No seleccionado';
    }
}


function toggleInputs({ bloquear }) {
    const formSection = document.getElementById('formDesign');
    const inputsAndSelects = formSection.querySelectorAll('input, select');
    inputsAndSelects.forEach(element => {
        if (element.role === 'property') {
            element.disabled = bloquear;

            if (bloquear) {
                if (element.type !== 'color') {
                    element.value = ''; // Limpiar valor si está bloqueado
                }
            } else {
                const sectionArray = localDesign[currentInput.section];
                if (Array.isArray(sectionArray) && sectionArray[currentInput.index] && sectionArray[currentInput.index].hasOwnProperty(element.name)) {
                    const valor = sectionArray[currentInput.index][element.name];
                    if (element.type === 'checkbox') {
                        element.checked = valor;
                    } else {
                        element.value = (valor != null && valor !== '') ? valor : defaults[element.name];
                    }
                } else {
                    console.log(`No se encontró el valor para la sección: ${currentInput.section}, índice: ${currentInput.index}, nombre: ${element.name}`);
                }
            }
        }
    });
}

/*
function toggleInputs({ bloquear }) {
    const formSection = document.getElementById('formDesign');
    const inputsAndSelects = formSection.querySelectorAll('input, select');
    inputsAndSelects.forEach(element => {

        if (element.role === 'property') {
            element.disabled = bloquear;
            if (bloquear) {
                if (element.type !== 'color') {
                    if (bloquear) element.value = '';
                }
            } else {
                const sectionArray = localDesign[currentInput.section];  // Verifica si la sección existe
                if (Array.isArray(sectionArray) && sectionArray[currentInput.index] && sectionArray[currentInput.index].hasOwnProperty(element.name)) {
                    const valor = sectionArray[currentInput.index][element.name];
                    if (element.type === 'checkbox') {
                        element.checked = valor;
                    } else {
                        element.value = valor ? valor : defaults[element.name];
                    }
                } else {
                    console.log(`No se encontró el valor para la sección: ${currentInput.section}, índice: ${currentInput.index}, nombre: ${element.name}`);
                }

            }

        }


    });
}
*/

function defaultValues() {
    const formSection = document.getElementById('formDesign');
    const inputsAndSelects = formSection.querySelectorAll('input, select');

    inputsAndSelects.forEach(element => {
        if (element.type !== 'color' && defaults.hasOwnProperty(element.name)) {
            element.value = defaults[element.name];
        }
    });
}

document.getElementById("in-template").addEventListener('change', async e => {
    currentInput.section = '';
    toggleInputs({ bloquear: true });
    const titulo = updateTitle();
    document.getElementById('title-properties').innerHTML = titulo
    selectedTemplate = parseInt(document.getElementById('in-template').value);
    const vis = selectedTemplate === 0 ? false : true;
    activeButtons({ btnSel: true, btnV: vis, btnE: vis, btnG: false });
    const res = await fetch('/domain/templates-list', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
            "idTemplate": selectedTemplate,
            fx: 'content'
        })
    });
    const data = await res.json();
    if (data.fail) {
        toastr.error(data.message);
        return;
    }
    localDesign = data[0];
    if (typeof localDesign.pagina !== 'object') {
        localDesign.pagina = {};
    }
    if (typeof localDesign.headerReport !== 'object') {
        localDesign.headerReport = [];
    }

    fillDesign();
    

});

document.getElementById("btn-genPDF").addEventListener('click', async e => {
    if (!currentCollection) return;
    activeButtons({ btnSel: true, btnV: false, btnE: false, btnG: false });
    const res = await fetch('/domain/templates-list', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
            "modelo": currentCollection.modelo,
            fx: 'list'
        })
    });
    listTemplates = await res.json();
    if (listTemplates.fail) {
        toastr.error(listTemplates.message);
        return;
    }

    listTemplates.forEach(item => {
        item.descripcion = `${item.idTemplate}: ${item.descripcion}`
    })
    addOptionsSelect('in-template', listTemplates, 'idTemplate', 'descripcion')

});

document.getElementById("btnVerpdf").addEventListener('click', async e => {
    generarPDF(localDesign);
})

document.getElementById("btnGuardarTemplate").addEventListener('click', async e => {
    const formSection = document.getElementById('formDesign');
    const inputs = formSection.querySelectorAll('input, select');
    inputs.forEach(input => {
        fillLocalDesign(input);
    })

    const res = await fetch('/domain/template', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "PUT",
        body: JSON.stringify(localDesign)
    });

    const data = await res.json();
    toastr.info(`${data.matchedCount} actualizados`)
    if (data.fail) {
        toastr.error(data.message);
        return;
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const formSection = document.getElementById('formDesign');

    formSection.addEventListener('input', (event) => {
        const input = event.target;

        if (input.matches('input, select')) {
            activeButtons({ btnSel: true, btnV: true, btnE: true, btnG: true });
            fillLocalDesign(input);

            //console.log(localDesign);
        }
    });
});


function fillLocalDesign(input) {
    
    const role = input.getAttribute('role');
    const fieldName = input.name;
    let fieldValue;
    const section = role === 'property' ? currentInput.section : input.getAttribute('data-section');
    const indice = role === 'property' ? currentInput.index : input.getAttribute('data-index');
    if (input.type === 'checkbox') {
        fieldValue = input.checked;
    } else {
        fieldValue = input.value;
    }

    if (section && localDesign[section]) {
        if (indice !== null && indice !== undefined) {
            const index = parseInt(indice);
            if (!Array.isArray(localDesign[section])) {
                localDesign[section] = [];
            }
            if (!localDesign[section][index]) {
                localDesign[section][index] = {};
            }
            localDesign[section][index][fieldName] = fieldValue;
        } else {
            localDesign[section][fieldName] = fieldValue;
        }


    } else {
        console.warn(`Sección ${section} no encontrada en localDesign`);
    }
}
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
    if (role == 'edit') msg = 'Guardar CAMBIOS?'
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

document.getElementById('btnNuevo').addEventListener('click', async e => {
    role = 'nuevo';
    currentDocumentId = null;
    let titulo = document.getElementById('modal-title');
    titulo.innerHTML = `Nuevo ${currentCollection.titulo}`;
    renderModalEditor(currentKeys);

})

document.getElementById('listDocuments').addEventListener('click', async e => {
    activeButtons({ btnSel: false, btnV: false, btnE: false, btnG: false });
    workFilter.currentPage = 1;
    let m = e.target.getAttribute('_modelo');
    let t = e.target.getAttribute('_titulo');
    currentCollection = { "titulo": t, "modelo": m };
    workFilter.modelo = m;
    let boton = document.getElementById('btnChose');
    boton.innerHTML = t;
    workFilter.filterStatus = 'off';
    showAlertFilter();
    setFilter();
    loadFilter();
    await renderTable();
    await footer();
    renderFilter();
    paintFilter();
    processDataPdf(currentContent);
    addItemList('listFilterData', keysAndTypes, 'campo', 'campo', 'drop-filter');
    addItemList('listGroupData', keysAndTypes, 'campo', 'campo', 'drop-group');
    

})

document.getElementById('bodyContainer').addEventListener('dblclick', async e => {
    let idt = e.target.getAttribute('_id');
    userId = idt;
    role = 'edit';
    currentDocumentId = idt;
    let titulo = document.getElementById('modal-title');
    titulo.innerHTML = `Editar ${currentCollection.titulo}`;
    renderModalEditor(currentKeys);

});

document.getElementById("btn_reset").addEventListener('click', async e => {
    result = window.confirm('Seguro que desea cambiar el PASSWORD?');
    if (!result) return;
    const res = await fetch('/core/reset-pass', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ "_id": userId })
    });
    const data = await res.json();
    toastr.success(data);
    $('#modalEditor').modal('hide');

});



//=========================== FUNCTIONS =============================================

function fillDesign() {
    const formSection = document.getElementById('formDesign');
    const inputs = formSection.querySelectorAll('input, select');

    inputs.forEach(input => {
        const fieldName = input.name;
        const fieldValue = localDesign.pagina[fieldName];
        //console.log(fieldValue)
        if (fieldValue !== undefined) {
            if (input.type === 'checkbox') {
                input.checked = fieldValue;
            } else {
                input.value = fieldValue;
            }
        }
    });
    //const listSections = ['headerReport', 'headerPage', 'headerGroup']
    listSections.forEach((section, index) => {
        if (localDesign.hasOwnProperty(section) && Array.isArray(localDesign[section])) {
            const container = 'acc-' + section;
            document.getElementById(container).innerHTML = '';
            localDesign[section].forEach((item, i) => {
                const value = item.texto || '';
                renderInputs(container, i, section, value);
            });
        } else {
            console.log(`La sección "${section}" no existe en localDesign.`);
        }
    });
}


function activeButtons(config) {
    const btnSel = document.getElementById('in-template');
    const btnV = document.getElementById('btnVerpdf');
    const btnE = document.getElementById('btnEditarTemplate');
    const btnG = document.getElementById('btnGuardarTemplate');
    btnSel.style.display = config.btnSel ? '' : 'none';
    btnV.style.display = config.btnV ? '' : 'none';
    btnE.style.display = config.btnE ? '' : 'none';
    btnG.style.display = config.btnG ? '' : 'none';
    //btnC.textContent = `Cancelar ${esPedido ? 'Pedido' : 'Averia'}`
}

async function init() {
    document.getElementById('title-main').innerHTML = 'Editor';

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
    backFilter.group = 'itemspp';
    backFilter.datepp = formatDate(new Date());
    backFilter.keyGroup = 'createdAt'
    //backFilter.keyGroup = 'delivery';


    await loadList();
    debugg(true);
};

async function debugg(activate = false) {
    if (activate) {
        console.warn('RECUERDA DESACTIVAR debugg()');
        
        backFilter.limitar = 15;
        activeButtons({ btnSel: true, btnV: false, btnE: false, btnG: false });
    workFilter.currentPage = 1;
    let m = 'Order';
    let t = 'Ordenes ca';
    currentCollection = { "titulo": t, "modelo": m };
    workFilter.modelo = m;
    let boton = document.getElementById('btnChose');
    boton.innerHTML = t;
    workFilter.filterStatus = 'off';
    
    backFilter.otrosMatch = [{state:0 }];
    showAlertFilter();
    setFilter();
    loadFilter();
    await renderTable();
    await footer();
    renderFilter();
    paintFilter();
    processDataPdf(currentContent);
    addItemList('listFilterData', keysAndTypes, 'campo', 'campo', 'drop-filter');
    addItemList('listGroupData', keysAndTypes, 'campo', 'campo', 'drop-group');
    addItemList('listOrderData', keysAndTypes, 'campo', 'campo', 'drop-order');
    
    addOptionsSelect('in-originControl', keysAndTypes, 'campo', 'campo');


    let res = await fetch('/domain/templates-list', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
            "modelo": currentCollection.modelo,
            fx: 'list'
        })
    });
    listTemplates = await res.json();
    if (listTemplates.fail) {
        toastr.error(listTemplates.message);
        return;
    }

    listTemplates.forEach(item => {
        item.descripcion = `${item.idTemplate}: ${item.descripcion}`
    })
    addOptionsSelect('in-template', listTemplates, 'idTemplate', 'descripcion')




    

    }
}

function afterLoad() {
    fadeInputs();
    activeButtons({ btnSel: true, btnV: true, btnE: true, btnG: true });
    selectedTemplate = 0;
};

async function renderTable() {
    
    let response = await fetch("/core/keys", {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ 'modelo': workFilter.modelo })
    })
    let data = await response.json();
    if (data.message) {
        toastr.error(data.message);
        return;
    }
    currentKeys = data;

    const container = document.getElementById('encabezado');
    container.innerHTML = '';

    data.forEach(columna => {
        const th = document.createElement('th');
        th.innerHTML = `
            ${columna.alias}                
        `;
        container.appendChild(th);
    });

    //crea la cuadricula con los datos:
    workFilter.funcion = 'content';
    response = await fetch("/core/editor-content", {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(workFilter)
    })
    const dataList = await response.json();
    sizeCollection = dataList[0].countTotal;
    dataList.shift();
    if (data.fail) {
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
    dataList.forEach(item => {
        let filaContainer = document.getElementById(item._id);
        filaContainer.innerHTML = '';
        data.forEach(columna => {

            let codigo = `item.${columna.campo}`;  //concatena las dos referencias y eval() lo convierte en linea de codig
            const td = document.createElement('td');
            td.setAttribute('_id', item._id);
            if (columna.tipo == 'boolean') {
                if (eval(codigo)) {
                    td.innerHTML = `Si`;
                }
                else {
                    td.innerHTML = `No`;
                }
            } else {
                td.innerHTML = `${eval(codigo)}`;
            }


            filaContainer.appendChild(td);
        })
    })

}

async function loadList() {
    let listaEditables = await fetch("/core/list-collections");
    listaEditables = await listaEditables.json();
    const container = document.getElementById('listDocuments');
    container.innerHTML = '';
    listaEditables.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
        <a _modelo="${item.modelo}" _titulo="${item.titulo}" class="dropdown-item" href="#">${item.titulo}</a>
        `;
        container.appendChild(li);
    })
}




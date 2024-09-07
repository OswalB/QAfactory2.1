let currentCollection, listTemplates, selectedTemplate, currentInput = {};
const defaults = {
    col: 12,
    height: 15,
    siBorde: true,
    align: 0,
    sizeFont: 11,
    paddingX: 2,
    paddingY: 0
}
document.getElementById("accordionDesign").addEventListener('click', async e => {
    const role = e.target.getAttribute('role');
    //const index = parseInt(e.target.getAttribute('data-index'));
    const section = e.target.getAttribute('data-section');

    if (role === 'addHeaderReport') {
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
        } else {
            console.log('No hay inputs para eliminar.');
        }

    }

})

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
                    if (bloquear) element.value = '';
                }
            } else {
                const sectionArray = localDesign[currentInput.section];  // Verifica si la sección existe
                if (Array.isArray(sectionArray) && sectionArray[currentInput.index] && sectionArray[currentInput.index].hasOwnProperty(element.name)) {
                    const valor = sectionArray[currentInput.index][element.name];
                    if (element.type === 'checkbox') {
                        element.checked = valor;
                    } else {
                        element.value = valor?valor:defaults[element.name];
                    }         
                } else {
                    console.log(`No se encontró el valor para la sección: ${currentInput.section}, índice: ${currentInput.index}, nombre: ${element.name}`);
                }

            }
            
        }


    });
}

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
    console.log(localDesign);

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

            console.log(localDesign);
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
    const listSections = ['headerReport', 'headerPage', 'headerGroup']
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

};

function afterLoad() {
    fadeInputs();
    activeButtons({ btnSel: false, btnV: false, btnE: false, btnG: false });
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




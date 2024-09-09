var currentKeys = [], backFilter = {}, workFilter = {}, tgg = true, role, sizeCollection, localDesign = { pagina: {} };
let k_filterBy, k_filterTxt, k_limitar, k_max, k_min, k_saltar;
let k_datemax, k_datemin, k_sortBy, k_sortOder, k_valorBoolean
let k_group, k_datepp;



document.addEventListener('DOMContentLoaded', async () => {

    k_filterBy = document.getElementById('in-filterBy');
    k_filterTxt = document.getElementById('in-filterTxt');
    k_limitar = document.getElementById('in-limitar');
    k_max = document.getElementById('in-max');
    k_min = document.getElementById('in-min');
    k_datemin = document.getElementById('in-datemin');
    k_datemax = document.getElementById('in-datemax');
    k_sortBy = document.getElementById('in-sortBy');
    k_checkAsc = document.getElementById('checkAsc');
    k_checkDsc = document.getElementById('checkDsc');
    k_valorBoolean = document.getElementById('in-valorBoolean');
    k_group = document.getElementById('in-group');
    k_datepp = document.getElementById('in-datepp');

    workFilter.filterStatus = 'off';
    workFilter.currentPage = 1;

    await init();
    await renderFilter();
    setFilter();
    paintFilter();
    loadFilter();
    await renderTable();
    await footer();
    afterLoad();

})

document.getElementById('pagination_container').addEventListener('click', async e => {
    let i = e.target.getAttribute('_id');
    workFilter.currentPage = i ? i : 1;
    workFilter.saltar = (workFilter.currentPage - 1) * workFilter.limitar;
    await renderTable();
    await footer(i);

})

document.getElementById('alertFilter').addEventListener('click', async (e) => {
    const frole = e.target.getAttribute('id');

    if (frole === 'alertCancelar') {
        setFilter();
        refreshFilter('off')
    } else if (frole === 'alertAplicar') {
        refreshFilter('active')
    }


});

async function refreshFilter(strFilterStatus) {
    workFilter.currentPage = 1
    workFilter.filterStatus = strFilterStatus;
    loadFilter();

    await renderTable();
    await footer();
    paintFilter();
    showAlertFilter();
}

document.getElementById('form-filtro').addEventListener('change', async e => {
    workFilter.filterStatus = 'change';
    showAlertFilter();
    paintFilter();

});

function paintFilter() {
    const filtroPor = currentKeys.find(actuales => actuales.campo === k_filterBy.value);

    const tipoSelected = filtroPor ? filtroPor.tipo : '0';
    const tipoEstiloMap = {
        '0': ['none', 'none', 'none', 'none', 'none', 'none'],
        'string': ['block', 'none', 'none', 'none', 'none', 'none'],
        'number': ['none', 'block', 'block', 'none', 'none', 'none'],
        'boolean': ['none', 'none', 'none', 'block', 'none', 'none'],
        'date': ['none', 'none', 'none', 'none', 'block', 'block']
    };

    const [filterTxtStyle, minStyle, maxStyle, valorBooleanStyle, dateminStyle, datemaxStyle] = tipoEstiloMap[tipoSelected];

    k_filterTxt.style.display = filterTxtStyle;
    k_min.style.display = minStyle;
    k_max.style.display = maxStyle;
    k_valorBoolean.style.display = valorBooleanStyle;
    k_datemin.style.display = dateminStyle;
    k_datemax.style.display = datemaxStyle;

    if (k_group.value === 'itemspp') {
        k_limitar.style.display = 'block';
        k_datepp.style.display = 'none'
    } else {
        k_limitar.style.display = 'none';
        k_datepp.style.display = 'block'
    }
}

async function renderFilter() {

    addOptionsSelect('in-sortBy', currentKeys, 'campo', 'alias');
    addOptionsSelect('in-filterBy', currentKeys, 'campo', 'alias');

}

function addOptionsSelect(selectId, keys, valueKey, labelKey) {
    const container = document.getElementById(selectId);
    container.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.setAttribute("value", 0);
    defaultOption.textContent = 'Ninguno';
    container.appendChild(defaultOption);
    keys.forEach(item => {
        const option = document.createElement('option');
        option.setAttribute("value", item[valueKey]);
        option.textContent = item[labelKey];
        container.appendChild(option);
    });
}

/*
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

function addOptions(selectId, keys) {
    const container = document.getElementById(selectId);
    container.innerHTML = '';
    const op = document.createElement('option');
    container.appendChild(op);

    keys.forEach(item => {
        const op = document.createElement('option');
        op.setAttribute("value", item.campo);
        op.innerHTML = item.alias;
        container.appendChild(op);
    });
}
*/

function setFilter() {

    k_filterBy.value = backFilter.filterBy;
    k_filterTxt.value = backFilter.filterTxt;
    k_limitar.value = backFilter.limitar;
    k_max.value = backFilter.max;
    k_min.value = backFilter.min;
    k_datemax.value = backFilter.datemax;
    k_datemin.value = backFilter.datemin;
    workFilter.saltar = backFilter.saltar;
    workFilter.indSort = backFilter.indSort || 0;
    k_sortBy.value = backFilter.sortBy;
    k_checkAsc.checked = backFilter.sortOrder === 1;
    k_checkDsc.checked = backFilter.sortOrder === -1;
    k_valorBoolean.value = backFilter.valorBoolean;
    k_group.value = backFilter.group;
    k_datepp.value = backFilter.datepp;


}

function loadFilter() {

    workFilter.filterBy = k_filterBy.value === '0' ? '' : k_filterBy.value;
    workFilter.filterTxt = k_filterTxt.offsetParent ? k_filterTxt.value : '';
    workFilter.limitar = parseInt(k_limitar.value);
    workFilter.datepp = k_datepp.value;
    workFilter.group = k_group.value;
    workFilter.max = k_max.offsetParent ? parseInt(k_max.value) : '';
    workFilter.min = k_min.offsetParent ? parseInt(k_min.value) : '';
    workFilter.datemax = k_datemax.offsetParent ? k_datemax.value : '';
    workFilter.datemin = k_datemin.offsetParent ? k_datemin.value : '';
    workFilter.sortObject = { [k_sortBy.value]: k_checkAsc.checked ? 1 : -1 }
    if (k_sortBy.value === '0') workFilter.sortObject = {};
    workFilter.valorBoolean = k_valorBoolean.offsetParent ? k_valorBoolean.value : '';
    workFilter.otrosMatch = backFilter.otrosMatch;
    workFilter.proyectar = backFilter.proyectar;

    if (k_group.value === 'itemspp') {
        workFilter.keyGroup = '';
        workFilter.limitar = parseInt(k_limitar.value);
    }

    if (k_group.value === 'diapp') {
        workFilter.datemax = k_datepp.value;
        workFilter.datemin = k_datepp.value;
        workFilter.keyGroup = backFilter.keyGroup;
        workFilter.limitar = 0;
    }

    if (k_group.value === 'semanapp') {
        const range = getRange('ww', k_datepp.value);
        workFilter.datemax = range.end;
        workFilter.datemin = range.start;
        workFilter.keyGroup = backFilter.keyGroup;
        workFilter.limitar = 0;
    }

    if (k_group.value === 'mespp') {
        const range = getRange('mm', k_datepp.value);
        workFilter.datemax = range.end;
        workFilter.datemin = range.start;
        workFilter.keyGroup = backFilter.keyGroup;
        workFilter.limitar = 0;
    }

}

function applyValidation() {
    let validate = true
    const form = document.querySelector('.needs-validation');
    if (form.checkValidity()) {
        // El formulario es válido, puedes realizar acciones aquí

    } else {
        validate = false;
        // El formulario no es válido, aplicar estilos de validación
        form.classList.add('was-validated');
    }
    return validate;

}



document.getElementById("btn_borrar").addEventListener('click', async e => {
    const result = window.confirm('Seguro que desea BORRAR el documento?');

    if (!result) {
        return;
    }

    try {
        const objeto = {
            _id: currentDocumentId,
            modelo: currentCollection.modelo
        };

        const res = await fetch('/core/document', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: "DELETE",
            body: JSON.stringify(objeto)
        });

        const data = await res.json();

        if (data.fail) {
            return;
        }
        toastr.info(data.message);
        $('#modalEditor').modal('hide');
        renderTable();
    } catch (error) {
        // Manejar el error de manera adecuada
    }
});


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


document.getElementById('btn-refrescar').addEventListener('click', async e => {

    refreshFilter('active');

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

//-------------------------- FUNCIONES GENERALES  --------------------------------------

function formatDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return `${year}-${month}-${day}`;
}

function getRange(type, dateString) {
    const fechaConvertida = dateString.replace(/-/g, '/');
    const date = new Date(fechaConvertida);
    let start, end;

    if (type === 'ww') {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        start = new Date(date.setDate(diff));
        end = new Date(start);
        end.setDate(start.getDate() + 6);   // deberia ser 6 no 5, pero es necesario restar 1 dia a 'end'
    } else if (type === 'mm') {
        start = new Date(date.getFullYear(), date.getMonth(), 1);
        end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    } else {
        return 'Tipo no válido';
    }

    return {
        start: formatDate(start),
        end: formatDate(end)
    };
}

function formatDateAgo(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `Hace ${diffDays} dia${diffDays === 1 ? '' : 's'}`;
}

//-------------------------- PAGINATION AND FILTER  --------------------------------------

async function footer(npage) {
    let winL, winR, winMax;
    let pags = Math.ceil(sizeCollection / (workFilter.limitar === 0 ? sizeCollection : workFilter.limitar)) - 1;
    if (sizeCollection % workFilter.limitar != 0) { pags += 1; }
    document.getElementById('lbl_results').innerHTML = `Resultados: ${sizeCollection}`;
    const pagContainer = document.getElementById('pagination_container');
    pagContainer.innerHTML = '';
    if (workFilter.currentPage < (pags - 2)) { winL = workFilter.currentPage - 2; }
    else { winL = pags - 5; }
    if (winL < 2 || pags < 8) { winL = 2; }
    winR = winL + 4;
    if (winR > (pags - 1)) { winR = pags - 1 }
    if (pags > 0) { this.addPag(pagContainer, 1, workFilter.currentPage); }
    if (winL > 2) { this.addPag(pagContainer, 0, workFilter.currentPage); }
    for (let i = winL; i <= winR; i++) {
        this.addPag(pagContainer, i, workFilter.currentPage);
    }
    if (pags - winR > 1) { this.addPag(pagContainer, 0, workFilter.currentPage); }
    if (pags > 1) { this.addPag(pagContainer, pags, workFilter.currentPage); }
}

function addPag(pagContainer, i) {

    const lipag = document.createElement('li');
    let clase = 'page-item';
    if (i == workFilter.currentPage) { clase += ' active'; }
    lipag.setAttribute('class', clase);
    if (i == 0) {
        lipag.innerHTML = `<label class="px-2"> ... </label>`;
    } else {
        lipag.innerHTML = `<a class="page-link " _id=${i} href="#" id="page${i}">${i}</a>`;
    }
    pagContainer.appendChild(lipag);
}

function fadeInputs() {
    const fadeInputs = document.querySelectorAll('.fade-input');

    fadeInputs.forEach(input => {
        input.addEventListener('input', () => {
            input.classList.add('changed'); // Aplica el color de fondo cambiado
            clearTimeout(input.fadeTimeout); // Cancela el timeout anterior (si existe)
        });

        input.addEventListener('blur', () => {
            input.fadeTimeout = setTimeout(() => {
                input.classList.remove('changed'); // Remueve el color de fondo cambiado después de un tiempo
            }, 3000);
        });
    });

}

async function renderModalEditor(currentk) {
    const cambio = document.getElementById('btn_reset');
    cambio.style.display = currentCollection.modelo === 'User' ? '' : 'none';

    const ind = role === 'edit' ? currentContent.findIndex(content => content._id === currentDocumentId) : 0;
    document.getElementById('btn_borrar').style.display = role === 'edit' ? '' : 'none';

    const bodyTable = document.getElementById('bodyTable');
    bodyTable.innerHTML = '';

    currentk.forEach(item => {
        const contenido = role === 'edit' ? currentContent[ind][item.campo] : (item.default !== undefined ? item.default : '');

        const inputType = getInputType(item.tipo);
        const inputClass = getInputClass(item.tipo);

        const tr = document.createElement('tr');
        const tdLabel = document.createElement('td');
        tdLabel.innerHTML = `<span class="input-group-text" id="addon-wrapping">${item.alias}:</span>`;
        tr.appendChild(tdLabel);

        const tdInput = document.createElement('td');
        const input = document.createElement(inputType === 'select' ? 'select' : 'input');
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
        invalidFeedback.textContent = item.failMsg || 'Campo Requerido';
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
        case 'select':
            return 'select';
    }
}

function getInputClass(tipo) {
    switch (tipo) {
        case 'boolean':
            return 'form-check-input';
        case 'select':
            return 'form-select'
        default:
            return 'form-control'
    }
}

async function checkAnswerServer(url, _metod, _body, timeout = 5000) {
    const requestPromise = new Promise((resolve, reject) => {
        fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: _metod,
            body: JSON.stringify(_body)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error al recibir la respuesta del servidor');
                }
                resolve(response); // Resuelve la promesa con true si la respuesta es exitosa
            })
            .catch(error => {
                reject(error); // Rechaza la promesa con el error si hay un problema con la solicitud
            });
    });

    // Promesa para manejar el tiempo de espera (timeout)
    const timeoutPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
            reject(new Error('Tiempo de espera agotado')); // Rechaza la promesa si el tiempo de espera se agota
        }, timeout);
    });

    // Ejecutar ambas promesas simultáneamente usando Promise.race
    return Promise.race([requestPromise, timeoutPromise])
        .then(resultado => {
            return resultado; // Retorna el resultado (true o false)
        })
        .catch(error => {
            throw error; // Lanza el error si ocurre alguno
        });
}

let doc;

async function generarPDF(design, data) {
    doc = new jsPDF({
        orientation: design.pagina.orientation,
        unit: 'pt',
        format: design.pagina.size
    });
    const pageSize = doc.internal.pageSize;
    const page = {
        ml: mmToPt(design.pagina.ml),
        mr: mmToPt(design.pagina.mr),
        mt: mmToPt(design.pagina.mt),
        mb: mmToPt(design.pagina.mb),
        pw: Math.round(pageSize.getWidth()),
        ph: Math.round(pageSize.getHeight())
    }
    page.sw = Math.round(page.pw - page.ml - page.mr);   //ancho del espacio imprimible
    page.sh = Math.round(page.ph - page.mt - page.mb);
    page.centerX = (page.sw / 2) + page.ml;
    page.ymax = page.ph - page.mb;
    page.colpt = Math.round(page.sw / 12)-0.5;
    page.maxR =page.pw - page.mr;
    page.maxY =page.ph - page.mt;
    let curry = page.mt, currx = page.ml;
    let px = page.ml, py = page.mt;

    doc.text(5, 15, 'v1.007');
    doc.rect(page.ml, page.mt, page.sw, page.sh);

    const listSections = ['headerReport', 'headerPage', 'headerGroup'];

    listSections.forEach(section => {
        if (!Array.isArray(design[section])) {
            console.log(`Sección ${section} no es un array válido. Continuando...`);
            return;
        }
        let maxHeight = 0;
        design[section].forEach(item => {

            let col = Math.max(1, Math.min(12, parseInt(item.col)));
            const width = col * page.colpt;
            const height = parseInt(item.height);
            const align = parseInt(item.align);
            const fontSize = parseInt(item.sizeFont);
            const paddingX = parseInt(item.paddingX);
            const paddingY = parseInt(item.paddingY);
            ({ px, py, maxHeight } = testWidth(px, py, width, page.maxR, page.ml, maxHeight));
            maxHeight = height > maxHeight ? height : maxHeight;
            let lineY = py + fontSize + paddingY;

            doc.setTextColor(item.colorFont);
            doc.setFontSize(fontSize);
            const lines = doc.splitTextToSize(item.texto, width - (paddingX * 2));
            if (item.siBorde) {
                doc.rect(px, py, width, height);
            }

            lines.forEach(fila => {
                const textWidth = doc.getTextWidth(fila);
                let lineX = alinear(px, paddingX, width, align, textWidth);
                doc.text(lineX, lineY, fila);
                lineY += fontSize;
            })

            px += width;
        })
        px = page.ml
        py += maxHeight;
        maxHeight = 0
    })
    const out = doc.output();
    const url = 'data:application/pdf;base64,' + btoa(out);
    const iframe = "<iframe width='100%' height='100%' src='" + url + "'></iframe>";
    const x = window.open();
    x.document.open();
    x.document.write(iframe);
    x.document.close();
}

function testWidth(px, py, width, maxR, ml, maxHeight) {
    if ((px + width) > maxR) {
        return { px: ml, py: py + maxHeight, maxHeight: 0 }
    } else {
        return { px, py, maxHeight }
    }
}

function alinear(x, padding, space, fx, textWidth) {
    if (fx === 0) return x + padding;
    if (fx === 1) return x + (space - textWidth) / 2;
    if (fx === 2) return x + space - textWidth - padding;
    return x;
}

function mmToPt(mm) {
    const ptPerMm = 2.83465;
    return Math.round(mm * ptPerMm);
}
// +***********  FUNCIONES DE PRUEBA

function unwind(data, parentKey = '', result = [], fields = new Map()) {
    if (Array.isArray(data)) {
        data.forEach((item, index) => {
            const newKey = parentKey ? `${parentKey}.${index}` : `${index}`;
            unwind(item, newKey, result, fields);
        });
    } else if (typeof data === 'object' && data !== null) {
        Object.keys(data).forEach(key => {
            const newKey = parentKey ? `${parentKey}.${key}` : key;

            // Agregar campo y su tipo de datos
            if (!fields.has(key)) {
                fields.set(key, typeof data[key]);
            }

            unwind(data[key], newKey, result, fields);
        });
    } else {
        result.push({ key: parentKey, value: data });
    }

    // Convertir el Map a un array de objetos con nombre y tipo
    const fieldsArray = Array.from(fields, ([name, type]) => ({ name, type }));
    return { result, fields: fieldsArray };
}











/*function unwind2(data, parentKey = '', result = []) {
    if (Array.isArray(data)) {
        data.forEach((item, index) => {
            const newKey = parentKey ? `${parentKey}.${index}` : `${index}`;
            unwind(item, newKey, result);
        });
    } else if (typeof data === 'object' && data !== null) {
        Object.keys(data).forEach(key => {
            const newKey = parentKey ? `${parentKey}.${key}` : key;
            unwind(data[key], newKey, result);
        });
    } else {
        result.push({ key: parentKey, value: data });
    }
    return result;
}*/

function generate(data, groupBy, fields) {
    const tables = {};

    data.forEach(item => {
        const groupKey = item[groupBy]; // Agrupar por el criterio recibido

        // Si no existe la tabla para este grupo, se crea
        if (!tables[groupKey]) {
            tables[groupKey] = [];
        }

        // Desenrr el array de elementos que contiene el grupo (puede ser productos, pedidos, etc.)
        const arrayToUnwind = item[fields.nestedArray]; // Nombre del campo anidado que contiene los detalles (ej: 'productos')

        if (Array.isArray(arrayToUnwind)) {
            arrayToUnwind.forEach(element => {
                const row = { [groupBy]: groupKey };

                // Mapear los campos clave del elemento actual a la tabla
                fields.columns.forEach(field => {
                    row[field.label] = element[field.key];
                });

                tables[groupKey].push(row);
            });
        }
    });

    return tables;
}







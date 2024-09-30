var currentKeys = [], backFilter = {}, workFilter = {}, tgg = true, role, sizeCollection;
let k_filterBy, k_filterTxt, k_limitar, k_max, k_min, k_saltar;
let k_datemax, k_datemin, k_sortBy, k_sortOder, k_valorBoolean
let k_group, k_datepp


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
    await afterLoad();

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
    const tempKey = [...currentKeys]
    tempKey.unshift({ campo: '0', alias: '<Ninguno>', });

    addOptionsSelect('in-sortBy', tempKey, 'campo', 'alias');
    addOptionsSelect('in-filterBy', tempKey, 'campo', 'alias');

}

function addOptionsSelect(selectId, keys, valueKey, labelKey, firstDisabled = false) {
    const container = document.getElementById(selectId);
    container.innerHTML = '';
    keys.forEach((item, index) => {
        const option = document.createElement('option');
        option.setAttribute("value", item[valueKey]);
        option.textContent = item[labelKey];
        if (index === 0) {
            option.disabled = firstDisabled;
            option.selected = true;
        }
        container.appendChild(option);
    });
}

function addItemList(selectId, keys, valueKey, labelKey, clase) {
    const container = document.getElementById(selectId);
    container.innerHTML = '';
    keys.forEach(item => {
        const option = document.createElement('li');
        option.innerHTML = `<a class="dropdown-item ${clase}" href="#">${item[labelKey]}</a>`;
        container.appendChild(option);
    });
}


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



    //debugg:



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


//-------------------------- pdf geneator  --------------------------------------












function renglonBORRAR(design, data, page, pty, indexPage) {
    //console.log(design[0].originControl , design[0].texto);
    //console.log(design, data)
    let sumW = 0, filas = 0, startRow = true;
    let printStatus = priorityPrint('nextItem', -2);
    design.forEach(item => {    //add info ancho de control, fila-multilinea, y espacio interno
        const paddingX = parseInt(item.paddingX);
        const paddingY = parseInt(item.paddingY);
        const fontSize = parseInt(item.sizeFont);
        const height = parseInt(item.height);
        item.width = r2d(item.col * page.colpt, 2);
        sumW += item.width;
        item.startRow = startRow;

        if (sumW > (page.sw * 1.01)) {          //establece nueva linea
            sumW = item.width;
            filas += 1;
            item.startRow = true;
        }
        startRow = false;
        item.fila = filas;
        item.sw = item.width - paddingX - paddingX;
        doc.setFontSize(fontSize);

        /*if (item.formatControl != '0' || item.formatControl) {        //formato en texto origen
            //item.texto = formatearDato(item.texto,item.formatControl);
        }*/
        //log('data para formatear:', data);
        //console.log('design para formatear:', item);
        //console.log('texto antes de proceso:', item.texto)
        const hayFormulas = data.formulas && typeof data.formulas === 'object' && Object.keys(data.formulas).length > 0;
        //console.warn('hayFormulas:', hayFormulas);
        //console.log(data.formulas, typeof data.formulas === 'object')
        if (hayFormulas && item.originControl && !data._endGroup) {
            console.log(hayFormulas, item.originControl, !data._endGroup)
            console.warn('hay formulas y es ultimo renglon, texto antes fx:', item.texto)
            const formula = `${item.fxControl}_${item.originControl}`;
            const valorFx = data.formulas[formula];
            item.texto = valorFx
            //console.log('hay formulas y es ultimo renglon, texto despues fx:', item.texto)
        } else if (item.originControl && !hayFormulas) {
            //console.log('solo es origin control, texto antes :', item.texto)

            item.texto = data[item.originControl] || '';
            //console.log('solo es origin control, texto despues :', item.texto)

        }
        //console.log('en todos los casos, texto antes de format :', item.texto)
        if (item.formatControl) {
            item.texto = formatearDato(item.texto, item.formatControl);
        }
        if (!item.texto) console.warn('UNDEF...')
        //console.log('en todos los casos, texto despues de format :', item.texto)
        //console.log('FIN de formateo datos')
        /*if (!item.hasOwnProperty('originControl')) {
            item.originControl = '0';
        }*/

        //item.originControl = item.originControl ? item.originControl : '0';
        //console.log(data._endGroup, data.formulas);
        //let cadena;
        /*if (data.formulas && !data._endGroup) {
            const formula = `${item.fxControl}_${item.originControl}`;
            const valorFx = data.formulas[formula];
            console.log(formula, valorFx)
            cadena = item.originControl === '0' ? item.texto : valorFx || '';

        } else {
            cadena = item.originControl === '0' ? item.texto : data[item.originControl] || item.texto;
        }*/

        item.lineas = doc.splitTextToSize(String(item.texto), item.sw);
        item.lineH = r2d(fontSize, 2);
        const newH = (item.lineas.length * item.lineH) + paddingY + r2d(fontSize * 0.25, 2);
        item.height = newH > height ? newH : height;
    })


    maxHeightRow(design);

    let rowX = page.ml, rowY = pty        //copia (x,y) iniciales
    let carry = 0;
    let totalHeight = 0;
    design.forEach((item, index) => {
        if (item.startRow) {
            totalHeight += item.height;
        }
    })
    if (rowY + totalHeight > (page.maxY * 1.02)) {       //desborde de pagina
        //console.log(rowY + totalHeight, page.maxY, (page.maxY * 1.01))
        //console.log('**** Rechazado: ', design, data);
        return {
            absY: page.mt,
            indexPage: indexPage + 1,
            printStatus: priorityPrint('newPage', printStatus)
        };
    }
    design.forEach((item, index) => {    //push campo texto y caja
        const paddingY = parseInt(item.paddingY);
        const paddingX = parseInt(item.paddingX);
        const align = parseInt(item.align);
        const fontSize = parseInt(item.sizeFont);
        if (item.startRow || item.forceNewRow) {            //nuevo renglon
            rowY += carry;
            rowX = page.ml;
        }
        let lineY = rowY + item.lineH + paddingY;
        doc.setFontSize(fontSize);
        item.lineas.forEach(linea => {
            const textWidth = r2d(doc.getTextWidth(linea), 2);
            const lineX = alinear(rowX, paddingX, item.width, align, textWidth);

            addElementToJsonPDF('text', {
                x: lineX,
                y: lineY,
                sf: parseInt(item.sizeFont),
                cf: item.colorFont,
                tx: linea
            }, indexPage);

            lineY += item.lineH;
        });

        if (item.siBorde || item.siBg) {
            const fillBox = item.siBorde && item.siBg ? 'FD' : item.siBg ? 'F' : 'S';
            addElementToJsonPDF('box', {
                x: rowX,
                y: rowY,
                wb: item.width,
                hb: item.height,
                fll: fillBox,
                cb: item.colorBg
            }, indexPage);
        }
        rowX += item.width;
        carry = item.height;
    })
    //console.log(data._endGroup)
    if (data._endGroup) {
        console.warn('EndGroup fin de function renglon')
        data._endGroup = false;
        printStatus = priorityPrint('endGroup', printStatus)
    }
    return { absY: rowY + carry, indexPage: indexPage, printStatus: printStatus };

}







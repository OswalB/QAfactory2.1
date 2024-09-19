var currentKeys = [], backFilter = {}, workFilter = {}, tgg = true, role, sizeCollection, localDesign = { pagina: {} };
let k_filterBy, k_filterTxt, k_limitar, k_max, k_min, k_saltar;
let k_datemax, k_datemin, k_sortBy, k_sortOder, k_valorBoolean
let k_group, k_datepp, dataUnwind = [], keysAndTypes = []; originData = [], jsonPDF = [];










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

let doc;

async function generarPDF(design) {
    doc = new jsPDF({
        orientation: design.pagina.orientation,
        unit: 'pt',
        format: design.pagina.size
    });

    jsonPDF = [];
    const pageSize = doc.internal.pageSize;
    const page = {
        ml: r2d(mmToPt(design.pagina.ml), 2),
        mr: r2d(mmToPt(design.pagina.mr), 2),
        mt: r2d(mmToPt(design.pagina.mt), 2),
        mb: r2d(mmToPt(design.pagina.mb), 2),
        pw: r2d(pageSize.getWidth(), 2),
        ph: r2d(pageSize.getHeight(), 2),
        sw: r2d(pageSize.getWidth() - mmToPt(design.pagina.ml) - mmToPt(design.pagina.mr), 2),
        sh: r2d(pageSize.getHeight() - mmToPt(design.pagina.mt) - mmToPt(design.pagina.mb), 2),
        centerX: r2d((pageSize.getWidth() - mmToPt(design.pagina.ml) - mmToPt(design.pagina.mr)) / 2 + mmToPt(design.pagina.ml), 2),

        colpt: r2d((pageSize.getWidth() - mmToPt(design.pagina.ml) - mmToPt(design.pagina.mr)) / 12, 2),
        maxR: r2d(pageSize.getWidth() - mmToPt(design.pagina.mr), 2),
        maxY: r2d(pageSize.getHeight() - mmToPt(design.pagina.mt), 2),
    };

    let px = page.ml;
    let py = page.mt;

    //printPattern(page.ml, page.colpt, page.mt, page.sh);

    doc.text(5, 15, 'v1.007');
    doc.rect(page.ml, page.mt, page.sw, page.sh);


    console.log(design);
    originData = [...dataUnwind];

    if (design.pagina.fieldFilter) {
        originData = filterArray(dataUnwind, design.pagina.fieldFilter);
    }
    if (design.pagina.fieldOrder) {
        originData = ordenarPorCampo(originData, design.pagina.fieldOrder);
    }
    if (design.pagina.fieldGroup) {
        originData = groupByField(originData, design.pagina.fieldGroup);
    } else {
        originData = groupByField(originData, design.pagina.fieldGroup);
    }


    const testPDF = [
        {
            text: [
                { x: 100, y: 120, sf: 10, cf: '#000000', tx: 'pag 1 primer texto' },
                { x: 100, y: 170, sf: 18, cf: '#880000', tx: 'pag 1 second texton para..' }
            ],
            box: [
                { x: 100, y: 100, wb: 88, hb: 25, fll: '', cb: '#888000' },
                { x: 100, y: 150, wb: 98, hb: 25, fll: '', cb: '#888000' }
            ]
        },
        {
            text: [
                { x: 200, y: 120, sf: 10, cf: '#000000', tx: 'textp segunda pagina' },
                { x: 200, y: 170, sf: 18, cf: '#880000', tx: 'second texton para.. pag 2' }
            ],
            box: [
                { x: 200, y: 100, wb: 88, hb: 25, fll: 'F', cb: '#008000' },
                { x: 200, y: 150, wb: 98, hb: 25, fll: 'F', cb: '#000090' }
            ]
        },
    ]



    const siPrint = {
        HR: true,
        HP: true,
        HG: true,
        HD: true,
        DD: true
    }

    Object.keys(originData).forEach(group => {
        console.log(`Grupo: ${group}`);
        console.log(py)
        let indexPage = 0;
        originData[group].forEach(item => {
            console.log(item)
            if (siPrint.HR) {
                ({py:py, indexPage: indexPage} = renglon(design.headerReport, item, page, px, py, indexPage));
                siPrint.HR = false;
            }
            if (siPrint.HP) {
                ({py:py, indexPage: indexPage} = renglon(design.headerPage, item, page, px, py, indexPage));
                siPrint.HP = false;
            }
            if (siPrint.HG) {
                ({py:py, indexPage: indexPage} = renglon(design.headerGroup, item, page, px, py, indexPage));
                siPrint.HG = false;
            }
            if (siPrint.HD) {
                ({py:py, indexPage: indexPage}  = renglon(design.headerDetail, item, page, px, py, indexPage));
                siPrint.HD = false;
            }
            if (siPrint.DD) {
                ({py:py, indexPage: indexPage}  = renglon(design.detail, item, page, px, py, indexPage));
                //siPrint.HD = false;
            }
        });
        
    });

    //console.log(JSON.stringify(jsonPDF, null, 2));
    console.log(jsonPDF);

    //return

    jsonPDF.forEach((pagina, index) => {
        if (index > 0) {
            newPage()
        }
        pagina.box.forEach(caja => {
            if (!caja.fll) return;
            doc.setFillColor(caja.cb);
            doc.rect(caja.x, caja.y, caja.wb, caja.hb, caja.fll);
        });
        pagina.text.forEach(texto => {
            doc.setTextColor(texto.cf);
            doc.setFontSize(texto.sf);
            doc.text(texto.tx, texto.x, texto.y)
        })
    })





    const out = doc.output();
    const url = 'data:application/pdf;base64,' + btoa(out);
    const iframe = "<iframe width='100%' height='100%' src='" + url + "'></iframe>";
    const x = window.open();
    x.document.open();
    x.document.write(iframe);
    x.document.close();



}

function renglon(design, data, page, px, py, indexPage) {
    console.log(design);
    console.log(data)
    let sumW = 0, filas = 0, startRow = true;
    design.forEach(item => {    //add info ancho de control, fila-multilinea, y espacio interno
        const paddingX = parseInt(item.paddingX);
        const paddingY = parseInt(item.paddingY);
        const fontSize = parseInt(item.sizeFont);
        const height = parseInt(item.height);
        const align = parseInt(item.align);
        item.width = r2d(item.col * page.colpt, 2);
        sumW += item.width;
        item.startRow = startRow;

        if (sumW > page.sw) {
            sumW = item.width;
            filas += 1;
            item.startRow = true;
        }
        startRow = false;
        item.fila = filas;
        item.sw = item.width - paddingX - paddingX;
        doc.setFontSize(fontSize);
        if (!item.hasOwnProperty('originControl')) {
            item.originControl = '0';
        }
        item.originControl = item.originControl ? item.originControl : '0';
        const cadena = item.originControl === '0' ? item.texto : data[item.originControl] || '';
        
        
        item.lineas = doc.splitTextToSize(String(cadena), item.sw);
        item.lineH = r2d(fontSize, 2);
        const newH = (item.lineas.length * item.lineH) + paddingY + r2d(fontSize * 0.25, 2);
        item.height = newH > height ? newH : height;
    })
    console.log(design)

    maxHeightRow(design)

    let rowX = px, rowY = py        //copia (x,y) iniciales
    let carry = 0;
    design.forEach((item, index) => {    //push campo texto y caja
        const paddingY = parseInt(item.paddingY);
        const paddingX = parseInt(item.paddingX);
        const align = parseInt(item.align);
        const fontSize = parseInt(item.sizeFont);
        if (item.startRow) {
            rowY += carry;
            rowX = px
        }
        let lineY = rowY + item.lineH + paddingY;
        doc.setFontSize(fontSize);

        if(rowY + carry > page.maxY){
            indexPage++;
            rowX = px, rowY = py
        }
        item.lineas.forEach(linea => {
            const textWidth = r2d(doc.getTextWidth(linea), 2);
            const lineX = alinear(rowX, paddingX, item.width, align, textWidth);

            addElementToJsonPDF('text', {
                x: lineX,
                y: lineY,
                sf: parseInt(item.sizeFont),
                cf: item.colorFont,
                tx: linea
            }, indexPage    );

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


    return {py:rowY + carry, indexPage: indexPage };

}

function maxHeightRow(items) {
    let filas = items.reduce((acc, item) => {
        if (!acc[item.fila]) {
            acc[item.fila] = [];
        }
        acc[item.fila].push(item);
        return acc;
    }, {});

    for (let fila in filas) {
        let maxHeight = Math.max(...filas[fila].map(item => item.height));
        filas[fila].forEach(item => {
            item.height = maxHeight;
        });
    }
}

function newPage() {
    console.log('codigo para una nueva pagina');
    doc.addPage();
}

function printBox(box, item, px, py) {
    if (item.siBorde) {
        doc.rect(px, py, box.width, box.height);
    }
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
    if (fx === 1) return r2d(x + ((space - textWidth) / 2), 2);
    if (fx === 2) return x + space - textWidth - padding;
    return x;
}

function mmToPt(mm) {
    const ptPerMm = 2.83465;
    return r2d(mm * ptPerMm, 2);
}

function r2d(num, decimals) {
    var factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
}
// +***********  FUNCIONES DE datos pdf


function processDataPdf(data) {
    unwind(data);
}

function unwind(data) {

    data.forEach(documento => {
        const jsonData = exploreObject(documento);
        const indexPadre = jsonData.reduce((minIdx, item, index) => {
            return (minIdx === -1 || item.parent.yo < jsonData[minIdx].parent.yo)
                ? index
                : minIdx;
        }, -1);
        const padre = jsonData[indexPadre].parent.yo;
        res = consolidar(jsonData, padre, indexPadre);
        dataUnwind = [...dataUnwind, ...res];
    })

    console.log(dataUnwind);
    keysAndTypes = getKeysAndTypes(dataUnwind);
    console.log(keysAndTypes);

}

function exploreObject(obj, idPadre, parentKey = '', accumulator = []) {
    if (typeof exploreObject.counter === 'undefined') {
        exploreObject.counter = 400;
    }
    exploreObject.counter++;
    let flat = {};
    const idYo = exploreObject.counter;
    if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
            exploreObject(item, idYo, parentKey, accumulator);
        });
    } else if (typeof obj === 'object' && obj !== null) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                const fullKey = parentKey ? `${parentKey}.${key}` : key;
                if (Array.isArray(obj[key]) || typeof obj[key] === 'object') {
                    exploreObject(obj[key], idYo, fullKey, accumulator);
                } else {
                    flat[fullKey] = obj[key];
                }
            }
        }
    }
    if (Object.keys(flat).length > 0) {
        accumulator.push({ datos: flat, parent: { cont: exploreObject.counter, yo: idYo, padre: idPadre - 1 } });
    }

    return accumulator;
}

function consolidar(arr, padre, indexPadre, accObject = {}, resultados = []) {
    let tieneHijos = false;

    arr.forEach(item => {
        if (item.parent.padre === padre) {
            tieneHijos = true;
            accObject = { ...accObject, ...item.datos };
            consolidar(arr, item.parent.yo, indexPadre, accObject, resultados);
        }
    });

    if (!tieneHijos) {
        accObject = { ...arr[indexPadre].datos, ...accObject };
        resultados.push(accObject);
    }

    return resultados;
}

function getKeysAndTypes(arr) {
    let keysAndTypes = [];

    arr.forEach(item => {
        Object.keys(item).forEach(key => {
            // Verificamos si la clave ya fue agregada
            if (!keysAndTypes.some(field => field.campo === key)) {
                keysAndTypes.push({
                    campo: key,
                    type: typeof item[key]
                });
            }
        });
    });

    keysAndTypes = ordenarPorCampo(keysAndTypes, 'campo', true);
    return keysAndTypes;
}

function groupByField(arr, field) {
    return arr.reduce((acc, item) => {
        const fieldValue = item[field];

        // Si el valor es nulo, undefined o vacío, lo agrupamos bajo una clave especial
        const key = fieldValue === undefined || fieldValue === null || fieldValue === '' ? 'empty' : fieldValue;

        if (!acc[key]) {
            acc[key] = [];
        }

        acc[key].push(item);
        return acc;
    }, {});
}

function filterArray(arr, condition) {

    const [field, operator, value] = condition.split(/(>=|<=|==|=|>|<)/).map(str => str.trim());
    return arr.filter(item => {
        if (!(field in item)) {
            return false;
        }

        let fieldValue = item[field];
        let conditionValue;

        if (typeof (fieldValue) === 'boolean') {
            conditionValue = value === 'true' ? true : false;
        } else if (!isNaN(value)) {
            conditionValue = parseFloat(value);
        } else {

            fieldValue = fieldValue.toString().toLowerCase();
            conditionValue = value.toLowerCase();
        }

        switch (operator) {
            case '=':
                if (typeof fieldValue === 'string') {
                    // Para cadenas, buscamos coincidencias parciales
                    return fieldValue.includes(conditionValue);
                } else {
                    return fieldValue == conditionValue;
                }
            case '==':
                if (typeof fieldValue === 'string') {
                    // Para cadenas, buscamos coincidencias parciales
                    return fieldValue == conditionValue;
                } else {
                    return fieldValue == conditionValue;
                }
            case '>':
                return fieldValue > conditionValue;
            case '<':
                return fieldValue < conditionValue;
            case '>=':
                return fieldValue >= conditionValue;
            case '<=':
                return fieldValue <= conditionValue;
            default:
                return false;
        }
    });
}

function ordenarPorCampo(arr, campo, ordenAscendente = true) {
    return arr.sort((a, b) => {
        if (typeof a[campo] === 'string') {
            // Comparación para strings
            return ordenAscendente
                ? a[campo].localeCompare(b[campo])
                : b[campo].localeCompare(a[campo]);
        } else {
            // Comparación para números u otros tipos de datos
            return ordenAscendente
                ? a[campo] - b[campo]
                : b[campo] - a[campo];
        }
    });
}

function addElementToJsonPDF(type, properties, pageIndex) {
    // Si la página no existe, la creamos
    if (!jsonPDF[pageIndex]) {
        jsonPDF[pageIndex] = { text: [], box: [] }; // Inicializamos con arrays vacíos para text y box
    }

    // Agregar el elemento al array correspondiente
    if (type === 'text') {
        jsonPDF[pageIndex].text.push({
            x: properties.x,
            y: properties.y,
            sf: properties.sf,
            cf: properties.cf,
            tx: properties.tx
        });
    } else if (type === 'box') {
        jsonPDF[pageIndex].box.push({
            x: properties.x,
            y: properties.y,
            wb: properties.wb,
            hb: properties.hb,
            fll: properties.fll,
            cb: properties.cb
        });
    }
}

function printPattern(marginL, wCol, marginT, spaceH) {

    doc.setLineWidth(1);
    doc.setDrawColor(255, 0, 0);
    y1 = marginT;
    y2 = marginT + spaceH;
    for (var filas = 0; filas < 12; filas++) {
        x1 = marginL + (filas * wCol)
        x2 = x1;
        console.log(x1, y1, x2, y2)
        doc.line(x1, y1, x2, y2);
    }
}

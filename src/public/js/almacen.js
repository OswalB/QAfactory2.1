let flags = {}, localInalmacen = [], timeoutId, currentUser = null;
let docIngreso = {}, opers, proveedores, insumos, criterios, pendientes = [];
const timeClear = 120000;

//* * * * * * * * * *    FUNCIONES  inicio * * * * *
async function afterLoad() {
    renderTable();
};

async function init() {
    document.getElementById('title-main').innerHTML = 'Despachos';

    backFilter.filterBy = '0';
    backFilter.filterTxt = '';
    backFilter.limitar = 12;
    backFilter.max = '';
    backFilter.min = '';
    backFilter.datemax = '';
    backFilter.datemin = '';
    backFilter.otrosMatch = [];
    backFilter.proyectar = [];
    backFilter.saltar = 0;
    backFilter.sortBy = 'fechaw';
    backFilter.sortOrder = -1;
    backFilter.valorBoolean = 'false';
    backFilter.group = 'itemspp';
    backFilter.datepp = formatDate(new Date());
    backFilter.keyGroup = 'createdAt';


    let response = await fetch("/domain/almacen/keys", {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({})
    })
    let data = await response.json();
    if (data.message) {
        toastr.error(data.message);
        return;
    }
    currentKeys = data;
    setPaso(0);
    //startPolling();
    document.getElementById('btnChose').style.display = 'none';
}

async function renderTable() {

    const res = await fetch("/domain/almacen/content", {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(workFilter)
    })
    const data = await res.json();
    sizeCollection = data[0].countTotal;
    data.shift();

    if (data.fail) {
        toastr.error('Reintente!', 'No se ha podido recibir.', 'Pedido');
        return false;
    }
    toastr.remove();
    localInalmacen = data;
    const container = document.getElementById('main_table');
    container.innerHTML = '';
    localInalmacen.forEach(item => {
        //console.log(item);
        const fechaIn = formatearDato(item.fechaw, 'dd/mm/aa');
        const vence = formatearDato(item.vence, 'dd/mm/aa');
        const tr = document.createElement('tr');
        //console.log(item);
        let agotado = 'No';
        if (item.agotado) agotado = 'Si';
        let facturado = 'No';
        if (item.facturada) facturado = 'Si';
        tr.innerHTML = `
        <td>${fechaIn}</td>
        <td>${item.nombreProveedor}</td>
        <td>${item.insumo.nombre} ${item.insumo.unidad}</td>
        <td>${item.cantidad}</td>
        <td>${item.lote}</td>
        <td>${vence}</td>
        <td>${item.acepta}</td>
        <td>${item.rechaza}</td>
        <td>${item.operario}</td>
        <td>${agotado}</td>
        <td>${facturado}</td>
    `;
        container.appendChild(tr);
    }
    );
}

//* * * * * * * * * *    FUNCIONES  Render * * * * *

document.getElementById('cardsContainer').addEventListener('change', async e => {
    let _id = e.target.getAttribute('_id');
    setColor(_id);
});

function setColor(_idb) {
    let tarjeta = document.getElementById(`card${_idb}`);
    let checkA = document.getElementById(`checkA${_idb}`);
    let checkR = document.getElementById(`checkR${_idb}`);
    let checkN = document.getElementById(`checkN${_idb}`);
    let title = document.getElementById(`lbc${_idb}`);
    let criterio = document.getElementById(`crt${_idb}`);
    const result = subCriterios.find(({ _id }) => _id === _idb);
    if (checkA.checked) {
        title.innerHTML = result.textoa;
        criterio.setAttribute('class', 'op-acepta');
        tarjeta.setAttribute('class', 'card-header text-light bg-success');
    }
    if (checkR.checked) {
        criterio.setAttribute('class', 'op-rechaza');
        title.innerHTML = result.textor;
        tarjeta.setAttribute('class', 'card-header text-dark bg-warning');
    }
    if (checkN.checked) {
        criterio.setAttribute('class', 'card-title');
        title.innerHTML = '';
        tarjeta.setAttribute('class', 'card-header text-dark bg-light');
    }



    let acepta = document.getElementsByClassName('op-acepta');
    let rechaza = document.getElementsByClassName('op-rechaza');
    if ((acepta.length + rechaza.length) > 0) {
        setPaso(7);
    } else {
        setPaso(6);

    }


}

document.getElementById('inSearch').addEventListener('input', async e => {
    text = document.getElementById('inSearch').value;
    text = text.toUpperCase();
    renderProveedores(text);
})

function setPaso(paso) {
    let state = '';
    if (paso < 1) {
        clearFields();
        document.getElementById('step00').style.display = '';
        state = 'none';
        let fechaw = toLocal(new Date);
        document.getElementById('inFechaw').value = fechaw;
    } else {
        document.getElementById('step00').style.display = 'none';
    }
    document.getElementById('step01').style.display = state;
    document.getElementById('step02').style.display = state;
    state = '';
    if (paso < 3) state = 'none';
    document.getElementById('step03').style.display = state;
    state = ''
    if (paso < 4) state = 'none';
    document.getElementById('step04').style.display = state;
    state = ''
    if (paso < 5) state = 'none';
    document.getElementById('step05').style.display = state;
    state = ''
    if (paso < 6) {
        state = 'none';
        document.getElementById('lblLote').innerHTML = ' Validar lote';
        document.getElementById('inLote').disabled = false;
        document.getElementById('btn-getLote').setAttribute('class', 'btn btn-warning');
    } else {
        document.getElementById('lblLote').innerHTML = ' Lote O.K.';
        document.getElementById('inLote').disabled = true;
        document.getElementById('btn-getLote').setAttribute('class', 'btn btn-info');
        const indexInsumo = document.getElementById('inInsumo').value;
        if (!insumos[indexInsumo].trazable) paso = 7;
    }
    document.getElementById('step06').style.display = state;
    state = ''
    if (paso < 7) state = 'none';
    document.getElementById('step07').style.display = state;

}

function clearFields() {
    document.getElementById('inInsumo').disabled = false;
    let grupo = document.getElementsByClassName('form-control-a');
    for (let i = 0; i < grupo.length; i++) {
        grupo[i].value = '';
        grupo[i].innerText = '';
    }
    grupo = document.getElementsByClassName('form-select-a');
    for (let i = 0; i < grupo.length; i++) {
        grupo[i].value = '-1';
    }
}

function renderCard(card) {
    const div = document.createElement('div');
    div.setAttribute('class', 'col-sm-4');
    div.innerHTML = `
    <div class="card text-dark bg-light" >
        <div class="card-header" id="card${card._id}">
            <h5 id="crt${card._id}" class="card-title">${card.nombre}</h5>
            <h6 id="lbc${card._id}"></h6>
        </div>
        <div class="card-body ">
            <div class="form-check" >
                <input class="form-check-input" type="radio" name="checkA${card._id}" id="checkA${card._id}" _id="${card._id}">
                <label class="form-check-label" for="checkA${card._id}">Acepta</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="checkA${card._id}" id="checkR${card._id}" _id="${card._id}">
                <label class="form-check-label" for="checkR${card._id}">Rechaza</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="checkA${card._id}" id="checkN${card._id}" _id="${card._id}" checked>
                <label class="form-check-label" for="checkN${card._id}">N/A</label>
            </div>
        
    </div>
    `;
    return div;
}

function renderCriterios(code) {
    subCriterios = criterios.filter(element => element.codigo === code);
    const container = document.getElementById('cardsContainer');
    container.innerHTML = '';
    subCriterios.forEach(card => {
        let element = renderCard(card);
        container.appendChild(element);
    });
}

function renderInsumos() {
    const container = document.getElementById('inInsumo');
    //container.innerHTML = '';
    let i = 0;
    insumos.forEach(item => {
        const option = document.createElement('option');
        option.innerHTML = `
        ${item.codigo}-${item.nombre} por ${item.unidad}                  
        `;
        option.setAttribute("value", i);
        container.appendChild(option);
        i += 1;
    })
}

function renderProveedores(filtro) {
    const container = document.getElementById('listProv');
    container.innerHTML = '';
    proveedores.forEach(item => {
        let i = item.nombre.toUpperCase().indexOf(filtro);
        if (i > -1) {
            const a = document.createElement('a');
            a.setAttribute('href', '#');
            a.setAttribute('_nit', item.idClient);
            a.setAttribute('class', 'list-group-item list-group-item-action list-group-item-secondary')
            a.innerHTML = `${item.nombre}`;
            container.appendChild(a);
        }

    })

}

function toLocal(fecha) {
    //2023-01-02T14:20
    if (!fecha) return ''

    let f = new Date(fecha);
    const a = f.getFullYear();
    const m = ("0" + (f.getMonth() + 1)).slice(-2);
    const d = ("0" + (f.getDate())).slice(-2);
    const h = ("0" + (f.getHours())).slice(-2);
    const mins = ("0" + (f.getMinutes())).slice(-2);
    const f2 = `${a}-${m}-${d}T${h}:${mins}`
    return f2;
}

//* * * * * * * * * *    FUNCIONES  CREAR ingreso * * * * *

document.getElementById('inCantidad').addEventListener('change', async e => {
    let val = document.getElementById("inCantidad").value;
    if (val) {
        document.getElementById('inInsumo').disabled = true;
        const indexInsumo = document.getElementById('inInsumo').value;
        let dv = insumos[indexInsumo].diasVence;
        if (dv > 0) {
            document.getElementById('inVence').value = fechaType(dv);
            setPaso(5);
            document.getElementById('inLote').focus();
        } else {
            setPaso(4);
        }
    } else {
        docIngreso.cantidad = 0;
        setPaso(3);
    }
})

document.getElementById('inVence').addEventListener('change', async e => {
    let val = document.getElementById("inVence").value;
    if (val) {
        setPaso(5);
        document.getElementById('inLote').focus();
    } else {
        setPaso(4);
    }
})

document.getElementById('inLote').addEventListener('change', async e => {
    let val = document.getElementById("inLote").value;

    if (val) {
        setPaso(6);
    } else {
        setPaso(5);
    }
})

function fechaType(dv) {
    let f = new Date();
    f.setDate(f.getDate() + dv);
    const a = f.getFullYear();
    const m = ("0" + (f.getMonth() + 1)).slice(-2);
    const d = ("0" + (f.getDate())).slice(-2);
    return `${a}-${m}-${d}`;
}

document.getElementById('inInsumo').addEventListener('change', async e => {
    let cod = document.getElementById("inInsumo").value;
    if (cod != '-1') {
        renderCriterios(insumos[cod].codigo)
        setPaso(3);
        document.getElementById('inCantidad').focus();
    } else {
        setPaso(2);
    }
})

document.getElementById('listProv').addEventListener('click', async e => {
    let nombre = e.target.innerText;
    docIngreso.nit = e.target.getAttribute('_nit');
    setPaso(1);
    document.getElementById('nproveedor').value = nombre;
    $('#proveedoresModal').modal('hide');
})

document.getElementById('btn-getLote').addEventListener('click', async e => {
    let strLote = document.getElementById('inLote').value,
        objLote = {};

    objLote.strSerie = strLote;
    objLote.incremento = 3;
    toastr.info('Comprobando...', 'Lote');
    const res = await fetch('/core/lotes/test', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(objLote)
    });
    const data = await res.json();

    if (data.fail) {
        toastr.error('Reintente!', 'No se ha podido enviar.', 'Petición de lote');
        return false;

    }
    toastr.remove();
    toastr.success(data.msg, 'Lote');
    document.getElementById('inLote').value = data.serial;
    setPaso(6);

})

document.getElementById('btnNuevo').addEventListener('click', async e => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () { console.log('timeout'); currentUser = null }, timeClear);
    const noEnviado = document.getElementById('nproveedor').value;
    if (!opers) {
        response = await fetch('/core/opers');
        opers = await response.json();
    }
    if (!proveedores) {
        res = await fetch('/core/proveedores', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: "GET",
            body: JSON.stringify()
        });

        proveedores = await res.json();
    }
    if (noEnviado) {
        const continuar = confirm('Hay un documento sin guardar, ¿desea descartar esta informacion y empezar un ingreso nuevo?');
        if (!continuar) return;
        renderProveedores('');
        setPaso(0);
    }
    if (!insumos) {
        let res = await fetch('/core/insumos', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: "GET",
            body: JSON.stringify()
        });
        insumos = await res.json();
        renderInsumos();
    }
    if (!criterios) {
        let res = await fetch('/core/criterios', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: "GET",
            body: JSON.stringify()
        });
        criterios = await res.json();
    }

    if (currentUser) {
        docIngreso.operario = currentUser;
        $('#proveedoresModal').modal('show');

        setPaso(1);

    } else {
        $('#userModal').modal('show');
    }
});

document.getElementById('inUser').addEventListener('input', e => {
    const varInput = document.getElementById('inUser');
    if (varInput.value.length > 3) {
        const varPin = parseInt(varInput.value);
        document.getElementById('inUser').value = '';
        const result = opers.find(({ pin }) => pin === varPin);

        if (result) {
            currentUser = result.name.substr(0, 8);
            docIngreso.operario = currentUser;
            $('#proveedoresModal').modal('show');
            $('#userModal').modal('hide');
            renderProveedores('');
        } else {
            toastr.error('Ingrese nuevamente.', 'Pin incorrecto!')
        }

    }

})

document.getElementById('proveedoresModal').addEventListener('shown.bs.modal', e => {
    document.getElementById('inSearch').focus();
});

document.getElementById('userModal').addEventListener('shown.bs.modal', e => {
    document.getElementById('inUser').focus();
})

//* * * * * * * * * *    FUNCIONES  send server * * * * *

document.getElementById('btnSave').addEventListener('click', async e => {

    let acepta = document.getElementsByClassName('op-acepta');
    let rechaza = document.getElementsByClassName('op-rechaza');
    let varAcepta = '', varRechaza = '';
    if (rechaza.length > 0) {
        if (!confirm('Ha escogido rechazar el insumo, esta seguro de continuar?')) {
            return;
        }
    }
    const indexInsumo = document.getElementById('inInsumo').value;
    const insumo = insumos[indexInsumo];
    docIngreso.nombreProveedor = document.getElementById('nproveedor').value;
    docIngreso.insumo = {};
    docIngreso.insumo.codigo = insumo.codigo;
    docIngreso.insumo.nombre = insumo.nombre;
    docIngreso.insumo.unidad = insumo.unidad;
    docIngreso.vence = document.getElementById('inVence').value;
    docIngreso.cantidad = document.getElementById('inCantidad').value;
    docIngreso.lote = document.getElementById('inLote').value;


    for (let item = 0; item < acepta.length; item++) {
        const titulo = acepta[item].innerText;
        varAcepta += titulo + ', ';
    }
    varAcepta = varAcepta.slice(0, varAcepta.length - 2);
    docIngreso.acepta = varAcepta;
    for (let item = 0; item < rechaza.length; item++) {
        const titulo = rechaza[item].innerText;
        varRechaza += titulo + ', ';
    }
    varRechaza = varRechaza.slice(0, varRechaza.length - 2);
    docIngreso.rechaza = varRechaza;
    docIngreso.fechaw = document.getElementById('inFechaw').value;
    console.log(docIngreso)
    const errors = obtenerCamposNull(docIngreso, { acepta: true, rechaza: true })
    console.log(errors);
    if (errors.length > 0) {
        let list = '';
        errors.forEach(err => {
            list += ` ${err},`
        })
        list = list.slice(0, -1);
        const msg = `Se han detectado ${errors.length} errores. Debe corregir: ${list}`;
        toastr.error(msg);
        mostrarAlert('block', msg);
        return;
    } else {
        mostrarAlert('none');
    }

    await sendIngreso();
    setPaso(0);
    await renderTable();
});

async function sendIngreso() {
    const res = await fetch('/domain/almacen', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "PUT",
        body: JSON.stringify(docIngreso)
    });
    const data = await res.json();
    if (data.fail) {
        toastr.error(data.message);
        return;
    }
    //obj = await res.json();
    toastr.info(data.message);

}

document.getElementById('btnArchivar').addEventListener('click', async e => {
    await renderArchivar();
    $('#archivarModal').modal('show');
});

async function renderArchivar() {
    let res = await fetch('/domain/almacen/sinfacturar', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({})
    });
    pendientes = await res.json();
    const container = document.getElementById('archivarList');
    container.innerHTML = '';
    pendientes.forEach(item => {
        let fecha = new Date(item.createdAt);
        let fechaTxt = `${fecha.toLocaleDateString('es-us', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`;
        const li = document.createElement('li');
        li.setAttribute("class", "list-group-item");
        li.innerHTML = `
            <input class="form-check-input me-1 checkArchivar" type="checkbox" value="" ><strong>${item.insumo.nombre || ''}</strong>  (${fechaTxt}) ${item.nombreProveedor}, op: ${item.operario}              
        `;
        container.appendChild(li);
    })
    const listItems = document.querySelectorAll('.list-group-item');
    listItems.forEach(item => {
        item.addEventListener('click', function (event) {
            const checkbox = this.querySelector('.checkArchivar');
            if (event.target.tagName !== 'INPUT') {
                checkbox.checked = !checkbox.checked;
            }
        });
    });
}

document.getElementById('btnFacturar').addEventListener('click', async e => {
    let listChk = document.getElementsByClassName('checkArchivar');
    let pyme = '', bodega = 1;
    facturar = [];
    for (let item = 0; item < listChk.length; item++) {
        if (listChk[item].checked) {
            pyme += `${bodega}\t${pendientes[item].insumo.codigo}\t\t${pendientes[item].cantidad}\n`;
            facturar.push({ "_id": pendientes[item]._id, "facturada": true });
        }
    }
    toClipBoard(pyme);
    console.log(pyme);
    console.log(facturar);
    const res = await fetch('/core/save', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "PUT",
        body: JSON.stringify({documentos:facturar, modelo:'Inalmacen'})
    });
    const dats = await res.json();
    console.log(dats)
    if (dats.fail) {
        toastr.error(dats.message);
        return;
    }
    toastr.info(dats.message);
    renderTable();

})
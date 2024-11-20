let localTable, timeoutId, docPlanilla = {}, procesos, currentUser = null;
let opers, jsonDetalle = [], planilla = {}, flags = {}, detKeys = [], currentCollection = {};
let insumosList, selected = {}, objLote, options
const timeClear = 1200000;
//* * * * * * * * * *    FUNCIONES  inicio * * * * *
async function init() {
    document.getElementById('title-main').innerHTML = 'Planillas producción';

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
    backFilter.sortBy = 'createdAt';
    backFilter.sortOrder = -1;
    backFilter.valorBoolean = 'false';
    backFilter.group = 'diapp';
    backFilter.datepp = formatDate(new Date());
    backFilter.keyGroup = 'createdAt';

    let response = await fetch("/core/keys", {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ modelo: 'Planilla' })
    })
    let data = await response.json();
    if (data.message) {
        toastr.error(data.message);
        return;
    }
    currentKeys = data;
    currentKeys.push({
        alias: 'F. creación', campo: 'createdAt', default: '', type: 'date'
    })

    const data2 = await fetch('/core/procesos');
    procesos = await data2.json();
    //startPolling();
    //document.getElementById('btnChose').style.display = 'none';
}

async function afterLoad() {

    flags.siChangeH = false;

    currentCollection.modelo = '';
    detKeys.push(
        {
            "campo": 'cantidad', "alias": 'Cantidad', "tipo": 'number', "require": true,
            disabled: false, step: '0.0001'
        }, {
        "campo": 'codigoInsumo', "alias": 'Codigo Insumo', "tipo": 'String', "require": true,
        disabled: true
    }, {
        "campo": 'nombreInsumo', "alias": 'Nombre Insumo', "tipo": 'String', "require": true,
        disabled: true
    }, {
        "campo": 'unidad', "alias": 'Unidad', "tipo": 'String', "require": true,
        disabled: true
    }, {
        "campo": 'loteIn', "alias": 'Lote', "tipo": 'String', "require": true,
        disabled: true
    }, {
        "campo": 'compuesto', "alias": 'Compuesto', "tipo": 'boolean',
        disabled: true
    },
        {
            "campo": 'vence', "alias": 'Vence', "tipo": 'Date', "require": true,
            disabled: true
        },

    )

}

//* * * * * * * * * *    FUNCIONES  Renderizado * * * * *

document.getElementById('userModal').addEventListener('shown.bs.modal', e => {
    document.getElementById('inUser').focus();
})

document.getElementById('cantidadModal').addEventListener('shown.bs.modal', e => {
    document.getElementById('inCantidad').focus();
});

document.getElementById('productosModal').addEventListener('shown.bs.modal', e => {
    const element = document.getElementById('inSearch')
    element.focus();
    element.value = '';
});

async function renderTable() {
    const res = await fetch("/domain/planillas", {
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
    localTable = data;
    renderCards();
}

async function renderCards() {
    let i = 0;
    let container = document.getElementById('accordionMain');
    container.innerHTML = '';
    localTable.forEach(itemAcc => {
        renderOneCard(itemAcc, i)
        i++
    })

}

async function renderOneCard(itemAcc, i) {
    //i: indice de documento para funcion collapce
    let container = document.getElementById('accordionMain');

    renderItemsAccordion(container, itemAcc, i)
    container = document.getElementById(`bodyAccordion${itemAcc._id}`);
    container.innerHTML = '';
    renderHeadTable(container, itemAcc);
    //const hayCrono = itemAcc.timeStart || itemAcc.timeRun;
    //const hayCrono = itemAcc.timeRun;
    //if (hayCrono) {
    if (itemAcc.timeRun === 0) {      //crono corriendo
        const timeStart = calcInterval(itemAcc.timeStart) ;
        toggleCronometro(itemAcc._id, timeStart, 'on');
        //cronometros[`crono${itemAcc._id}`].tiempo = timeStart;
    } else {                          //crono stop
        toggleCronometro(itemAcc._id, itemAcc.timeRun,'off');

        //toggleCronometro(itemAcc._id);
        //cronometros[`crono${itemAcc._id}`].tiempo = itemAcc.timeRun;
        const boton = document.getElementById(`crono${itemAcc._id}`);
        boton.innerHTML = formatearTiempo(cronometros[`crono${itemAcc._id}`].tiempo);
    }
    //}

    renderFooterTable(container, itemAcc._id);
    container = document.getElementById(`bt${itemAcc._id}`);
    itemAcc.detalle.forEach(itemDetalle => {
        renderBodyTable(container, itemDetalle, itemAcc._id);
    });
    paint(itemAcc);

}

function renderItemsAccordion(container, itemAcc, i) {
    const div = document.createElement('div');
    div.setAttribute('class', 'accordion-item');
    div.innerHTML = `
        <h2 class="accordion-header" id="heading${itemAcc._id}" _idDoc="${itemAcc._id}">
            <button id="btnAcc${itemAcc._id}" class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}" _role="" _idDoc="${itemAcc._id}">
        </h2>
        <div id="collapse${i}" class="accordion-collapse collapse" aria-labelledby="heading${i}" data-bs-parent="#accordionMain">
            <div id="bodyAccordion${itemAcc._id}" class="accordion-body">
            </div>
        </div>
    `;
    container.appendChild(div);
}

function renderHeadTable(container, itemAcc) {

    const fStart = formatearDato(new Date(itemAcc.timeStart), 'hhh:mm:ss')
    const hayCrono = itemAcc.timeStart || itemAcc.timeRun;
    const inputCronometer = hayCrono ? `
        <button id="crono${itemAcc._id}" _iddoc=${itemAcc._id} _role= "crono" class="btn bg-success text-white" }>00:00:00</button>
    `: '';
    let f1 = toLocal(itemAcc.fecha1);
    let fv = fechaFormated(itemAcc.vence);
    fv = fv.slice(0, 10);
    const table = document.createElement('table');
    table.setAttribute('class', 'table table-hover');
    table.setAttribute('id', `head${itemAcc._id}`);
    table.innerHTML = `
    <thead>
        
        <tr class="table-primary">
            <th scope="col">Fecha</th>
            <th scope="col">Tiempo transcurrido</th>
            <th scope="col">Cantidad prod.</th>
            <th scope="col">°Brix</th>
            
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><input _role="inFecha" _idDoc= ${itemAcc._id} id= "inFecha1_${itemAcc._id}" value = "${f1}" type="datetime-local"></td>
            <td>${inputCronometer}</td>
            <td><input _role="inCantProd" _idDoc= ${itemAcc._id} id="inCantProd_${itemAcc._id}" value = "${itemAcc.cantProd}" type="number"></td>
            <td><input _role="inBrix" _idDoc= ${itemAcc._id} id="inBrix_${itemAcc._id}" value = "${itemAcc.brix}" type="number"></td>
            
        </tr>
        <tr>
            <td>Hora Inicio: <strong>${fStart}</strong></td>
            <td><strong>${itemAcc.operario}</strong></td>
            <td>Vence: <strong id= "vence_${itemAcc._id}">${fv}</strong></td>
        </tr>
    </tbody>
    
    <thead>
        <tr class="table-primary">
            <th scope="col">Edit. | Insumo</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Lote</th>
            <th scope="col">Vence</th>
        </tr>
    </thead>   
    <tbody id ="bt${itemAcc._id}"></tbody> 
    `;
    container.appendChild(table);
}

function renderBodyTable(container, itemDetalle, _idDoc) {
    const table = document.createElement('tr');
    table.setAttribute('id', `renglon_${itemDetalle._id}`)
    table.innerHTML = `
   
       <td><a  id="del${itemDetalle._id}"  _idDoc = "${_idDoc}" _idItem="${itemDetalle._id}" class="btn btn-default btn-sm" href="#" _role="edit" >
            <i class="fa fa-pencil fa-lg" aria-hidden="true" _role="edit" _idDoc = "${_idDoc}" _idItem="${itemDetalle._id}"></i></a>
            ${itemDetalle.nombreInsumo}</td>
       <td>${itemDetalle.cantidad} ${itemDetalle.unidad}</td>
       <td><input _idDoc = "${_idDoc}"  id = "inLote${itemDetalle._id}" _idItem = "${itemDetalle._id}" _codigo = "${itemDetalle.codigoInsumo}" _role="inlote" class="" type="text"   readonly></td>
       
       <td><input id = "inVence${itemDetalle._id}" _role="" class="" readonly></td>
   `;
    container.appendChild(table);
}

function renderFooterTable(container, _idDoc) {
    const tr = document.createElement('tr');
    tr.innerHTML = `     
        <td><input id="inin${_idDoc}"  _idDoc="${_idDoc}" type="text" class="form-control" placeholder="Ad. insumo" _role="openList"></td>
        <td><input id="incant${_idDoc}"  _idDoc="${_idDoc}" type="number" class="form-control" placeholder="Ad. cantidad" _role="cantidad" ></td>
        
         
        <td><a  id="snd${_idDoc}" _idDoc="${_idDoc}" class="btn btn-default btn-sm" href="#" _role="sending" >
                <i class="fa fa-plus-square fa-lg" aria-hidden="true" _role="sending"  _idDoc="${_idDoc}"></i> Add</a></td>   
        <td><a  id="refresh${_idDoc}" _idDoc="${_idDoc}" class="btn btn-default btn-sm" href="#" _role="reload" >
                <i class="fa fa-refresh fa-lg" aria-hidden="true" _role="refresh"  _idDoc="${_idDoc}"></i> Recalcular</a></td>        
       
    `;
    container.appendChild(tr);
}

async function paint(itemAcc) {
    const proceso = procesos.find(({ codigoProceso }) => codigoProceso === itemAcc.codigoProducto);
    const codeBase = itemAcc.detalle.find(({ codigoInsumo }) => codigoInsumo === proceso.codigoInsumo);
    const produccionMin = codeBase.cantidad / proceso.cantidad * proceso.prodMin;
    const produccionMax = codeBase.cantidad / proceso.cantidad * proceso.prodMax;
    const inRange = (itemAcc.cantProd >= produccionMin) && (itemAcc.cantProd <= produccionMax);
    const contentH = document.getElementById(`btnAcc${itemAcc._id}`);
    let esOk = itemAcc.formulaOk;
    flags.error = [];
    itemAcc.detalle.forEach(itemDetalle => {
        const inputL = document.getElementById(`inLote${itemDetalle._id}`);
        const inputV = document.getElementById(`inVence${itemDetalle._id}`);
        let color = '';
        let fecha = new Date(itemDetalle.vence);
        let fechaTxt = fecha.toLocaleDateString('es-us', { day: '2-digit', month: 'short', year: 'numeric' });
        if (!itemDetalle.vence) fechaTxt = '--';
        inputL.value = itemDetalle.loteIn || '';
        inputV.value = fechaTxt;
        if (!itemDetalle.loteIn) {
            color = 'bg-danger';
            flags.error.push(`falta lote de ${itemDetalle.nombreInsumo}`);
        }
        inputL.setAttribute('class', color);
    });

    let campo = document.getElementById(`inCantProd_${itemAcc._id}`);
    if (!campo.value || campo.value == 0) flags.error.push('No hay cantidad producida ');
    if (!inRange) flags.error.push(`Cantidad producida fuera de rango(${produccionMin}->${produccionMax}) `);
    const hasError = (!campo.value || campo.value == 0 || !inRange);
    campo.setAttribute('class', hasError ? 'bg-danger' : '');

    campo = document.getElementById(`inFecha1_${itemAcc._id}`);
    if (campo.value) {
        campo.setAttribute('class', '');
    } else {
        campo.setAttribute('class', 'bg-danger');
        flags.error.push('No hay fecha de inicio ');
    }

    campo = document.getElementById(`inBrix_${itemAcc._id}`);
    const brixError = (!campo.value || campo.value == 0);
    campo.setAttribute('class', brixError ? 'bg-warning' : '');

    campo = document.getElementById(`crono${itemAcc._id}`);
    if (campo && campo._status === 'run') flags.error.push('Debe parar el cronometro ');

    let fechap = fechaFormated(itemAcc.fecha1);
    const errMsg = flags.error.join(", ");
    let iconColor = 'btn-success';
    let iconElement = '<i class="fa fa-check-circle fa-lg"></i>';
    let iconMsg = '';
    if (flags.error.length > 0 && !itemAcc.formulaOk) {
        iconColor = 'btn-warning';
        iconElement = '<i class="fa fa-exclamation-triangle fa-lg" ></i>';
        iconMsg = `, [${flags.error.length}]Errores: ${errMsg}`
    }

    let icon = `<a class="btn ${iconColor} " href="#"  _role="toedit" _idDoc="${itemAcc._id}">${iconElement}</a>`;
    let txtHead = `<strong>${itemAcc.loteOut}</strong>-${itemAcc.producto} - ${itemAcc.operario} ${fechap} ${iconMsg}`;
    contentH.innerHTML = `
        ${icon}
        <div class="px-3"  _role="toedit" _idDoc="${itemAcc._id}">${txtHead}</div>
        `;
    const planillaOk = flags.error.length === 0;
    const change = esOk !== planillaOk;

    /*if (flags.error.length > 0) {
        icon = `<a class="btn btn-warning" href="#"  _role="toedit" _idDoc="${itemAcc._id}"><i class="fa fa-exclamation-triangle fa-lg" ></i></a>`;
        estado = "Incompleta!!"
    }*/

    if (change && !itemAcc.embodegado) {
        if (!itemAcc.formulaOk) {
            await updateDocument('Planilla', itemAcc._id, { formulaOk: planillaOk });
            localTable[flags.index].formulaOk = true;
        } else {
            //toastr.warning(`Lote ${itemAcc.loteOut} No se puede modificar`)
            console.warn(`Lote ${itemAcc.loteOut} No se puede modificar`);
        }
    }
    itemAcc.formulaOk = planillaOk;
    return change;
}

function renderProductos(filtro) {
    const container = document.getElementById('listProducts');
    container.innerHTML = '';
    procesos.forEach(item => {
        const codeNproceso = `${item.codigoProceso} ${item.proceso}`;
        let i = codeNproceso.toUpperCase().indexOf(filtro);
        if (i > -1 || filtro === '') {
            const a = document.createElement('a');
            a.setAttribute('href', '#');
            a.setAttribute('_codigo', item.codigoProceso);
            a.setAttribute('class', 'list-group-item list-group-item-action list-group-item-secondary')
            a.innerHTML = `${item.codigoProceso} - ${item.proceso}`;
            container.appendChild(a);
        }

    })

}

async function renderList() {
    if (!insumosList) {
        insumosList = await fetch("/core/insumos", {
            headers: { 'content-type': 'application/json' },
            method: 'GET',
            body: JSON.stringify()
        })
        insumosList = await insumosList.json();
    }
    const container = document.getElementById('bodyTableList');
    container.innerHTML = '';
    insumosList.forEach(item => {
        const tr = document.createElement('tr');
        //tr.setAttribute('');
        tr.innerHTML = `
        <th scope="col" _codigo="${item.codigo}" _nombre="${item.nombre}" _unidad="${item.unidad}">
            ${item.codigo} - ${item.nombre} x ${item.unidad}
        </th>`;
        container.appendChild(tr);
    })

    $('#insumosModal').modal('show');
}

document.getElementById('btnUsers').addEventListener('click', async e => {

    await loadList()


})

document.getElementById('navUsers').addEventListener('click', async e => {

    let nombre = e.target.getAttribute('_name');
    let pin = e.target.getAttribute('_pin');
    document.getElementById('btnUsers').innerHTML = nombre;
    flags.user = pin;
    workFilter.filterBy = !pin ? '' : 'operario';
    workFilter.filterTxt = !pin ? '' : nombre;
    await renderTable();
    await footer(1)

})
async function loadList() {
    if (options) return;
    if (!opers) {
        const response = await fetch('/core/operarios');
        opers = await response.json();
    }
    const container = document.getElementById('navUsers');
    container.innerHTML = '';
    options = opers.map(op => ({
        ...op,
        name8: op.name.slice(0, 8)
    }));

    options = [{ name: 'Usuarios', name8: 'Usuarios', pin: '' }, ...options];
    options.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
        <a _name="${item.name8}" _pin="${item.pin}" class="dropdown-item" href="#">${item.name}</a>
        `;
        container.appendChild(li);
    })
}

//* * * * * * * * * *    FUNCIONES  Crear planilla * * * * *

document.getElementById('btnNuevo').addEventListener('click', async e => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () { console.log('timeout'); currentUser = null }, timeClear);
    const noEnviado = docPlanilla.proceso;
    if (noEnviado) {
        const continuar = confirm('Hay un documento sin guardar, ¿desea descartar esta informacion y empezar una orden nueva?');
        if (!continuar) return;
    }

    renderProductos('');
    if (currentUser) {
        docPlanilla.operario = currentUser;
        $('#productosModal').modal('show');
    } else {
        $('#userModal').modal('show');
    }
})

document.getElementById('inUser').addEventListener('input', async e => {
    const varInput = document.getElementById('inUser');
    if (varInput.value.length > 3) {
        if (!opers) {
            const response = await fetch('/core/operarios');
            opers = await response.json();
        }

        varPin = parseInt(varInput.value);
        document.getElementById('inUser').value = '';
        const result = opers.find(({ pin }) => pin === varPin);

        if (result) {

            currentUser = result.name.substr(0, 8);
            docPlanilla.operario = currentUser;
            $('#productosModal').modal('show');
            $('#userModal').modal('hide');
        } else {
            toastr.error('Ingrese nuevamente.', 'Pin incorrecto!')
        }

    }

})

document.getElementById('inSearch').addEventListener('input', async e => {
    text = document.getElementById('inSearch').value;
    text = text.toUpperCase();
    renderProductos(text);
})

document.getElementById('listProducts').addEventListener('click', async e => {
    docPlanilla.codigoProceso = e.target.getAttribute('_codigo');
    selecProceso = procesos.find(({ codigoProceso }) => codigoProceso === docPlanilla.codigoProceso);
    docPlanilla.proceso = selecProceso.proceso;
    $('#productosModal').modal('hide');
    $('#cantidadModal').modal('show');
    document.getElementById('lblCantidad').innerHTML = `Cantidad de ${selecProceso.unidad} de ${selecProceso.insumo} usados para producir ${selecProceso.proceso}`
})

document.getElementById('btnSavePlanilla').addEventListener('click', async e => {
    procesarPlanilla();
})

async function procesarPlanilla() {
    toastr.info('Buscando...', 'Formula');
    if (flags.reload) {
        const porcentaje = parseInt(document.getElementById('inCantidad').value) / flags.base;
        const updatedItems = localTable[flags.index].detalle.map(item => ({
            _id: item._id,
            cantidad: item.cantidad * porcentaje
        }));

        for (const [index, item] of updatedItems.entries()) {
            const objSend = {
                documentoId: flags.idDoc,
                subdocumentoId: item._id,
                subdocumento: { cantidad: item.cantidad }
            };
            await fetch('/core/planilla/sub', {
                headers: { 'Content-Type': 'application/json' },
                method: "PUT",
                body: JSON.stringify(objSend)
            });
            localTable[flags.index].detalle[index].cantidad = item.cantidad
        }

        //fillOneCard(localTable[flags.index]);
        await fillOneCard(localTable[flags.index]);
        await renderOneCard(localTable[flags.index])
        await renderOneCard(localTable[flags.index])

        flags.reload = false;
        $('#cantidadModal').modal('hide');
        return;
    }
    docPlanilla.cantidadBase = parseInt(document.getElementById('inCantidad').value);
    selecProceso.porcentaje = docPlanilla.cantidadBase / selecProceso.cantidad;
    const res = await fetch('/domain/formula', {
        headers: { 'Content-Type': 'application/json' },
        method: "POST",
        body: JSON.stringify({
            'ccostos' : selecProceso.ccostos,
            'codigoProducto': selecProceso.codigoProceso,
            'porcentaje': selecProceso.porcentaje,
            operario: docPlanilla.operario,
            producto: selecProceso.proceso,

        })
    });
    currentFormula = await res.json();
    if (currentFormula.fail) {
        toastr.error(currentFormula.message || 'No se encontró la formula.', 'Error');
        return false;

    }
    toastr.remove();
    docPlanilla = {};
    document.getElementById('inCantidad').value = '';
    await renderTable();
    $('#cantidadModal').modal('hide');
}

//* * * * * * * * * *    FUNCIONES  Update * * * * *

document.getElementById('cantidadModal').addEventListener('keypress', e => {
    if (e.key == 'Enter') {
        procesarPlanilla();
    }
})

document.getElementById('accordionMain').addEventListener('change', async e => {
    flags.siChangeH = true;
    flags.updateRole = e.target.getAttribute('_role');

})

document.getElementById('accordionMain').addEventListener('focusout', async e => {

    const role = e.target.getAttribute('_role');
    const value = e.target.value;
    if (flags.siChangeH) {

        const indice = localTable.findIndex(({ _id }) => _id == flags.idDoc);
        const isFunction = ['inCantProd', 'inBrix', 'inFecha'].includes(role);
        const enabledEdit = !localTable[flags.index].embodegado;
        const op_role = (isFunction && !enabledEdit) ? 'noEdit' : role;
        switch (op_role) {
            case 'noEdit':
                toastr.warning(`El Lote ${localTable[flags.index].loteOut} No se puede modificar, no se gurdaron los cambios`)
                break;
            case 'inCantProd':
                localTable[indice].cantProd = value;
                await updateDocument('Planilla', flags.idDoc, { cantProd: value });
                break;
            case 'inBrix':
                localTable[indice].brix = value;
                await updateDocument('Planilla', flags.idDoc, { brix: value });
                break;
            case 'inFecha':
                localTable[indice].fecha1 = value;
                await updateDocument('Planilla', flags.idDoc, { fecha1: value });
                break;
            default:
        }

        const change = paint(localTable[indice]);
    }
    flags.siChangeH = false;

})

document.getElementById('accordionMain').addEventListener('dblclick', async e => {
    let role = e.target.getAttribute('_role');
    if (role !== 'inlote') return;
    const codigo = localTable[flags.index].detalle[flags.subIndex].codigoInsumo;
    await renderModalLotes(codigo);
    $('#lotesModal').modal('show');
})

async function renderModalLotes(codigo) {
    const res = await fetch('/core/produccion/lotes', {       //lotes de insumos y producto interno
        headers: {
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({ 'codigo': codigo })
    })
    const data = await res.json();

    if (data.fail) {
        toastr.error('Reintente!', 'No se ha podido recibir.', 'lotes');
        return false;
    }
    toastr.remove();
    objLote = data;


    const container = document.getElementById('lotesList');
    container.innerHTML = '';
    objLote.forEach(item => {
        let fecha = new Date(item.vence);
        let fechaE = new Date(item.fechaw);
        let fechaTxt = fechaE.toLocaleDateString('es-us', { day: '2-digit', month: 'short', year: 'numeric' });
        let proveedor = item.nombreProveedor;
        if (!proveedor) proveedor = 'indeterminado'
        proveedor = proveedor.substring(0, 10)
        const li = document.createElement('li');
        li.setAttribute("class", "list-group-item");
        li.setAttribute("_idItem", item._id);
        li.setAttribute("_lote", item.lote);
        li.setAttribute("_idDoc", flags.idDoc);
        li.setAttribute("_vence", item.vence);
        li.setAttribute("_compuesto", item.compuesto);
        li.innerHTML = `
            <input class="form-check-input me-1 checkArchivar" type="checkbox" value="" >
            <strong _idItem=${item._id} _lote=${item.lote} _idDoc=${flags.idDoc} _vence=${item.vence} _compuesto =${item.compuesto}>
            ${proveedor} </strong>  ||   ${item.lote}     ||    F.E.: ${fechaTxt}>              
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
            listCheck();
        });
    });
}

document.getElementById('btn_borrar').addEventListener('click', async e => {
    let rc = confirm("¿Seguro que desea Eliminar esta materia prima?");
    if (!rc) {
        toastr.info('No se hicieron cambios');
        return;
    }
    $('#modalEditor').modal('hide');


    const currentLote = localTable[flags.index].detalle[flags.subIndex].loteIn;
    const copyPool = currentLote ? await getPool(currentLote) : [];
    if (copyPool.length > 0) {

        const newPool = setLotes(localTable[flags.index].lotesPool, copyPool, 'sub', true);
        localTable[flags.index].lotesPool = [...newPool]
        await updateDocument('Planilla', flags.idDoc, { lotesPool: localTable[flags.index].lotesPool });
    }

    const send = {
        documentoId: flags.idDoc,
        subdocumentoId: flags.idItem
    }
    document.getElementById(`renglon_${flags.idItem}`).setAttribute('class', 'bg-danger');
    toastr.info('Borrando...', 'Insumo');
    const res = await fetch('/core/planilla/sub', {
        headers: { 'Content-Type': 'application/json' },
        method: "DELETE",
        body: JSON.stringify(send)
    });
    const response = await res.json();
    if (!response.success) {
        toastr.error('Reintente!', 'No se ha podido borrar.', 'Insumo');
        return false;
    }
    toastr.remove();
    toastr.success(response.message, 'Insumo eliminado!');
    localTable[flags.index].detalle = response.data.detalle;

    await fillOneCard(localTable[flags.index]);
    await renderOneCard(localTable[flags.index])
    await renderOneCard(localTable[flags.index])

})

async function updateDocument(modelo, _id, params, docResponse = false) {
    dataSend = { modelo, _id, params, docResponse };
    let response = await fetch("/core/update", {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(dataSend)
    })

    const data = await response.json();
}

document.getElementById('btn_guardar').addEventListener('click', async e => {
    if (!applyValidation()) {
        alert('El formulario tiene campos no válidos, por favor revise la información e intente nuevamente.');
        return;
    }
    let rc = confirm("¿Seguro que desea Cambiar la cantidad de esta materia prima?");
    if (!rc) {
        toastr.info('No se hicieron cambios');
        return;
    }

    const newCantidad = document.getElementById('cantidad').value;
    const objSend = {
        documentoId: flags.idDoc,
        subdocumentoId: flags.idItem,
        subdocumento: { cantidad: newCantidad }
    };

    document.getElementById(`renglon_${flags.idItem}`).setAttribute('class', 'bg-success');
    toastr.info('Actualiazando...', 'Insumo');
    const res = await fetch('/core/planilla/sub', {
        headers: { 'Content-Type': 'application/json' },
        method: "PUT",
        body: JSON.stringify(objSend)
    });
    const data = await res.json();
    if (data.fail) {
        toastr.error('Reintente!', 'No se ha podido actualizar.', 'Insumo');
        return false;
    }
    toastr.remove();
    toastr.success(data.msg, 'Insumo actualizado!');

    localTable[flags.index].detalle[flags.subIndex].cantidad = data.data.detalle[flags.subIndex].cantidad;

    await fillOneCard(localTable[flags.index]);
    await renderOneCard(localTable[flags.index])
    await renderOneCard(localTable[flags.index])
    $('#modalEditor').modal('hide');

})

document.getElementById('bodyTableList').addEventListener('click', async e => {
    selected.nombreInsumo = e.target.getAttribute('_nombre');
    selected.codigoInsumo = e.target.getAttribute('_codigo');
    selected.unidad = e.target.getAttribute('_unidad');
    document.getElementById(`inin${flags.idDoc}`).value = `${selected.codigoInsumo} - ${selected.nombreInsumo}`;
    $('#insumosModal').modal('hide');
    document.getElementById(`incant${flags.idDoc}`).focus();
})

async function fillOneCard(itemAcc) {
    let container = document.getElementById('accordionMain');
    container = document.getElementById(`bodyAccordion${itemAcc._id}`);
    container.innerHTML = '';
    renderHeadTable(container, itemAcc);
    renderFooterTable(container, itemAcc._id);
    container = document.getElementById(`bt${itemAcc._id}`);
    itemAcc.detalle.forEach(itemDetalle => {
        renderBodyTable(container, itemDetalle, itemAcc._id);
    });
    paint(itemAcc);

}

async function addInsumo() {

    flags.siChangeH = false;
    let msg = [];
    const inin = document.getElementById(`inin${flags.idDoc}`).value;
    const cnt = document.getElementById(`incant${flags.idDoc}`).value;

    if (!inin) {
        msg.push('Insumo no es valido');
    }

    if (!cnt || cnt < 0) {
        msg.push('Error en la cantidad');
    }
    if (msg.length > 0) {
        message = msg.join(", ");
        alert(message);
        return;
    }
    const objSend = {
        documentoId: flags.idDoc,
        subdocumento: {
            cantidad: cnt,
            codigoInsumo: selected.codigoInsumo,
            nombreInsumo: selected.nombreInsumo,
            unidad: selected.unidad,
            loteIn: ''
        }
    };
    const response = await fetch('/core/planilla/sub', {
        headers: { 'Content-Type': 'application/json' },
        method: "PUT",
        body: JSON.stringify(objSend)
    });

    const data = await response.json();
    selected.nombreInsumo = '';
    selected.codigoInsumo = '';
    selected.cantidad = '';
    document.getElementById(`incant${flags.idDoc}`).value = '';
    document.getElementById(`inin${flags.idDoc}`).value = '';

    localTable[flags.index].detalle = data.data.detalle;
    //fillOneCard(localTable[flags.index]);
    await fillOneCard(localTable[flags.index]);
    await renderOneCard(localTable[flags.index])
    await renderOneCard(localTable[flags.index])
}

document.getElementById('lotesList').addEventListener('change', async e => {
    listCheck();
})

function listCheck() {
    let listChk = document.getElementsByClassName('checkArchivar');
    let countChecked = 0;
    for (let item = 0; item < listChk.length; item++) {
        if (listChk[item].checked) countChecked += 1;
    }
    const del = document.getElementById('btnDeleteLote');
    const sel = document.getElementById('btnSelectLote');

    if (countChecked < 1) {
        del.disabled = true;
        sel.disabled = true;
    } else {

        if (countChecked > 1) {
            del.disabled = false;
            sel.disabled = true;
        } else {
            del.disabled = false;
            sel.disabled = false;
        }
    }
}

document.getElementById('btnSelectLote').addEventListener('click', async e => {
    sendLotes('select');
});

document.getElementById('btnDeleteLote').addEventListener('click', async e => {
    sendLotes('delete');
});

async function sendLotes(option) {

    let listChk = document.getElementsByClassName('checkArchivar');
    const lotesSelected = [];
    let response;
    let checkedIndices = Array.from(listChk)
        .map((input, index) => input.checked ? index : null) // Mapea índices de elementos checked
        .filter(index => index !== null); // Filtra solo los índices válidos
    if (option == 'select') {
        const currentLote = localTable[flags.index].detalle[flags.subIndex].loteIn;
        const indexL = checkedIndices[0];
        if (currentLote) {
            const copyPool = await getPool(currentLote);
            localTable[flags.index].lotesPool = setLotes(localTable[flags.index].lotesPool, copyPool, 'sub', true);
        }
        if (objLote[indexL].compuesto) {
            const newPool = setLotes(localTable[flags.index].lotesPool, objLote[indexL].copyPool, 'add');
            await updateDocument('Planilla', flags.idDoc, { lotesPool: newPool });
        }
        const objSend = {
            documentoId: flags.idDoc,
            subdocumentoId: flags.idItem,
            subdocumento: {
                loteIn: objLote[indexL].lote,
                vence: objLote[indexL].vence
            }
        };
        const res = await fetch('/core/planilla/sub', {
            headers: { 'Content-Type': 'application/json' },
            method: "PUT",
            body: JSON.stringify(objSend)
        });
        response = await res.json();
        localTable[flags.index].detalle = response.data.detalle;
        localTable[flags.index].lotesPool = response.data.lotesPool;
        //fillOneCard(localTable[flags.index]);
        await fillOneCard(localTable[flags.index]);
        await renderOneCard(localTable[flags.index])
        await renderOneCard(localTable[flags.index])
    }
    if (option === 'delete') {

        for (i in checkedIndices) {
            const ind = checkedIndices[i];
            const respuesta = await updateDocument(objLote[ind].org, objLote[ind]._id, { agotado: true });
            toastr.success(respuesta.acknowledged, `${objLote[ind].lote} actualizado!`);
        }
        const codigo = localTable[flags.index].detalle[flags.subIndex].codigoInsumo;
        await renderModalLotes(codigo)
    }
}

async function updateDocument(modelo, _id, params, docResponse = false) {
    dataSend = { modelo, _id, params, docResponse };

    let response = await fetch("/core/update", {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(dataSend)
    })
    const data = await response.json();
    return data;
}

async function getPool(currentLote) {
    const result = await fetch(`/core/pool/${currentLote}`);
    let response = await result.json();
    if (response.length > 0) response = response[0].copyPool;
    return response
}

function setLotes(originArr, newArr, oper, conDuplicados = true) {
    // Filtra nulls y define la operación a ejecutar.
    let result = originArr.filter(item => item !== null);
    newArr = newArr.filter(item => item !== null);

    const fx = conDuplicados ? `${oper}_duplicados` : oper;
    switch (fx) {
        case 'add':
            // Combina y elimina duplicados
            result = [...new Set([...result, ...newArr])].sort();
            break;
        case 'add_duplicados':
            // Combina sin eliminar duplicados
            result = [...result, ...newArr].sort();
            break;
        case 'sub':
            // Filtra elementos de `newArr` sin duplicados
            result = [...new Set(result.filter(item => !newArr.includes(item)))].sort();
            break;
        case 'sub_duplicados':
            // Filtra elementos de `newArr` eliminando solo una instancia
            for (const item of newArr) {
                const index = result.indexOf(item);
                if (index > -1) {
                    result.splice(index, 1);
                }
            }
            break;
        default:
            console.warn('Operación no reconocida:', oper);
            return originArr;
    }
    return result;
}

//* * * * * * * * * *    FUNCIONES  Cronometro * * * * *

const cronometros = {}; // Objeto para almacenar los intervalos de cada cronómetro


async function toggleCronometro(idDoc, acumulado, action) {
    const botonId = `crono${idDoc}`;
    const boton = document.getElementById(botonId);
    if (!cronometros[botonId]) {
        cronometros[botonId] = { tiempo: acumulado, intervalo: null, };
    }
    const cronometro = cronometros[botonId];
    switch (action) {
        case 'on':
            cronometro.corriendo = false;
            break;
        case 'off':
            cronometro.corriendo = true;
            boton.innerHTML = formatearTiempo(cronometro.tiempo);
            break;
        case 'click':
            break;
        default: console.warn(action, '??');
    }

    //******* */

    //if (!cronometros[botonId]) {
    //    cronometros[botonId] = { tiempo: acumulado, intervalo: null, corriendo: false };
    //}

    //const cronometro = cronometros[botonId];

    if (cronometro.corriendo) {
        // Pausar cronómetro
        clearInterval(cronometro.intervalo);
        cronometro.corriendo = false;
        boton.classList.remove("bg-danger");
        boton.classList.add("bg-success");
        boton._status = 'stop';
    } else {
        // Iniciar cronómetro
        cronometro.intervalo = setInterval(() => {
            cronometro.tiempo++;
            boton.innerHTML = formatearTiempo(cronometro.tiempo);
        }, 1000);

        cronometro.corriendo = true;
        boton.classList.remove("bg-success");
        boton.classList.add("bg-danger");
        boton._status = 'run';
    }

    if (action === 'click') {
        const params = {};
        const nuevaFecha = new Date();
        nuevaFecha.setSeconds(nuevaFecha.getSeconds() - cronometro.tiempo);
        if (!cronometro.corriendo) {        //está paudsado
            params.timeRun = cronometro.tiempo;
            params.timeStart = nuevaFecha;

        } else {
            params.timeStart = nuevaFecha;
            params.timeRun = 0;
        }
        await updateDocument('Planilla', idDoc, params);
    }
}

function formatearTiempo(segundos) {
    const horas = String(Math.floor(segundos / 3600)).padStart(2, '0');
    const minutos = String(Math.floor((segundos % 3600) / 60)).padStart(2, '0');
    const seg = String(segundos % 60).padStart(2, '0');
    return `${horas}:${minutos}:${seg}`;
}

function calcInterval(fecha) {
    t1 = new Date(fecha);
    t2 = new Date();
    return Math.round((t2 - t1) / 1000)
}

//* * * * * * * * * *    FUNCIONES  Varios * * * * *



document.getElementById('accordionMain').addEventListener('click', async e => {
    const idDoc = e.target.getAttribute('_idDoc');
    const _role = e.target.getAttribute('_role');
    const idItem = e.target.getAttribute('_idItem');
    if (idDoc) flags.idDoc = idDoc;
    flags.index = localTable.findIndex(({ _id }) => _id == flags.idDoc);
    flags.idItem = idItem;
    if (idItem) flags.subIndex = localTable[flags.index].detalle.findIndex(({ _id }) => _id == flags.idItem);
    const isFunction = ['crono', 'edit', 'openList', 'sending', 'reload',
        'inlote', 'cantidad'].includes(_role);
    const enabledEdit = !localTable[flags.index].embodegado && !localTable[flags.index].formulaOk;
    const op_role = (isFunction && !enabledEdit) ? 'noEdit' : _role;
    console.log('click en ', _role, op_role, isFunction, idDoc, idItem);
    switch (op_role) {
        case 'noEdit':
            toastr.warning(`El Lote ${localTable[flags.index].loteOut} No se puede modificar`)
            break;
        case 'crono':
            toggleCronometro(idDoc, 0,'click');
            paint(localTable[flags.index]);
            break;
        case 'edit':
            localRole = 'edit';
            const docEdit = localTable[flags.index].detalle.find(item => item._id === flags.idItem);
            renderModalEditor(detKeys, 'edit', `Editar Insumo`, docEdit);
            fadeInputs();
            break;
        case 'openList':
            renderList();
            break;
        case 'sending':
            await addInsumo();
            break;
        case 'reload':
            const continuar = confirm('Desea volver a calcular las cantidades de esta formula?');
            if (!continuar) return;
            flags.reload = true;

            const proceso = procesos.find(({ codigoProceso }) => codigoProceso === localTable[flags.index].codigoProducto);
            const base = localTable[flags.index].detalle.find(({ codigoInsumo }) => codigoInsumo === proceso.codigoInsumo);
            flags.base = base.cantidad;
            document.getElementById('lblCantidad').innerHTML = `Cantidad de ${proceso.unidad} de ${proceso.insumo} usados para producir ${proceso.proceso}`
            $('#cantidadModal').modal('show');
            break;
        default:
    }
});

function fechaFormated(fecha) {
    let f = new Date(fecha);
    const a = f.getFullYear();
    const m = ("0" + (f.getMonth() + 1)).slice(-2);
    const d = ("0" + (f.getDate())).slice(-2);
    const h = ("0" + (f.getHours())).slice(-2);
    const mins = ("0" + (f.getMinutes())).slice(-2);

    return `${d}-${m}-${a} ${h}:${mins}`;
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


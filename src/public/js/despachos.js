let localOrders, flags = {}, itemCollection = {}, itemSelected = {}, itemToSend = {}, oneOrder = {}, bodega = {}, toEmbodegar;
let templates = null, actions;
const configPack = {}, interval = 150, idle = 300;
document.getElementById('accordionPanel').addEventListener('click', async e => {

    let i = e.target.getAttribute('idcard');
    const idDoc = e.target.getAttribute('_iddoc');
    console.log(idDoc)

    if (e.target.classList.contains('btn-hide')) {
        document.getElementById('acc-item' + i).style.display = 'none';
    }
    if (e.target.classList.contains('opModel')) {
        const documentO = localOrders[i];
        const encaje = itemsPorCaja(documentO.orderItem);
        configPack.menor = packageMenor(encaje);
        const modelo = e.target.getAttribute('opModel');
        const boton = document.getElementById(`print${i}`);
        boton.setAttribute('_model', modelo);
        boton.innerHTML = `<i class="fa fa-print" aria-hidden="true"></i> ${configLabel(modelo)}`;
        const hayCero = modelo === 'printEmpaque' && configPack.menor > 0;
        //boton.disabled = hayCero;
    }
    if (e.target.classList.contains('print')) {
        await loadTemplates();

        const modelo = e.target.getAttribute('_model');
        itemSelected.idDocument = localOrders[i]._id;
        const dataPrint = [];
        dataPrint.push(JSON.parse(JSON.stringify(localOrders[i])));
        console.log('dataprint', dataPrint);
        localDesign = templates[modelo];
        generarPDF(dataPrint)
    }
    if (e.target.classList.contains('clip')) {
        itemSelected.idDocument = localOrders[i]._id;
        toastr.warning('ESPERE!');
        try {
            const res = await fetch("/domain/order/state", {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: "PUT",
                body: JSON.stringify({ _id: itemSelected.idDocument, newValue: 1 })
            });
            if (!res.ok) {
                throw new Error('Error al facturar');
            }
            const data = await res.json();
            localOrders[i].invoicedAt = Date();
            if (data.fail) {
                toastr.error('Reintente!', 'No se ha podido facturar.', 'Pedido');
                return false;
            }
        } catch (error) {
            error;
            console.log(error);
            toastr.error('Ocurrió un error al procesar la solicitud');
            return false;
        }

        await actInputs();
        const _id = localOrders[i]._id;
        const toClip = localOrders[i].orderItem;
        let pyme = '';
        for (element of toClip) {
            if (element.dispatch > 0) {
                pyme += `${element.code}\t\t${element.dispatch}\n`;
            }
        }
        document.getElementById('btnHide' + i).style.display = "";
        toastr.remove();
        toastr.success('Información copiada al portapapeles', 'Facturación');
        toClipBoard(pyme);

    }
});

document.getElementById('btnAsignar').addEventListener('click', async e => {
    const documentO = localOrders.find(doc => doc._id === itemSelected.idDocument);
    let orderItem;
    if (!documentO) {
        return;
    }
    orderItem = documentO.orderItem.find(item => item._id === itemSelected.idItem);
    itemSelected.code = orderItem.code;
    flags.btnSndEdit = e.target.getAttribute('_role');
    if (flags.btnSndEdit === 'edit') {
        lotesList = await getLotes(itemSelected.code);
    }
    if (flags.btnSndEdit === 'send') {
        flags.editado = false;
        await updateHistory();
        $('#historyModal').modal('hide');
    }
    toggleBtnHistory();
});

document.getElementById('btnEmbodegar').addEventListener('click', async e => {
    const res = await fetch('/domain/embodegar', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'GET'

    })

    toEmbodegar = await res.json();
    toEmbodegar.selected = [];
    flags.funcionEmbodegar = 'paso1';
    flags.bodegaChange = false;
    document.getElementById('lblEmbodegar').innerHTML = ' Copiar código y cantidad';
    document.getElementById('btnSaveBodega').disabled = true;
    const container = document.getElementById('embodegarList');
    container.innerHTML = '';
    prev = '';
    toEmbodegar.forEach(item => {
        const change = prev != item.categoria;
        let header = '';
        if (change) header = `<li class="list-group-item bg-info"><h5 class="modal-title" >${item.categoria}</h5></li>`
        prev = item.categoria;
        let fecha = new Date(item.fecha1);
        let fechaTxt = `${fecha.toLocaleDateString('es-us', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`;
        const li = document.createElement('li');
        li.setAttribute("class", "list-group-item");
        li.setAttribute("onclick", "toggleCheckboxBodega(this)")
        li.innerHTML = `
            ${header} 
            <input class="form-check-input me-1 checkBodega" type="checkbox" value="" idPlanilla=${item._id} onclick="event.stopPropagation()"><strong _idPlanilla=${item._id}>Prod.: ${item.codigoProducto}</strong> ${item.producto} - Cnt: ${item.cantProd} - L:${item.loteOut} ${fechaTxt} Op: ${item.operario})              
        `;
        container.appendChild(li);
    })

    $('#embodegarModal').modal('show');
})

document.getElementById('btnSaveBodega').addEventListener('click', async e => {
    if (flags.funcionEmbodegar === 'paso4') {
        flags.funcionEmbodegar = 'paso1';
    }
    if (flags.funcionEmbodegar === 'paso3') {
        if (flags.bodegaChange) {
            await saveBodega();
        }
        flags.bodegaChange = false;
        flags.funcionEmbodegar = 'paso4';
        document.getElementById('lblEmbodegar').innerHTML = ' Copiar código y cantidad';
    }
    if (flags.funcionEmbodegar === 'paso2') {
        pyme = '';
        toEmbodegar.selected.forEach(item => {
            pyme += `${item.ccostos}\t${item.loteOut}\n`;
        });
        toClipBoard(pyme);
        document.getElementById('lblEmbodegar').innerHTML = ' Guardar';
        flags.funcionEmbodegar = 'paso3';
    }
    if (flags.funcionEmbodegar === 'paso1') {
        pyme = '';
        toEmbodegar.selected.forEach(item => {
            pyme += `${item.codigoProducto}\t\t\t${item.cantProd}\n`;
        });
        toClipBoard(pyme);
        document.getElementById('lblEmbodegar').innerHTML = ' Copiar c.c y lote';
        flags.funcionEmbodegar = 'paso2';
    }

});

document.getElementById('check_estado').addEventListener('click', async e => {
    updateCheckFacturados();
});

document.getElementById('cardsContainer').addEventListener('change', async e => {

    flags.siChangeH = true;
    itemSelected.idInput = e.target.getAttribute('id');
    if (itemSelected.idInput) {
        let value0 = parseInt(document.getElementById(itemSelected.idInput).value);
        if (value0 === 0) {
            document.getElementById(idInput).value = '';
            return;
        }
        itemSelected.idDocument = e.target.getAttribute('_idOrder');
        itemSelected.idItem = e.target.getAttribute('_idItem');
        itemSelected.value = value0;
        itemSelected.name = document.getElementById(`lbl${itemSelected.idItem}`).innerHTML;
        itemSelected.oldValue = document.getElementById(`in_${itemSelected.idItem}`).placeholder;
    }
});

document.getElementById('cardsContainer').addEventListener('click', async e => {
    let role = e.target.getAttribute('_role');
    if (role === 'hist') {

        itemSelected.idDocument = e.target.getAttribute('_idDoc');
        itemSelected.idItem = e.target.getAttribute('_idItem');
        itemSelected.name = document.getElementById(`lbl${itemSelected.idItem}`).innerHTML;
        await getHistory();
    }
});

document.getElementById('cardsContainer').addEventListener('focusin', async e => {

    const idDoc = e.target.getAttribute('_idOrder');
    const idItem = e.target.getAttribute('_idItem');
    itemSelected.indexLocalOrder = localOrders.findIndex(doc => doc._id === idDoc);
    console.log(idDoc, idItem);
    if (idDoc && idItem && !flags.siChangeH) {
        workFilter.oneId = idDoc;
        await qerryInputs();
    }
})

document.getElementById('cardsContainer').addEventListener('focusout', async e => {
    if (flags.siChangeH) {
        let match = false, orderItem = {};
        const documentO = localOrders.find(doc => doc._id === itemSelected.idDocument);
        const index = localOrders.findIndex(doc => doc._id === itemSelected.idDocument);
        itemSelected.currPackage = '';
        document.getElementById('txtActions').value = '';
        configPackage(index);
        configBotonesPack();
        //console.log(encaje, mayor)
        if (documentO) {
            orderItem = documentO.orderItem.find(item => item._id === itemSelected.idItem);
            match = orderItem ? true : false;
        }
        if (!match) {
            toastr.error('Algo salió mal. Los datos no se enviaron, recargue la pagina', 'Error');
            return;
        }
        const currentInput = document.getElementById(itemSelected.idInput);
        currentInput.value = '';
        currentInput.placeholder = 'Enviando...'

        itemSelected.code = orderItem.code;
        lotesList = await getLotes(itemSelected.code);
        if (lotesList.length < 1) {
            currentInput.placeholder = 'No hay disponibles';
            toastr.warning('Ingrese lote manualmente');
            const userInput = prompt("Por favor, ingresa el lote:");
            if (userInput !== null) {
                lotesList = [{
                    fecha1: Date(),
                    loteOut: userInput,
                    _id: 0
                }];
                flags.siChangeH = false;
                flags.historyModalHide = false;
                renderLotes();
            } else {
                console.log("El usuario canceló el diálogo.");
            }
        } else {
            flags.siChangeH = false;
            flags.historyModalHide = false;
            renderLotes();
            //console.log(localOrders[])
        }
    }
});

document.getElementById('cardsContainer').addEventListener('input', async e => {
    let i = e.target.getAttribute('_idt');
    itemSelected.idBtn = 'fac' + i;
    document.getElementById(itemSelected.idBtn).disabled = true;
});

document.getElementById('embodegarList').addEventListener('change', async e => {
    embodegarCambios();
});

document.getElementById('embodegarModal').addEventListener('hide.bs.modal', async e => {
    if (flags.bodegaChange) {
        const confirmacion = confirm('Ha seleccionado varios items, si ya los embodegó y no guarda los cambios podria duplicarse la informacion!, ¿desea Guardar o Cancelar?');
        if (confirmacion) {
            saveBodega();
        }
    }
});

document.getElementById('historyModal').addEventListener('hide.bs.modal', async e => {
    if (flags.editado) {
        const confirmacion = confirm('Ha efectuado algunos cambios, ¿desea Guardar o Cancelar?');
        if (confirmacion) {
            await updateHistory();
        }
    }
    flags.btnSndEdit = 'send';
    toggleBtnHistory()
});

document.getElementById('itemAlert').addEventListener('click', async e => {
    resMamager(true);
});

document.getElementById('lotesAvList').addEventListener('change', async e => {
    itemSelected.lotes = paintLotesButton();
});

document.getElementById('txtActions').addEventListener('change', async e => {
    paintLotesButton();
});

document.getElementById('lotesFooter').addEventListener('click', async e => {
    const accion = e.target.getAttribute('_acc');
    if (accion) {
        flags.actionModal = accion;
        if (flags.actionModal != 'delete') {
            $('#lotesListModal').modal('hide');
        }

        if (flags.actionModal === 'delete') {
            const result = itemSelected.lotes.map(item => ({ _id: item.id, agotado: true }));
            const res = await fetch('/domain/lotes/state', {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: "PUT",
                body: JSON.stringify(result)
            });
            const dats = await res.json();
            if (dats.fail) {
                toastr.error(dats.message);
                return;
            }
            toastr.info(dats.message);
            const list = document.getElementById("lotesAvList");
            itemSelected.lotes.forEach(item => {
                const elementToRemove = list.querySelector(`li[_lote="${item.lote}"]`);
                if (elementToRemove) {
                    elementToRemove.remove();
                }
            })
        }
    }
});

document.getElementById('lotesHistoryModal').addEventListener('click', async e => {
    itemSelected.loteEditHistory = e.target.getAttribute('_lote');
    console.log('clicklista reemplazar code', itemSelected.loteEditHistory)
    if (itemSelected.loteEditHistory) {
        const td = document.getElementById(`tdh${itemSelected.index}`);
        itemSelected.historyDisp[itemSelected.index].loteVenta = itemSelected.loteEditHistory;
        cambiosEmbalaje(itemSelected.index)
        td.innerHTML = itemSelected.loteEditHistory;
    }
    $('#lotesHistoryModal').modal('hide');
});

document.getElementById('lotesHistoryModal').addEventListener('hide.bs.modal', async e => {
    document.getElementById('historyModal').style.display = 'block';
});

document.getElementById('lotesListModal').addEventListener('hide.bs.modal', async e => {
    if (flags.historyModalHide) {     //esta en modo editor
        document.getElementById('historyModal').style.display = 'block';
        const loteSelected = itemSelected.lotes ? itemSelected.lotes[0].lote : '';
        console.log('pack:', itemSelected.package, 'lote:', loteSelected);
        itemSelected.loteEditHistory = loteSelected;
        console.log('clicklista reemplazar code', itemSelected.loteEditHistory)
        if (itemSelected.loteEditHistory) {
            document.getElementById(`tdp${itemSelected.index}`).innerHTML = itemSelected.package;
            const td = document.getElementById(`tdh${itemSelected.index}`);
            itemSelected.historyDisp[itemSelected.index].loteVenta = itemSelected.loteEditHistory;
            itemSelected.historyDisp[itemSelected.index].package = itemSelected.package;
            itemSelected.historyDisp[itemSelected.index].avResponse = itemSelected.avResponse;
            cambiosEmbalaje(itemSelected.index)
            td.innerHTML = itemSelected.loteEditHistory;
        }

        return;
    }



    if (flags.actionModal === 'exit') {
        document.getElementById(`in_${itemSelected.idItem}`).placeholder = itemSelected.oldValue;
        return
    }


    itemToSend = {};
    const date = new Date();
    itemToSend.fechaHistory = date.toISOString();
    itemToSend.loteVenta = itemSelected.lotes ? itemSelected.lotes[0].lote : '';
    itemToSend.qtyHistory = itemSelected.value;
    itemToSend.idDocument = itemSelected.idDocument;
    itemToSend.idItem = itemSelected.idItem;
    itemToSend.package = itemSelected.package;
    itemToSend.avResponse = itemSelected.avResponse;
    oneOrder = {};
    let localResponse = {};
    const url = '/domain/despachos/update';
    checkAnswerServer(url, 'PUT', itemToSend)
        .then(respuesta => {
            return respuesta.json();
        })
        .then(data => {
            localResponse = data;
            if (data.success) {
                resMamager(true);
                oneOrder = localResponse.data;
                sendItem();
            } else {
                resMamager(false, itemSelected.name);
            }
        })
        .catch(error => {
            resMamager(false, itemSelected.name);
            console.error('Error en endpoint1:', error);
        });
});

document.getElementById('bodyHistory').addEventListener('change', async e => {
    const _role = e.target.getAttribute('_role');
    const index = e.target.getAttribute('_index');
    cambiosEmbalaje(index);
})

document.getElementById('bodyHistory').addEventListener('click', async e => {
    const _role = e.target.getAttribute('_role');
    itemSelected.index = e.target.getAttribute('_index');
    if (flags.btnSndEdit === 'edit' && _role === 'lote') {
        itemSelected.currPackage = parseInt(e.target.getAttribute('_pack'));
        document.getElementById('historyModal').style.display = 'none';
        flags.historyModalHide = true;
        //renderLotesHist();
        //const documentO = localOrders.find(doc => doc._id === itemSelected.idDocument);
        document.getElementById('txtActions').value = '';
        const index = localOrders.findIndex(doc => doc._id === itemSelected.idDocument);
        configPackage(index);
        configBotonesPack(true);
        renderLotes();
    }
})

//* * * * * * * * * *    FUNCIONES   * * * * * * * * * * * * * * * * * * * * * * * *

async function actInputs() {
    workFilter.fx = 'c';
    workFilter.oneId = itemSelected.idDocument;
    const res = await fetch("/domain/despachos", {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(workFilter)
    })
    const data = await res.json();
    workFilter.oneId = false;
    if (data.fail) {
        toastr.error('Reintente!', 'No se ha podido recibir.', 'Pedido');
        return false;
    }
    oneOrder = data;
    sendItem();
}

async function qerryInputs() {
    workFilter.fx = 'q';
    const res = await fetch("/domain/despachos", {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(workFilter)
    })
    const data = await res.json();
    workFilter.oneId = false;
    if (data.fail) {
        toastr.error('Reintente!', 'No se ha podido recibir.', 'Pedido');
        return false;
    }
    oneOrder = data;
    sendItem();
}

async function afterLoad() {

};

function alertSend(estado, item) {
    const seccion = document.getElementById("accordionPanel");
    const element = document.getElementById("seccAlert");
    if (!estado) {
        document.getElementById('itemToCheck').textContent = item;
        element.style.display = '';
        const yOffset = seccion.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: yOffset, behavior: 'smooth' });
    } else {
        element.style.display = 'none';
    }
}

function businessHours(desdeFecha, hastaFecha) {
    const desde = new Date(desdeFecha);
    const hasta = new Date(hastaFecha);
    const horasTotales = (hasta - desde) / (1000 * 60 * 60);
    let sethabiles = [
        [25],
        [8, 9, 10, 11, 12, 14, 15, 16],
        [8, 9, 10, 11, 12, 14, 15, 16],
        [8, 9, 10, 11, 12, 14, 15, 16],
        [8, 9, 10, 11, 12, 14, 15, 16],
        [8, 9, 10, 11, 12, 14, 15, 16],
        [8, 9, 10, 11, 12],
    ];

    let horasHabiles = 0;

    for (let hoursAgo = 0; hoursAgo < horasTotales; hoursAgo++) {
        const diaSemana = desde.getDay(); // 0 para domingo, 1 para lunes, ..., 6 para sábado
        const hora = desde.getHours();
        if (sethabiles[diaSemana].includes(hora)) {
            horasHabiles++;
        }
        desde.setHours(desde.getHours() + 1);

    }
    return horasHabiles
}

function cambiosEmbalaje(index) {
    flags.editado = true;
    document.getElementById('btnAsignar').disabled = false;
    itemSelected.historyDisp[index].modificado = true;
    itemSelected.historyDisp[index].adjust = parseInt(document.getElementById(`inadj${index}`).value) || 0;
}

function deshabilitar(estado) {
    coleccionIn = document.querySelectorAll('.form-control');
    coleccionIn.forEach(input => {
        input.disabled = !estado;
    })
}

function embodegarCambios() {
    let listChk = document.getElementsByClassName('checkBodega');
    let countChecked = 0;
    flags.bodegaChange = true;
    toEmbodegar.selected = [];
    Array.from(listChk).forEach(item => {
        if (item.checked) {
            countChecked++;
            const id = item.getAttribute('idplanilla');
            const currentItem = toEmbodegar.find(doc => doc._id === id);
            toEmbodegar.selected.push(currentItem);
        }
    });
    const btnSave = document.getElementById('btnSaveBodega');
    if (countChecked < 1) {
        btnSave.disabled = true;
    } else {
        btnSave.disabled = false;
    }
}

function fechaFormated(fecha) {
    let f = new Date(fecha);
    const a = f.getFullYear();
    const m = ("0" + (f.getMonth() + 1)).slice(-2);
    const d = ("0" + (f.getDate())).slice(-2);
    const h = ("0" + (f.getHours())).slice(-2);
    const mins = ("0" + (f.getMinutes())).slice(-2);
    return `${d}-${m}-${a} ${h}:${mins}`;
}

async function getHistory() {
    flags.editado = false;
    const currentDoc = localOrders.find(doc => doc._id === itemSelected.idDocument);
    const deshabilitar = currentDoc.state === 1;
    document.getElementById('btnAsignar').disabled = deshabilitar;
    const url = '/domain/despachos/history';
    let response = await fetch(url, {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ "idDoc": itemSelected.idDocument, "idItem": itemSelected.idItem })
    })
    const data = await response.json();
    console.log(data)
    itemSelected.historyDisp = data[0].orderItem.historyDisp;
    const cabecera = document.getElementById('headHistory');
    cabecera.innerHTML = `
        <h5 class="modal-title" id="vistaLabel">Detalle de embalaje Cliente: ${currentDoc.client}<br>${itemSelected.name} </strong></h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
    `;
    let pendiente = data[0].orderItem.qty - data[0].orderItem.dispatch;
    pendiente = pendiente < 0 ? 0 : pendiente;
    const vistaContainer = document.getElementById('bodyHistory');
    vistaContainer.innerHTML = '';
    const div = document.createElement('table');
    div.setAttribute('class', 'table table-success table-striped');
    div.innerHTML = `
            <thead>
                    <tr>
                    <th scope="col">Fecha</th>
                    <th scope="col">Op. / Caja</th>
                    <th scope="col">Lote</th>
                    <th scope="col">Cant.</th>
                    <th scope="col">Ajuste</th>
                    </tr>
            </thead>
            <tbody id="vistaHistory">
            </tbody>
            <thead>
            <tr>
              <th scope="col"></th>
              <th scope="col">Pendiente:</th>
              <th scope="col">${pendiente}</th>
            </tr>
            </thead>
    `;
    vistaContainer.appendChild(div);
    const container2 = document.getElementById('vistaHistory');
    container2.innerHTML = '';
    data[0].orderItem.historyDisp.forEach((fila, index) => {
        let fecha = new Date(fila.fechaHistory);
        const opciones = {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        };
        const fechaTxt = fecha.toLocaleString('es-ES', opciones);
        const tr = document.createElement('tr');
        tr.innerHTML = `
                    <td>${fechaTxt}</td>
                    <td _pack = ${fila.package} _role="lote" id=tdp${index} _index=${index}>${fila.dspHistory} / ${fila.package}</td>
                    <td _pack = ${fila.package} _role="lote" id=tdh${index} _index=${index}>${fila.loteVenta}</td>
                    <td  _index=${index}>${fila.qtyHistory}</td>
                    <td _role="adj" id=tda${index} _index=${index}>
                        <input _role="adj" _index=${index} id=inadj${index} class="form-control form-control-sm in-adj" disabled=true type="number" value=0>
                    </td>
                `;
        container2.appendChild(tr);
    })

    $('#historyModal').modal('show');
}

async function getLotes(code) {
    const filter = {};
    filter.fx = 'l';
    filter.code = code;
    filter.otrosMatch = [];
    try {
        const res = await fetch("/domain/despachos", {
            headers: {
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify(filter)
        })
        const data = await res.json();
        data.shift();
        toastr.remove();
        return data;
    } catch (error) {
        resMamager(false, itemSelected.name);
        toastr.error('Error al obtener los lotes');
        return [];
    }
}

function hoursAgo(f) {
    const entrega = new Date(f);
    const ahora = new Date();
    const diferenciaEnMilisegundos = ahora - entrega;
    const diferenciaEnMinutos = Math.trunc(diferenciaEnMilisegundos / 60000);
    const horas = Math.trunc(diferenciaEnMinutos / 60);
    const minutos = diferenciaEnMinutos % 60;
    const formatoHoras = ("00" + Math.abs(horas)).slice(-3);
    const formatoMinutos = ("0" + Math.abs(minutos)).slice(-2);
    const texto = `${formatoHoras}:${formatoMinutos}`;
    return { "texto": texto, "horas": horas };
}

async function init() {
    document.getElementById('title-main').innerHTML = 'Despachos';

    //workFilter.modelo = 'Order';
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
    backFilter.sortBy = 'delivery';
    backFilter.sortOrder = -1;
    backFilter.valorBoolean = 'false';
    backFilter.group = 'itemspp';
    backFilter.datepp = formatDate(new Date());
    backFilter.keyGroup = 'createdAt';

    workFilter.sw = true; //esto es solo para DESPACHOS

    let response = await fetch("/domain/despachos", {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ fx: 'k' })
    })
    let data = await response.json();
    if (data.message) {
        toastr.error(data.message);
        return;
    }
    currentKeys = data;
    flags.accSndEdit = 'edit';
    flags.prevNotice = 'init';
    startPolling();
}

async function pollServer() {
    if (isUserActive) {
        console.log('Consultando servidor...');
        const res = await fetch('/domain/notice', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: "POST",
            body: JSON.stringify({
                model: 'Order',
                findField: 'createdAt',
                projectField: 'consecutivo'
            })
        });

        const data = await res.json();
        if (data.fail) {
            toastr.error(data.message);
            return; // Salir en caso de error
        }
        if (flags.prevNotice != 'init' && flags.prevNotice != data[0]._id) {
            console.log('nnneeewwsss');
            mostrarAlerta();
        }
        flags.prevNotice = data[0]._id;
    }
}

async function loadTemplates() {
    if (templates) {
        console.log('not load new templates');
        return;
    }
    templates = {};
    const designs = [100, 200, 201];
    const localTemplates = [];
    for (const model of designs) {
        try {
            const res = await fetch('/domain/templates-list', {
                headers: {
                    'Content-Type': 'application/json'
                },
                method: "POST",
                body: JSON.stringify({
                    "idTemplate": model, // Usar el modelo actual
                    fx: 'content'
                })
            });

            const data = await res.json();
            if (data.fail) {
                toastr.error(data.message);
                return; // Salir en caso de error
            }

            localTemplates.push(data[0]); // Añadir el template en el orden correcto
        } catch (error) {
            toastr.error('Error al cargar el template');
            console.error('Error fetching template:', error);
        }
    }
    templates.printAveria = localTemplates[0];
    templates.printRemision = localTemplates[1];
    templates.printEmpaque = localTemplates[2];
}


function paintCard(itemCard, indice) {
    const order = itemCard;
    const progressBar = document.getElementById(`pbar${order._id}`);
    const avr = Math.trunc((100 * order.TotalDisp) / order.totalReq);
    progressBar.style.width = `${avr}%`;
    progressBar.setAttribute('aria-valuenow', avr);
    progressBar.textContent = `${avr}%`;
    const horasentrega = hoursAgo(order.delivery);
    const colorh = horasentrega.horas > 5 ? 'danger' : 'success';
    const today = new Date();
    const haceHoras = businessHours(new Date(order.createdAt), today);
    const reloj = document.getElementById(`reloj${indice}`);
    reloj.setAttribute('class', `text-${colorh}`);
    const pill = document.getElementById(`nuevo${indice}`);
    const pillState = haceHoras < 5 ? '' : 'none';
    pill.style.display = pillState
    const Finalizado = document.getElementById(`end${indice}`);
    Finalizado.style.display = order.state === 1 ? 'inline' : 'none';
    const desHabilitar = order.state === 1;
    order.orderItem.forEach(item => {
        document.getElementById(`in_${item._id}`).disabled = desHabilitar;
        const dif = item.qty - item.dispatch;
        const clase = ''
        let status;
        if (item.dispatch == 0) {
            status = ' bg-secondary';
        } else {
            if (item.lotesOk) {
                if (dif < 0) status = ' bg-warning';
                if (dif > 0) status = ' bg-primary';
                if (dif == 0) status = ' bg-success';
            } else {
                status = ' bg-danger';
            }
        }
        const c1 = document.getElementById(`c1_${item._id}`);
        c1.setAttribute('class', `text-white it-desc ${status}`);
        const c2 = document.getElementById(`c2_${item._id}`);
        c2.setAttribute('class', `text-white it-desc ${status}`);
        const inCnt = document.getElementById(`in_${item._id}`);
        inCnt.placeholder = item.dispatch;
    });
}

function paintLotesButton() {
    itemSelected.indexLocalOrder = localOrders.findIndex(doc => doc._id === itemSelected.idDocument);
    let listChk = document.getElementsByClassName('checkArchivar');
    let countChecked = 0, values = [];
    let msg = '', errors = 0;
    const modoPack = configPack.mayor > 0;
    const esOrden = localOrders[itemSelected.indexLocalOrder].siOrder;
    Array.from(listChk).forEach(item => {
        if (item.checked) {
            countChecked++;
            values.push({ id: item.getAttribute('idlote'), lote: item.value })
        }
    });
    const del = document.getElementById('btnDeleteLote');
    const sel = document.getElementById('btnSelectLote');
    const acc = document.getElementById('txtActions');
    if (countChecked < 1 && !flags.historyModalHide) {
        msg = 'No ha seleccionado un Lote; ';
        errors++;
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
    if (modoPack && itemSelected.package < 0) {
        sel.disabled = true;
        msg += 'No ha seleccionado una Caja; ';
        errors++;
    }
    if (!esOrden && !acc.value && !flags.historyModalHide) {
        sel.disabled = true;
        msg += 'Falta la accion emprendida por la averia';
        errors++;
    }
    if (!esOrden) {
        document.getElementById('seccActions').style.display = '';
        itemSelected.avResponse = acc.value;
    } else {
        document.getElementById('seccActions').style.display = 'none';
    }


    const alerta = document.getElementById('alertBotones');
    alerta.classList.remove('alert-success', 'alert-danger');
    if (errors > 0) {
        alerta.innerHTML = `Errores(${errors}): ${msg}`;
        alerta.classList.add('alert-danger');
    } else {
        alerta.innerHTML = 'O.K.';
        alerta.classList.add('alert-success');
    }



    return values;
}

function renderbodyTable(item, idtr, orderid, bodyContainer) {
    const order = { _id: orderid }
    const tr = document.createElement('tr');
    tr.innerHTML = `
                    <th id="c1_${item._id}" >
                        <label id="lbl${item._id}" for="in_${item._id}">${item.product}</label>
                    </th>
                    <td id="c2_${item._id}" >
                        <label for="in_${item._id}">${item.qty}</label>
                    </td>
                    <td _idItem="${item._id}" _idDoc="${order._id}" _role="hist">
                        <label  id="c3_${item._id}" ><i _idItem="${item._id}" _idDoc="${order._id}" _role="hist" class="fa fa-search-plus" aria-hidden="true"></i></i>
                    </td>
                    <td>
                        <input idin=true id="in_${item._id}" type="number"  class="form-control text-end it-input fade-input text-primary" value="" _idOrder="${order._id}" _idItem="${item._id}" _qty="${item.qty}"  _idt="${idtr}">
                    </td>
                `;
    bodyContainer.appendChild(tr);
}

async function renderCards() {
    const cardsContainer = document.getElementById("cardsContainer");
    let i = 0;
    cardsContainer.innerHTML = '';
    for (let order of localOrders) {
        const delivery = fechaFormated(new Date(order.delivery));
        let nota = ` Entrega: ${delivery}`;
        nota += order.notes ? ` - ${order.notes}` : '';
        nota += order.id_compras ? ` O.C.#  ${order.id_compras}` : '';
        const avr = Math.trunc((100 * order.TotalDisp) / order.totalReq);
        const txtavr = avr > 100 ? 'Alert! +100' : avr;
        const created = fechaFormated(new Date(order.createdAt));
        const numeracion = order.siOrder ? 'Pedido # ' : `AVERIAS # `;
        const docPrint = order.siOrder ? 'printRemision' : 'printAveria';
        const txtPrint = configLabel(docPrint);
        const estado = order.notes ? 'bg-warning' : '';
        const horasentrega = hoursAgo(order.delivery);
        const stateAveria = order.siOrder ? '' : 'bg-dark text-light'
        const divCard = document.createElement('div');
        divCard.setAttribute('class', 'accordion-item ');
        divCard.setAttribute('id', 'acc-item' + i);
        divCard.innerHTML = `
            <h3 class="accordion-header" id="heading${i}">
                <button class="${stateAveria} accordion-button collapsed fs-5" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}">
                    <div class="flex-fill">${order.client}<span id="nuevo${i}" class="position-absolute top-2 start-11 translate-middle badge rounded-pill bg-warning">Nuevo!</span>
                    </div>
                    <h5 id="reloj${i}" class="">${txtavr}% ${horasentrega.texto}</h5>
                </button>
            </h3>
            <div id="collapse${i}" class="accordion-collapse collapse" data-bs-parent="#accordionPanel">
                <div class="accordion-body">
                    <div class="card">
                        <div class="card-header ${estado}">
                            <strong>${numeracion} ${order.consecutivo}</strong><br>
                            <span class="fs-5">
                                ${nota}
                            </span>
                            <div class="progress">
                                <div id="pbar${order._id}" class="progress-bar bg-info" role="progressbar"   aria-valuemin="0" aria-valuemax="100"></div>
                            </div>
                        </div>
                        <div class="card-body">
                            <span>Enviado el : ${created}, por: ${order.sellerName}</span>
                            <button id="fac${i}"class="btn btn-primary mx-2 clip position-relative" idcard=${i} href="#" >Facturar
                            
                            <span id="end${i}" class="position-absolute top-0 start-200 translate-middle badge rounded-pill bg-danger" style = "display:none" >Finalizado!</span></button>
                            <button id="btnHide${i}"class="btn btn-primary mx-2 btn-hide position-relative" idcard=${i} href="#"  style = display:none>Ocultar</button>
                            
                            
                            <button type="button" id="print${i}" idcard=${i} _model ="${docPrint}" class="btn btn-outline-secondary print">
                                <i class="fa fa-print" aria-hidden="true"></i> ${txtPrint}</button>
                            <button type="button" id="opPrint${i}" idcard=${i} class="opPrint btn btn-outline-secondary dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
                                <span class="visually-hidden">Toggle Dropdown</span>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item opModel" idcard=${i} opModel ="printAveria" href="#">${configLabel("printAveria")}</a></li>
                                <li><a class="dropdown-item opModel" idcard=${i} opModel ="printRemision" href="#">${configLabel("printRemision")}</a></li>
                                <li><a class="dropdown-item opModel" idcard=${i} opModel ="printEmpaque" href="#">${configLabel("printEmpaque")}</a></li>
                                
                            </ul>
 
                            


                            
                            
                            
                            <table class="table table-hover table-bordered">
                                <thead>
                                    <tr>
                                        <th scope="col" >Prod.</th>
                                        <th scope="col" >Pedido</th>
                                        <th scope="col" >Hist.</th>
                                        <th scope="col" >Cant.</th>
                                    </tr>
                                </thead>
                                <tbody id="body${i}">
                                </tbody>
                            </table> 
                        </div>    
                    </div>
                </div>
            </div>
            `;
        cardsContainer.appendChild(divCard);
        const bodyContainer = document.getElementById('body' + i);
        bodyContainer.innerHtml = '';
        for (let item of order.orderItem) {
            renderbodyTable(item, i, order._id, bodyContainer);
        }
        paintCard(order, i);
        i++;
    }
    fadeInputs();
}

function configLabel(model) {
    switch (model) {
        case 'printAveria':
            return 'Avería';
        case 'printRemision':
            return 'Remisión';
        case 'printEmpaque':
            return 'Empaque';
        default:
            return 'NN';
    }
}

async function renderLotes() {
    if (lotesList.length === 0) return false;
    if (lotesList.length === 1000) {      //borrar  eta seccion ya no debe enviar automaticamente =1
        itemSelected.lote = lotesList[0].loteOut;
        itemToSend = {};
        const date = new Date();
        itemToSend.fechaHistory = date.toISOString();
        itemToSend.loteVenta = lotesList[0].loteOut;
        itemToSend.qtyHistory = itemSelected.value;
        itemToSend.idDocument = itemSelected.idDocument;
        itemToSend.idItem = itemSelected.idItem;
        oneOrder = {};
        let localResponse = {};
        checkAnswerServer('/domain/despachos/update', 'PUT', itemToSend)
            .then(respuesta => {
                return respuesta.json();
            })
            .then(data => {
                localResponse = data;
                if (data.success) {
                    resMamager(true);
                    oneOrder = localResponse.data;
                    sendItem();
                } else {
                    resMamager(false, itemSelected.name);
                }
            })
            .catch(error => {
                resMamager(false, itemSelected.name);
                console.error('Error en endpoint1:', error);
            });
    } else {

        $('#lotesListModal').modal('show');
        document.getElementById('modalLabelLotes').innerHTML = `Lotes para ${itemSelected.name}`;
        const container = document.getElementById('lotesAvList');
        container.innerHTML = '';
        lotesList.forEach(item => {
            let fecha = new Date(item.fecha1);
            const fechaTxt = `${fecha.toLocaleDateString('es-us', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`;
            const li = document.createElement('li');
            li.setAttribute("class", "list-group-item");
            li.setAttribute("_lote", item.loteOut);
            li.setAttribute("onclick", "toggleCheckbox(this)")
            li.innerHTML = `
            <input class="form-check-input me-1 checkArchivar" type="checkbox" value=${item.loteOut} idLote=${item._id}  onclick="event.stopPropagation()"><strong _lote=${item.loteOut}>${item.loteOut}</strong>  (${fechaTxt})              
        `;
            container.appendChild(li);
        })

        const container2 = document.getElementById('actionsList');
        container2.innerHTML = '';
        actions.forEach((action, index) => {
            const li = document.createElement('li');
            li.innerHTML = `<a class="dropdown-item" href="#" roleK="Accion" value=${index}>${action.titulo}</a>`;
            container2.appendChild(li);
        })
        flags.actionModal = 'none';
        paintLotesButton();
    }
}

function renderLotesHist() {
    itemSelected.loteEditHistory = '';
    if (lotesList.length === 0) return false;
    $('#lotesHistoryModal').modal('show');
    const container = document.getElementById('lotesAvHistory');
    container.innerHTML = '';
    lotesList.forEach(item => {
        let fecha = new Date(item.fecha1);
        const fechaTxt = `${fecha.toLocaleDateString('es-us', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`;
        const li = document.createElement('li');
        li.setAttribute("class", "list-group-item");
        li.setAttribute("_lote", item.loteOut);
        li.innerHTML = `
            <strong _lote=${item.loteOut}>${item.loteOut}</strong>  (${fechaTxt})              
        `;
        container.appendChild(li);
    })

}

async function renderTable() {
    loadActions();
    workFilter.fx = 'c'
    const res = await fetch("/domain/despachos", {
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
    localOrders = data;
    renderCards();
}

function resMamager(estado, item) {
    document.getElementById(itemSelected.idBtn).disabled = !estado;
    deshabilitar(estado);
    alertSend(estado, item);
}

async function saveBodega() {
    const enviar = {};
    enviar.modelo = 'Planilla';
    enviar.documentos = [];
    toEmbodegar.selected.forEach(item => {
        enviar.documentos.push({ _id: item._id, embodegado: true })
    });
    const res = await fetch('/core/save', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "PUT",
        body: JSON.stringify(enviar)
    });
    const dats = await res.json();
    if (dats.fail) {
        toastr.error(dats.message);
        return;
    }
    toastr.info(dats.message);
    enviar.documentos = [];
    toEmbodegar.selected.forEach(item => {
        enviar.documentos.push({
            codigo: item.codigoProducto,
            producto: item.producto,
            cantidad: item.cantProd
        });
    });
    const resB = await fetch('/core/embodegar', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(enviar)
    });
    const responseB = resB.json();
    toastr.info(responseB.message)

}

async function sendItem() {
    const updatedOrder = oneOrder[1];
    const indexToUpdate = localOrders.findIndex(order => order._id === updatedOrder._id);
    if (indexToUpdate !== -1) {
        localOrders[indexToUpdate] = updatedOrder;
    }
    paintCard(updatedOrder, indexToUpdate);
}



function toggleCheckbox(liElement) {
    const checkbox = liElement.querySelector('.checkArchivar');
    checkbox.checked = !checkbox.checked;
    itemSelected.lotes = paintLotesButton();
}

function toggleCheckboxBodega(liElement) {
    const checkbox = liElement.querySelector('.checkBodega');
    checkbox.checked = !checkbox.checked;
    embodegarCambios();
}

function toggleBtnHistory() {
    const boton = document.getElementById('btnAsignar');
    boton.disabled = !flags.editado;
    if (flags.btnSndEdit === 'edit') {
        boton.innerHTML = 'Guardar';
        boton.setAttribute('_role', 'send');
        boton.classList.remove('btn-primary');
        boton.classList.add('btn-danger');
        const setEnable = document.getElementsByClassName('in-adj');
        Array.from(setEnable).forEach((item, index) => {
            document.getElementById(`inadj${index}`).disabled = false;
        })
    } else {
        boton.innerHTML = 'Editar';
        boton.setAttribute('_role', 'edit');
        boton.classList.remove('btn-danger');
        boton.classList.add('btn-primary');
    }
}

function updateCheckFacturados() {
    let checkEstado = document.getElementById('check_estado').checked;
    workFilter.sw = checkEstado;
    if (checkEstado) {
        setFilter()
    } else {
        k_sortBy.value = 'createdAt';
        k_checkDsc.checked = true;
    }

    workFilter.filterStatus = 'change';
    showAlertFilter();
    paintFilter()
    const lblTexto = checkEstado ? 'No Facturados' : 'Todos';
    document.getElementById('lbl_estado').innerHTML = lblTexto;
}

async function updateHistory() {
    const url = "/domain/despachos-hist/update";
    const tosend = {};
    tosend._id = itemSelected.idDocument;
    tosend.idItem = itemSelected.idItem;
    tosend.obj = itemSelected.historyDisp
        .filter(objeto => objeto.modificado === true) // Filtra los objetos donde el campo 'modificado' es true
        .map(({ fechaHistory, qtyHistory, dspHistory, modificado, ...resto }) => resto); // Mapea los objetos filtrados y devuelve el resto de las propiedades, excluyendo fechaHistory y qtyHistory
    let response = await fetch(url, {
        headers: { 'content-type': 'application/json' },
        method: 'PUT',
        body: JSON.stringify(tosend)
    })
    const data = await response.json();
    if (data.fail) {
        toastr.error(data.message);
        return;
    }

    oneOrder = data;
    sendItem();
}

// * * * * * * * * * * * * * *   funciones nueva encajado:

document.getElementById("bodyArchivar").addEventListener('click', async e => {
    const keyV = {};
    keyV.value = e.target.getAttribute('value');
    keyV.role = e.target.getAttribute('roleK');
    keyV._id = e.target.getAttribute('_id');

    keyBoardPack(keyV);
})

function keyBoardPack(keyV) {
    if (keyV.role === 'number') {
        console.log(keyV.value);
        itemSelected.package = parseInt(keyV.value);
        for (let i = 0; i <= 8; i++) {
            const boton = document.getElementById(`btn${i}`);
            boton.classList.remove('bg-success', 'bg-secondary');
            if (parseInt(keyV._id) == i) {
                boton.classList.add('bg-success');
            }
            paintLotesButton();
        }
    }
    if (keyV.role === 'addPack') {
        configPack.mayor++;
        configBotonesPack()

    } if (keyV.role === 'nextPack') {
        configPack.cntPagina++;
        configPack.curPagina = configPack.cntPagina % configPack.maxPagina;
        configBotonesPack()
    }

    if (keyV.role === 'Accion') {
        msg = actions[parseInt(keyV.value)].titulo || 'NN'
        document.getElementById('txtActions').value = msg;
        paintLotesButton();
    }
}

// Cerrar el modal cuando se hace clic fuera de él
window.onclick = function (event) {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        modal.classList.remove('show');
    }
};

function configBotonesPack(editando = false) {
    configPack.maxPagina = parseInt(configPack.mayor / 8) + 1;
    const cero = document.getElementById('btn0');
    cero.innerHTML = 0;
    cero.classList.remove('bg-success', 'bg-secondary');
    if (configPack.mayor < 1 && !editando) {
        cero.classList.add('bg-success');
    }
    if (editando) {
        //configPack.cntPagina = itemSelected.currPackage;

        //configPack.curPagina = configPack.cntPagina % configPack.maxPagina;
    }
    if (itemSelected.currPackage == 0) {
        cero.classList.add('bg-success');

    }
    for (let i = 1; i <= 8; i++) {
        const boton = document.getElementById(`btn${i}`);
        boton.classList.remove('bg-success', 'bg-secondary');
        const numR = i + (configPack.curPagina * 8);

        if (numR == itemSelected.currPackage) {
            boton.classList.add('bg-success');

        }

        boton.innerHTML = numR;
        boton.disabled = numR > configPack.mayor;
        boton.value = numR;
    }
    if (configPack.maxPagina - configPack.curPagina > 1) {
        //configPack.cntPagina++;
        configPack.curPagina++;
    }
};

function configPackage(index) {
    configPack.index = index;
    configPack.cntPagina = 0;

    const documentO = localOrders[configPack.index];
    const encaje = itemsPorCaja(documentO.orderItem);
    configPack.mayor = packageMayor(encaje);
    if (flags.historyModalHide) {
        itemSelected.package = itemSelected.currPackage;
        configPack.curPagina = itemSelected.package == 0 ? 0 : parseInt((itemSelected.package - 1) / 8)
    } else {
        itemSelected.package = configPack.mayor > 0 ? -1 : 0;
        configPack.curPagina = 0;
    }


}


function itemsPorCaja(orderI) {
    const packageCount = {};
    orderI.forEach(item => {
        item.historyDisp.forEach(history => {
            const packageNum = history.package;
            packageCount[packageNum] = (packageCount[packageNum] || 0) + 1;
        });
    });

    const sortedPackageCountArray = Object.entries(packageCount)
        .sort((a, b) => b[1] - a[1])   // Ordenar por cantidad (count) descendente
        .map(([pkg, count]) => ({ [pkg]: count }));  // Convertir a objetos individuales

    return sortedPackageCountArray;
}

function packageMayor(arr) {
    let mayorPackage = null;
    let mayorCount = -1;

    arr.forEach(obj => {
        const [pkg, count] = Object.entries(obj)[0]; // Extraer el par package, count
        const packageNumber = Number(pkg);
        const valPkg = parseInt(pkg);
        if (!isNaN(packageNumber) && packageNumber >= 0) {
            if (valPkg > mayorCount) {
                mayorCount = valPkg;
                //mayorPackage = packageNumber;
            }
        }
    });

    return mayorCount;
}

function packageMenor(arr) {
    let menores = 0;

    arr.forEach(obj => {
        const [pkg, count] = Object.entries(obj)[0]; // Extraer el par package, count
        const packageNumber = Number(pkg);
        const valPkg = parseInt(pkg);
        if (!isNaN(packageNumber)) {
            if (valPkg < 1) {
                menores++;
                //mayorPackage = packageNumber;
            }
        }
    });

    return menores;
}

async function loadActions() {
    if (actions) {

        return;
    }
    actions = [];
    const res = await fetch('/domain/actions-list', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({
        })
    });

    const data = await res.json();
    if (data.fail) {
        toastr.error(data.message);
        return; // Salir en caso de error
    }

    actions = data;
    console.log('load new Actions', actions);
}

function mostrarAlerta() {
    const alertElement = document.getElementById('alertNotification');
    alertElement.style.display = 'block';  // Muestra la alerta de forma "sticky"
}

document.getElementById('actualizarBtn').addEventListener('click', () => {
    refreshFilter('off');
    const alertElement = document.getElementById('alertNotification');
    alertElement.style.display = 'none';
});
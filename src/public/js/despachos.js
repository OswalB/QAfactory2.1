let localOrders, flags = {}, itemCollection = {}, itemSelected = {}, itemToSend = {}, oneOrder = {};

document.getElementById('check_estado').addEventListener('click', async e => {
    updateCheckFacturados();
})

document.getElementById('lotesFooter').addEventListener('click', async e => {
    const accion = e.target.getAttribute('_acc');
    if (accion) {
        flags.actionModal = accion;
        console.log(flags.actionModal);
        $('#lotesListModal').modal('hide');
    }
})

document.getElementById('lotesListModal').addEventListener('hide.bs.modal', async e => {
    console.log('accion', flags.actionModal);
    itemToSend = {};
    if (flags.actionModal != 'delete') { //preparar paquete de datos para enviar
        //if (flags.actionModal === 'select') {
            const date = new Date();
            itemToSend.fechaHistory = date.toISOString();
            itemToSend.loteVenta = itemSelected.lotes?itemSelected.lotes[0].lote:'';
            itemToSend.qtyHistory = itemSelected.value;
            itemToSend.idDocument = itemSelected.idDocument;
            itemToSend.idItem = itemSelected.idItem;
            console.log('enviar estos datos:', itemToSend)
            oneOrder = {};
            let localResponse = {};
            checkAnswerServer('/domain/despachos/update', 'PUT', itemToSend)
                .then(respuesta => {
                    console.log('Respuesta desde endpoint1:', respuesta);
                    return respuesta.json();
                })
                .then(data => {
                    localResponse = data;
                    console.log('local', localResponse);

                    if (data.success) {
                        resMamager(true);
                        oneOrder = localResponse.data
                        sendItem();
                    } else {
                        resMamager(false, itemSelected.name);
                    }
                })
                .catch(error => {
                    resMamager(false, itemSelected.name);
                    console.error('Error en endpoint1:', error); // Imprime el error en la consola
                });



        }

        if (flags.actionModal === 'delete') {
            //itemToSend.lotesDelete = itemSelected.lotes[ ].id
            console.log('eliminar estos lotes:')
        }

    //}
});



document.getElementById('cardsContainer').addEventListener('input', async e => {
    let i = e.target.getAttribute('_idt');
    itemSelected.idBtn = 'fac' + i;
    document.getElementById(itemSelected.idBtn).disabled = true;
})

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

    }

})

document.getElementById('cardsContainer').addEventListener('focusout', async e => {

    if (flags.siChangeH) {
        let match = false, orderItem = {};
        const documentO = localOrders.find(doc => doc._id === itemSelected.idDocument);
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
        console.log(itemSelected)
        lotesList = await getLotes(itemSelected.code);
        console.log(lotesList);
        flags.siChangeH = false;
        renderLotes();
    }
})

document.getElementById('lotesAvList').addEventListener('change', async e => {
    itemSelected.lotes = paintLotesButton();
})

document.getElementById('itemAlert').addEventListener('click', async e => {
    resMamager(true);
})

function toggleCheckbox(liElement) {
    const checkbox = liElement.querySelector('.checkArchivar');
    checkbox.checked = !checkbox.checked;
    itemSelected.lotes = paintLotesButton();
}


//* * * * * * * * * *    FUNCIONES   * * * * * * * * * * * * * * * * * * * * * * * *
async function sendItem(){
    console.log('resto del codigooo', oneOrder);
    const updatedOrder = oneOrder[1];
    
    // Encuentra el índice del documento en localOrders usando el ID
    const indexToUpdate = localOrders.findIndex(order => order._id === updatedOrder._id);
    console.log('ind',indexToUpdate)
    // Verifica si se encontró el documento
    if (indexToUpdate !== -1) {
        // Actualiza el documento en localOrders con los datos actualizados del servidor
        localOrders[indexToUpdate] = updatedOrder;
        console.log("Documento actualizado en localOrders:", localOrders[indexToUpdate]);
    } else {
        console.log("Documento no encontrado en localOrders");
    }
    //aqui actuallizar los datos del doscumento ej totaldisp****************
    const progressBar = document.getElementById(`pbar${updatedOrder._id}`);
    const avr = Math.trunc((100 * updatedOrder.TotalDisp) / updatedOrder.totalReq);
    progressBar.style.width = `${avr}%`; 
    progressBar.setAttribute('aria-valuenow', avr); 
    progressBar.textContent = `${avr}%`;

    const bodyContainer = document.getElementById('body' + indexToUpdate);
    bodyContainer.innerHTML = '';
    for (let item of updatedOrder.orderItem) {
        renderbodyTable(item,indexToUpdate, updatedOrder._id, bodyContainer);
    }
}
function renderLotes() {
    if (lotesList.length === 0) return false;
    if (lotesList.length === 1) {
        itemSelected.lote = lote[0].loteOut;
    } else {
        $('#lotesListModal').modal('show');
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
        flags.actionModal = 'none';
        paintLotesButton();
    }
}

function paintLotesButton() {
    let listChk = document.getElementsByClassName('checkArchivar');
    let countChecked = 0, values = [];
    Array.from(listChk).forEach(item => {
        if (item.checked) {
            countChecked++;
            values.push({ id: item.getAttribute('idlote'), lote: item.value })
        }
    })
    console.log(values);
    /*for(let item = 0; item < listChk.length; item++){
         
    }*/
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
    return values;
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
        data.shift();       //elimina el dato contador
        toastr.remove();
        return data;
    } catch (error) {
        resMamager(false, itemSelected.name);
        toastr.error('Error al obtener los lotes');
        return []; // o cualquier otro manejo de errores que desees
    }
}

async function renderTable() {
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
    data.shift();       //elimina el dato contador

    if (data.fail) {
        toastr.error('Reintente!', 'No se ha podido recibir.', 'Pedido');
        return false;
    }
    toastr.remove();
    localOrders = data;
    console.log(localOrders);
    renderCards();
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

async function renderCards() {
    const cardsContainer = document.getElementById("cardsContainer");
    let i = 0;
    cardsContainer.innerHTML = '';
    for (let order of localOrders) {
        const horasentrega = hoursAgo(order.delivery);
        const colorh = horasentrega.horas > 0 ? 'danger' : 'success';
        const oc = order.id_compras ? `O.C.#  ${order.id_compras}` : '';
        const avr = Math.trunc((100 * order.TotalDisp) / order.totalReq);
        const estado = order.notes ? 'bg-warning' : '';
        const delivery = fechaFormated(new Date(order.delivery));
        const created = fechaFormated(new Date(order.createdAt));
        const today = new Date();
        const haceHoras = businessHours(new Date(order.createdAt), today);
        const pill = haceHoras < 5 ? `<span class="position-absolute top-2 start-11 translate-middle badge rounded-pill bg-warning">Nuevo
        <span class="visually-hidden">unread messages</span>
        </span>`: '';
        const estilo = order.state === 1 ? 'inline' : 'none';
        const divCard = document.createElement('div');
        divCard.setAttribute('class', 'accordion-item ');
        divCard.setAttribute('id', 'acc-item' + i);
        divCard.innerHTML = `
            <h3 class="accordion-header" id="heading${i}">
                <button class="accordion-button collapsed fs-5" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}">
                    <div class="flex-fill">${order.client}${pill}</div>
                    <h5 id="reloj${i}" class="text-${colorh}">${horasentrega.texto}</h5>
                </button>
            </h3>
            <div id="collapse${i}" class="accordion-collapse collapse" data-bs-parent="#accordionPanel">
                <div class="accordion-body">
                    <div class="card">
                        <div class="card-header ${estado}">
                            <span class="fs-5">
                                Entregar el: ${delivery} - ${order.notes} - ${oc}
                            </span>
                            <div class="progress">
                                <div id="pbar${order._id}" class="progress-bar bg-info" role="progressbar" style="width: ${avr}%;" aria-valuenow="${avr}" aria-valuemin="0" aria-valuemax="100">${avr}%</div>
                            </div>
                        </div>
                        <div class="card-body">
                            <span>Enviado el : ${created}, por: ${order.sellerName}</span>
                            <button id="fac${i}"class="btn btn-primary mx-2 clip position-relative" idcard=${i} href="#" >Facturar<span class="position-absolute top-0 start-200 translate-middle badge rounded-pill bg-danger" style = display:${estilo} >Finalizado!</span></button>
                            <button id="btnHide${i}"class="btn btn-primary mx-2 btn-hide position-relative" idcard=${i} href="#"  style = display:none>Ocultar</button>
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
        //let j = 0;
        for (let item of order.orderItem) {
            renderbodyTable(item,i, order._id, bodyContainer);
            //j += 1;
        }

        i++;
    }
    fadeInputs();
}

function renderbodyTable(item,idtr, orderid, bodyContainer) {
    const order = {_id:orderid}
    const dif = item.qty - item.dispatch;
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

    if (item.dispatchBy) { dispatchBy = item.dispatchBy };
    let valueDisp = item.dispatch;
    //const idtr = i;
    const tr = document.createElement('tr');
    tr.innerHTML = `
                    <th id="c1_${item._id}" class="text-white ${status} it-desc" >
                        <label id="lbl${item._id}" for="in_${item._id}">${item.product}</label>
                    </th>
                    <td id="c2_${item._id}" class=" text-white ${status} it-desc">
                        <label for="in_${item._id}">${item.qty}</label>
                    </td>
                    <td _idItem="${item._id}" _idDoc="${order._id}">
                        <label  id="c3_${item._id}" ><i _idItem="${item._id}" _idDoc="${order._id}" class="fa fa-search-plus" aria-hidden="true"></i></i>
                    </td>
                    <td>
                        <input idin=true id="in_${item._id}" type="number"  class="form-control text-end it-input fade-input" placeholder="${valueDisp}" value="" _idOrder="${order._id}" _idItem="${item._id}" _qty="${item.qty}" _dispatch="${valueDisp}" _dispatchBy="${item.dispatchBy}" _idt="${idtr}">
                    </td>
                `;
    bodyContainer.appendChild(tr);
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

};

async function afterLoad() {
    //setPaso(0);
    //fadeInputs();

};




function updateCheckFacturados() {
    let checkEstado = document.getElementById('check_estado').checked;
    console.log('updatecheck')
    workFilter.sw = checkEstado;
    if (checkEstado) {
        setFilter()
    } else {
        k_sortBy.value = 'createdAt';
        k_checkDsc.checked = true;
        //k_filterBy.value = '0';
    }

    workFilter.filterStatus = 'change';
    showAlertFilter();
    paintFilter()
    //loadFilter();
    const lblTexto = checkEstado ? 'No Facturados' : 'Todos';
    document.getElementById('lbl_estado').innerHTML = lblTexto;
}

function hoursAgo(f) {
    const entrega = new Date(f);
    const ahora = new Date();
    const diferenciaEnMilisegundos = ahora - entrega;
    const diferenciaEnMinutos = Math.trunc(diferenciaEnMilisegundos / 60000);
    const horas = Math.trunc(diferenciaEnMinutos / 60);
    const minutos = diferenciaEnMinutos % 60;
    const formatoHoras = ("0" + Math.abs(horas)).slice(-2);
    const formatoMinutos = ("0" + Math.abs(minutos)).slice(-2);
    const texto = `${formatoHoras}:${formatoMinutos}`;
    return { "texto": texto, "horas": horas };
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

function resMamager(estado, item) {
    document.getElementById(itemSelected.idBtn).disabled = !estado;
    deshabilitar(estado);
    alertSend(estado, item);
}

function deshabilitar(estado) {
    coleccionIn = document.querySelectorAll('.form-control');
    coleccionIn.forEach(input => {
        input.disabled = !estado;
    })
}

function alertSend(estado, item) {
    const seccion = document.getElementById("accordionPanel");
    const element = document.getElementById("seccAlert");
    if (!estado) {
        document.getElementById('itemToCheck').textContent = item;
        element.style.display = '';
        //window.scroll({top: 0,left: 0,behavior: 'smooth'});
        const yOffset = seccion.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({ top: yOffset, behavior: 'smooth' });
    } else {
        element.style.display = 'none';
    }
}
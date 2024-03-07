let localOrders;

document.getElementById('check_estado').addEventListener('click', async e => {
    updateCheckFacturados();
})

//* * * * * * * * * *    FUNCIONES   * * * * * * * * * * * * * * * * * * * * * * * *
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
        if(sethabiles[diaSemana].includes(hora)){
            horasHabiles ++;
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
        const colorh = horasentrega.horas > 0?'danger':'success';
        const oc = order.id_compras?`O.C.#  ${order.id_compras}`:'';
        const avr = Math.trunc((100 * order.TotalDisp) / order.totalReq);
        console.log(avr)
        const estado = order.notes?'bg-warning':'';
        const delivery = fechaFormated(new Date(order.delivery));
        const created = fechaFormated(new Date(order.createdAt));
        const today = new Date();
        const haceHoras = businessHours(new Date(order.createdAt), today);
        const pill = haceHoras < 5?`<span class="position-absolute top-2 start-11 translate-middle badge rounded-pill bg-warning">Nuevo
        <span class="visually-hidden">unread messages</span>
        </span>`:'';
        const estilo = order.state === 1?'inline':'none';
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
        let j = 0;
        for (let item of order.orderItem) {
            const dif = item.qty - item.dispatch;
            let status;
            if (item.dispatch == 0) {
                status = ' bg-secondary';
            } else {
                if (item.loteVenta) {
                    if (dif < 0) status = ' bg-warning';
                    if (dif > 0) status = ' bg-primary';
                    if (dif == 0) status = ' bg-success';
                } else {
                    status = ' bg-danger';
                }
            }

            if (item.dispatchBy) { dispatchBy = item.dispatchBy };
            let valueDisp = item.dispatch;
            const idtr = i;
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
                        <input idin=true id="in_${item._id}" type="number"  class="form-control text-end it-input" placeholder="${valueDisp}" value="" _idOrder="${order._id}" _idItem="${item._id}" _qty="${item.qty}" _dispatch="${valueDisp}" _dispatchBy="${item.dispatchBy}" _idt="${idtr}">
                    </td>
                `;
            bodyContainer.appendChild(tr);
            j += 1;
        }

        i++;
    }

}

async function init() {
    document.getElementById('title-main').innerHTML = 'Despachos';

    //workFilter.modelo = 'Order';
    backFilter.filterBy = 'state';
    backFilter.filterTxt = '';
    backFilter.limitar = 15;
    backFilter.max = '0';
    backFilter.min = '0';
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
    backFilter.keyGroup = 'createdAt'

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
    if (checkEstado) {
        setFilter()
    } else {
        k_sortBy.value = 'createdAt';
        k_checkDsc.checked = true;
        k_filterBy.value = '0';
    }

    workFilter.filterStatus = 'change';
    showAlertFilter();
    paintFilter()
    loadFilter();
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


function fechaFormated(fecha){
    let f = new Date(fecha);
    const a = f.getFullYear();
    const m = ("0" + (f.getMonth() + 1)).slice(-2);
    const d = ("0" + (f.getDate())).slice(-2);
    const h = ("0" + (f.getHours())).slice(-2);
    const mins = ("0" + (f.getMinutes())).slice(-2);
    return `${d}-${m}-${a} ${h}:${mins}`;
}
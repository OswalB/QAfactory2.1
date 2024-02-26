let currentCollection;

document.getElementById('misPedidosBody').addEventListener('click', async e => {
    toastr.warning('Cargando...', 'Espere');
    const idPedido = e.target.getAttribute('_idpedido');
    //const pedidoSeleccionado = misPedidos.find(pedido => pedido._id === idPedido);
    workFilter.funcion = 'c';
    workFilter._id = idPedido;
    workFilter.fx = 'c'
    const res = await fetch("/domain/pedidos", {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(workFilter)
    });
    toastr.remove();
    workFilter._id = '';
    const data = await res.json();
    const order = data[1];
    console.log(order);
    const oc = order.id_compras ? `O.C.# ${order.id_compras}` : '';
    const avr = Math.trunc((100 * order.TotalDisp) / order.totalReq);
    const delivery = new Date(order.delivery);
    const created = new Date(order.createdAt);
    const pill = order.state == 1 ? `<span class="position-absolute top-0 start-200 translate-middle badge
        rounded-pill bg-success">Finalizado!</span>`: '';
    document.getElementById('pedidoLabel').innerHTML = order.client;
    document.getElementById('cardHeader').innerHTML = `
        <h5 class="card-header">Entregar: ${delivery.toLocaleDateString()}-${delivery.toLocaleTimeString()} ${order.notes} ${oc}
            <div class="progress">
            <div class="progress-bar bg-info" role="progressbar" style="width: ${avr}%;" aria-valuenow="${avr}" aria-valuemin="0" aria-valuemax="100">${avr}%</div>
            </div>
        </h5>
    
    `;
    document.getElementById('cardBody').innerHTML = `
        <h5 class="card-title">Usuario: ${order.sellerName}, enviado: ${created.toLocaleDateString()}-${created.toLocaleTimeString()} ${pill}</h5>
        <table class="table table-hover table-bordered">
            <thead>
                <tr>
                    <th scope="col" >Producto</th>
                    <th scope="col" >Pedido</th>
                    <th scope="col" >Despachado</th>
                </tr>
            </thead>
            <tbody id="body1"></tbody>
        </table>  
    `;
    const bodyContainer = document.getElementById('body1');
    order.orderItem.forEach(item =>{
        let status = '';
        if(item.qty == item.dispatch){status = "text-white bg-success";}
        if(item.qty > item.dispatch){status = "text-white bg-primary";}
        if(item.qty < item.dispatch){status = "text-white bg-warning";}
        if(item.dispatch === 0){status = "text-white bg-secondary";}
        const disp = item.dispatch?item.dispatch:0;
        const tr = document.createElement('tr');
        tr.innerHTML =`
                    <th class="${status}" scope="row">${item.product}</th>
                    <td class=" text-right ${status}">${item.qty}</td>
                    <td class=" text-right ${status}">${disp}</td>
                `;
        bodyContainer.appendChild(tr);
    });


    $('#pedidodrop').modal('show');
});


//=========================== FUNCTIONS =============================================

async function init() {
    document.getElementById('title-main').innerHTML = 'Pedidos';

    workFilter.modelo = 'Order';
    backFilter.filterBy = '0';
    backFilter.filterTxt = '';
    backFilter.limitar = 15;
    backFilter.max = '';
    backFilter.min = '';
    backFilter.datemax = '';
    backFilter.datemin = '';
    backFilter.otrosMatch = [];
    backFilter.proyectar = [];
    backFilter.saltar = 0;
    backFilter.sortBy = 'state';
    backFilter.sortOrder = 1;
    backFilter.valorBoolean = 'false';
    backFilter.group = 'itemspp';
    backFilter.datepp = formatDate(new Date());
    backFilter.keyGroup = 'createdAt'
    //backFilter.keyGroup = 'delivery';

    let response = await fetch("/domain/pedidos", {
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

async function renderTable() {

    //workFilter.funcion = 'content';
    toastr.info('Recibiendo...', 'Mis pedidos');
    workFilter.fx = 'c'
    const res = await fetch("/domain/pedidos", {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(workFilter)
    })
    const data = await res.json();

    sizeCollection = data[0].countTotal;
    data.shift();       //elimina el dato contador
    console.log(data);
    if (data.fail) {
        toastr.error('Reintente!', 'No se ha podido recibir.', 'Pedido');
        return false;
    }
    toastr.remove();
    misPedidos = data;
    const container = document.getElementById('misPedidosBody');
    container.innerHTML = '';
    misPedidos.forEach(pedido => {
        const estado = pedido.state === 0 ? 'table-danger' : ''
        const avr = Math.trunc((100 * pedido.TotalDisp) / pedido.totalReq);
        let entrega = new Date(pedido.delivery);
        entrega = `${entrega.getDate()}/${(entrega.getMonth() + 1)} ${entrega.getHours()}:${+entrega.getMinutes()}`;
        const tr = document.createElement('tr');
        tr.setAttribute("class", estado);
        tr.innerHTML = `
                   <td  _idpedido="${pedido._id}">${(entrega)}</td>
                   <td  _idpedido="${pedido._id}">${pedido.client}</td>
                   <td  _idpedido="${pedido._id}">${avr}%</td>
        `;
        container.appendChild(tr);
    });
    setPaso(0);

}

function setPaso(paso) {
    let state = ''
    if (paso < 1) {
        state = 'none';
    }
    document.getElementById('step01').style.display = state;
    document.getElementById('step02').style.display = state;
    document.getElementById('step03').style.display = state;
    document.getElementById('step04').style.display = state;
    document.getElementById('step05').style.display = state;
    document.getElementById('accordionItems').style.display = state;
    document.getElementById('btnVista').style.display = state;
    state = '';
}

async function afterLoad() {
    fadeInputs();
};














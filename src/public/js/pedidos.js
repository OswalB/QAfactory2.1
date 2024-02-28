let misClientes = null, listProducts = null, currentCollection, docPedido = {},order;

document.getElementById('btnFaltantes').addEventListener('click', async e=>{
    await backOrder(true);    //true: faltantes ; false: copia
});

document.getElementById('btnCopiar').addEventListener('click', async e=>{
    await backOrder(false);    //true: faltantes ; false: copia
});

document.getElementById('btnVista').addEventListener('click', async e => {
    renderModalVista();
    $('#vistadrop').modal('show');
    docPedido.id_compras = document.getElementById('compra').value;
    docPedido.notes = document.getElementById('notes').value;
    docPedido.orderItem = jsonPedido;

});

document.getElementById('btnNuevo').addEventListener('click', async e => {
    if (document.getElementById('nombre').value) {
        toastr.warning('El pedido actual no ha sido enviado', 'Atencion!')
        const resp = confirm('El pedido actual no ha sido enviado.\n¿Desea borrar el contenido e iniciar un pedido nuevo?');
        if (!resp) return;
    }
    clearInputs();
    docPedido = {};
    if (!misClientes) {
        await getMisClientes();
        await getProducts();
        await renderAccordion();

    }

    await renderClientes('');
    document.getElementById('inHoras').value = 2;
    const fecha = entrega(2);
    docPedido.delivery = fecha.fechaEntrega;
    document.getElementById('dateOrder').value = fecha.fechaDisplay;
    $('#clientesModal').modal('show');
});

document.getElementById('inSearch').addEventListener('input', async e => {
    text = document.getElementById('inSearch').value;
    text = text.toUpperCase();
    renderClientes(text);
});

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
    order = data[1];
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
    order.orderItem.forEach(item => {
        let status = '';
        if (item.qty == item.dispatch) { status = "text-white bg-success"; }
        if (item.qty > item.dispatch) { status = "text-white bg-primary"; }
        if (item.qty < item.dispatch) { status = "text-white bg-warning"; }
        if (item.dispatch === 0) { status = "text-white bg-secondary"; }
        const disp = item.dispatch ? item.dispatch : 0;
        const tr = document.createElement('tr');
        tr.innerHTML = `
                    <th class="${status}" scope="row">${item.product}</th>
                    <td class=" text-right ${status}">${item.qty}</td>
                    <td class=" text-right ${status}">${disp}</td>
                `;
        bodyContainer.appendChild(tr);
    });


    $('#pedidodrop').modal('show');
    if (!misClientes) {
        await getMisClientes();
        await getProducts();
        await renderAccordion();

    }
});

document.getElementById('listClientes').addEventListener('click', async e => {
    let nit = e.target.getAttribute('_nit');
    let nombre = e.target.innerText;
    setPaso(1);
    docPedido.client = nombre;
    docPedido.nit = nit;
    document.getElementById('nombre').value = nombre;
    $('#clientesModal').modal('hide');
});

document.getElementById('btnMas').addEventListener('click', async e => {
    const valor = parseInt(document.getElementById('inHoras').value) + 1;
    document.getElementById('inHoras').value = valor;
    actualizarFechaEntrega(valor);
});

document.getElementById('btnMenos').addEventListener('click', async e => {
    const valor = Math.max(parseInt(document.getElementById('inHoras').value) - 1, 0);
    document.getElementById('inHoras').value = valor;
    actualizarFechaEntrega(valor);
});

document.getElementById('inHoras').addEventListener('input', async e => {
    let plazo = 0;
    if (document.getElementById('inHoras').value) {
        plazo = parseInt(document.getElementById('inHoras').value);
    }
    if (plazo < 1) {
        plazo = 0;
        document.getElementById('inHoras').value = plazo;
    }
    actualizarFechaEntrega(plazo);
});

document.getElementById('btnSend').addEventListener('click', async e => {
    toastr.info('Enviando...', 'Pedido');
    const pedido = {};
    pedido.modelo = 'Order';
    pedido.documentos = [docPedido];
    const res = await fetch('/core/save', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "PUT",
        body: JSON.stringify(pedido)
    });
    const data = await res.json();
    if (data.fail) {
        toastr.error('Reintente!', 'No se ha podido enviar.', 'Pedido');
        return false;
    }
    toastr.remove();
    toastr.success(data.msg, 'Pedido');

    clearInputs();

    setPaso(0);
    $('#vistadrop').modal('hide');
    await renderTable();
})

//=========================== FUNCTIONS =============================================
function renderModalVista() {
    let client = document.getElementById('nombre').value;
    let delivery = document.getElementById('dateOrder').value;
    document.getElementById('vistaLabel').innerHTML = `Cliente: ${client} entregar el ${delivery}`;
    let precioF, totalProducts = 0, precioTotal = 0;
    const vistaContainer = document.getElementById('vistaPrevia');
    vistaContainer.innerHTML = '';
    jsonPedido = [];
    listProducts.forEach(product => {
        const itemProduct = document.getElementById(product.codigo);

        if (itemProduct.value > 0) {
            jsonPedido.push({ 'code': product.codigo, 'product': product.corto, 'qty': itemProduct.value, 'dispatch': 0 })
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <th scope="row">*</th>
                <td>${product.nombre}</td>
                <td>${itemProduct.value}</td>
            `;
            vistaContainer.appendChild(tr);
            totalProducts += parseInt(itemProduct.value);
            precioTotal += parseInt(itemProduct.value) * product.precio;
            precioF = new Intl.NumberFormat().format(precioTotal)
        }
    })
    const tr = document.createElement('tr');
    tr.innerHTML = `
        
        <th scope="row"></th>
        <th scope="col">TOTAL</td>
        <th scope="col">${totalProducts}</td>
    `;
    vistaContainer.appendChild(tr);
    const tr2 = document.createElement('tr');
    tr2.innerHTML = `

        <th scope="row"></th>
        <th scope="col"></td>
        <th scope="col">${precioF}</td>
    `;
    vistaContainer.appendChild(tr2);
    docPedido.totalReq = totalProducts;
    if (totalProducts < 1) {
        document.getElementById('btnSend').setAttribute('disabled', 'true');
    } else {
        document.getElementById('btnSend').removeAttribute('disabled');
    }


}

async function backOrder(faltantes){
    
    if(document.getElementById('nombre').value) {
        toastr.warning('El pedido actual no ha sido enviado','Atencion!')
        const resp = confirm('El pedido actual no ha sido enviado.\n¿Desea borrar el contenido e iniciar un pedido nuevo?');
        if(!resp) return;
    }
    
    clearInputs();
    setPaso(1);
    $('#pedidodrop').modal('hide');
    document.getElementById('nombre').value = order.client;
    document.getElementById('compra').value = order.id_compras;
    document.getElementById('inHoras').value = 2;
    const fecha = entrega(2);
    docPedido.delivery = fecha.fechaEntrega;
    document.getElementById('dateOrder').value = fecha.fechaDisplay;
    document.getElementById('notes').value = order.notes;
    docPedido.client = order.client;
    docPedido.nit = order.nit;
    order.orderItem.forEach(item => {
        if(faltantes){
            let pendiente = item.qty - item.dispatch;
            if(pendiente > 0) {
                document.getElementById(item.code).value = pendiente;
            }
        }else{
            document.getElementById(item.code).value = item.qty;
        }    
        
        
    })
}

async function renderAccordion() {
    const productsContainer = document.getElementById('accordionItems');
    productsContainer.innerHTML = '';
    var i = 0;
    const categoriasProcesadas = new Set();
    listProducts.forEach(itemGroup => {
        if (!categoriasProcesadas.has(itemGroup.categoria)) {
            categoriasProcesadas.add(itemGroup.categoria);
            const div = document.createElement('div');
            div.className = 'accordion-item';
            div.innerHTML = `
            
                <h2 class="accordion-header mb-0" id="heading${i}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}">
                        ${itemGroup.categoria}
                    </button>
                </h2>
                <div id="collapse${i}" class="accordion-collapse collapse" aria-labelledby="heading${i}" data-bs-parent="#accordionItems">
                    <div class="accordion-body">           
                        <table class="table  table-hover">
                        <tbody id="item${i}">
                        </tbody>
                        </table>            
                    </div>
                </div>
            
            `;
            productsContainer.appendChild(div);

            const itemsContainer = document.getElementById('item' + i);
            itemsContainer.innerHTML = '';
            listProducts.forEach(product => {
                if (product.categoria === itemGroup.categoria) {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                    <td><label for="${product.codigo}">
                        ${product.nombre}
                    </label></td>
                    <td><input id="${product.codigo}" _idProduct="${product.codigo}" type="number"  min="0"  style="width:80px" class="text-end inpedido"></td>
                `;
                    itemsContainer.appendChild(tr);
                }
            })

            i += 1;
        }
    });
}

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
    setPaso(0);
    fadeInputs();

};

function clearInputs() {
    let inputs = document.querySelectorAll('.inpedido');
    inputs.forEach(input => {
        input.value = '';
    });
}

async function renderClientes(filtro) {
    const container = document.getElementById('listClientes');
    container.innerHTML = '';
    misClientes.forEach(item => {
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

async function getProducts() {
    let response = await fetch("/domain/ventas/productos", {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({})
    })
    listProducts = await response.json();
    listProducts.shift();
    console.log(listProducts);
}

async function getMisClientes() {
    let response = await fetch("/domain/mis-clientes", {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({})
    })
    misClientes = await response.json();
    misClientes.shift();
    console.log(misClientes);
}

function entrega(plazo) {
    const nohabil = (horasNoHabiles, hora) => {
        if (!horasNoHabiles || !Array.isArray(horasNoHabiles) || horasNoHabiles.length === 0) {
            return false;
        }
        return !horasNoHabiles.includes(hora);
    };

    let sethabiles = [
        [25],
        [8, 9, 10, 11, 12, 14, 15, 16],
        [8, 9, 10, 11, 12, 14, 15, 16],
        [8, 9, 10, 11, 12, 14, 15, 16],
        [8, 9, 10, 11, 12, 14, 15, 16],
        [8, 9, 10, 11, 12, 14, 15, 16],
        [8, 9, 10, 11, 12],
    ]
    let f, h, d;
    f = new Date();
    for (let p = 1; p < parseInt(plazo) + 1; p++) {
        f.setHours(f.getHours() + 1);
        h = f.getHours();
        d = f.getDay();
        while (nohabil(sethabiles[d], h)) {
            f.setHours(f.getHours() + 1);
            h = f.getHours();
            d = f.getDay();
        }
    }

    const fechaEntrega = f;
    const fechaDisplay = f.toLocaleDateString('es-us', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });

    return { fechaEntrega, fechaDisplay };

    //  return {"fechaEntrega":f, "fechaDisplay":f.toLocaleDateString('es-us',{weekday: 'short',day:'2-digit',month:'short',hour:'2-digit', minute:'2-digit'})};
}

function actualizarFechaEntrega(valor) {
    document.getElementById('alertPlazo').style.display = valor < 2 ? '' : 'none';
    const fechaEntrega = entrega(valor);
    document.getElementById('dateOrder').value = fechaEntrega.fechaDisplay;
    docPedido.delivery = fechaEntrega.fechaEntrega;
}


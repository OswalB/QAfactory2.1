let currentCollection;

document.getElementById('misPedidosBody').addEventListener('click', async e=>{
    toastr.warning('Cargando...','Espere');
    const idPedido = e.target.getAttribute('_idpedido');
    //const pedidoSeleccionado = misPedidos.find(pedido => pedido._id === idPedido);
    workFilter.funcion = 'c';
    workFilter._id = idPedido;
    toastr.info('Recibiendo...','UNO pedidos');
    workFilter.fx = 'c'
    const res = await fetch("/domain/pedidos",{
            headers: {
                'Content-Type': 'application/json'
              },
              method: "POST",
              body: JSON.stringify(workFilter)
    })
    workFilter._id = '';
    const data = await res.json();
    console.log(data[1]);

});


//=========================== FUNCTIONS =============================================

async function init(){
    document.getElementById('title-main').innerHTML='Pedidos';

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
    backFilter.group='itemspp';
    backFilter.datepp = formatDate(new Date());
    backFilter.keyGroup = 'createdAt'
    //backFilter.keyGroup = 'delivery';

    let response = await fetch("/domain/pedidos",{
        headers: {'content-type': 'application/json'},
        method: 'POST',
        body: JSON.stringify({fx:'k'})
    })
    let data = await response.json();
    if(data.message){
        toastr.error(data.message);
        return;
    }
    currentKeys = data;

};

async function renderTable(){

    //workFilter.funcion = 'content';
    toastr.info('Recibiendo...','Mis pedidos');
    workFilter.fx = 'c'
    const res = await fetch("/domain/pedidos",{
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
    if(data.fail) {
        toastr.error('Reintente!','No se ha podido recibir.','Pedido');
            return false;
    }
    toastr.remove();
    misPedidos = data;
    const container = document.getElementById('misPedidosBody');
    container.innerHTML ='';
    misPedidos.forEach(pedido =>{
        const estado = pedido.state === 0?'table-danger':''
        const avr = Math.trunc( (100 * pedido.TotalDisp) / pedido.totalReq);
        let entrega = new Date(pedido.delivery);
        entrega=`${entrega.getDate()}/${(entrega.getMonth()+1)} ${entrega.getHours()}:${+entrega.getMinutes()}`;
        const tr = document.createElement('tr');
        tr.setAttribute("class", estado);
        tr.innerHTML= `
                   <td  _idpedido="${pedido._id}">${(entrega)}</td>
                   <td  _idpedido="${pedido._id}">${pedido.client}</td>
                   <td  _idpedido="${pedido._id}">${avr}%</td>
        `;
        container.appendChild(tr);
    });    
    setPaso(0);

}   

function setPaso(paso){
    let state = ''
    if(paso < 1){
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

async function afterLoad(){
    fadeInputs();
};



//*-*-*-*-*-*-*-*-*-*-*      pendientes por revisar y aprobar   * * * * 










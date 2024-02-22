











//=========================== FUNCTIONS =============================================



//*-*-*-*-*-*-*-*-*-*-*      pendientes por revisar y aprobar   * * * * 


let currentCollection;


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
    backFilter.sortBy = '0';
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

async function afterLoad(){
    fadeInputs();
    
    
};


async function renderTable(){

    workFilter.funcion = 'content';
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
    console.log(data)
    if(data.fail) {
        toastr.error('Reintente!','No se ha podido recibir.','Pedido');
            return false;
    }
    toastr.remove();
    misPedidos = data;

    //***********pendientes por aprobacion */
    
  /*  


        const vistaContainer=document.getElementById('misPedidosBody');
        vistaContainer.innerHTML ='';
        misPedidos.forEach(pedido =>{
            let colort = '';
            const avr = Math.trunc( (100 * pedido.TotalDisp) / pedido.totalReq);
            let entrega = new Date(pedido.delivery);
            entrega=`${entrega.getDate()}/${(entrega.getMonth()+1)} ${entrega.getHours()}:${+entrega.getMinutes()}`;
            const tr = document.createElement('tr');
            if(pedido.state == '0'){
                tr.setAttribute("class",  "bg-success text-light");
                colort = 'text-light'
            }    
                tr.innerHTML= `
                   <td class="${colort}" _idpedido="${pedido._id}">${(entrega)}</td>
                   <td class="${colort}" _idpedido="${pedido._id}">${pedido.client}</td>
                   <td class="${colort}" _idpedido="${pedido._id}">${avr}%</td>
                `;
                vistaContainer.appendChild(tr);
        })
*/}   
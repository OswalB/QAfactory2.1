let localOrders;

document.getElementById('check_estado').addEventListener('click',async e =>{
    updateCheckFacturados();
})

//* * * * * * * * * *    FUNCIONES   * * * * * * * * * * * * * * * * * * * * * * * *
async function renderTable(){
    //updateCheckFacturados();
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
    backFilter.sortOrder = 1;
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
    if(checkEstado){
        /*k_sortBy.value='delivery';
        k_checkAsc.checked=true;
        k_filterBy.value = 'state';
        k_max.value = '0';
        k_min.value = '0';*/
        setFilter()
    }else{
        k_sortBy.value='createdAt';
        k_checkDsc.checked=true;
        k_filterBy.value = '0';
    }

    workFilter.filterStatus = 'change';
    showAlertFilter();
    paintFilter()
    loadFilter();
    const lblTexto = checkEstado?'No Facturados':'Todos';
    document.getElementById('lbl_estado').innerHTML= lblTexto;
}
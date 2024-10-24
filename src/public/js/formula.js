let localFormulas, currentCollection ={}, currentContent, currentDocumentId;


//* * * * * * * * * *    FUNCIONES  inicio * * * * *
async function init() {
    document.getElementById('title-main').innerHTML = 'Formulas';

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
    backFilter.sortBy = 'codigoProd';
    backFilter.sortOrder = 1;
    backFilter.valorBoolean = 'false';
    backFilter.group = 'itemspp';
    backFilter.datepp = formatDate(new Date());
    backFilter.keyGroup = 'createdAt';

    let response = await fetch("/domain/formulas/keys", {
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
    //startPolling();
    //document.getElementById('btnChose').style.display = 'none';
}

async function afterLoad() {
    renderTable();
};

//* * * * * * * * * *    FUNCIONES  Render * * * * *

async function renderTable() {

    const res = await fetch("/domain/formulas/content", {
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
    localFormulas = data;
    const container = document.getElementById('accordionMain');
    container.innerHTML = '';
    let i = 0;
    localFormulas.forEach(itemAcc => {
        let element = rendItemsAccordion(itemAcc, i)
        i++;
        container.appendChild(element);
        let containerDetalle = document.getElementById(`bodyAccordion${itemAcc._id}`);
        containerDetalle.innerHTML = '';
        let subElement = renderHeadTable(itemAcc._id);
        containerDetalle.appendChild(subElement);
        containerDetalle = document.getElementById(`bt${itemAcc._id}`);
        itemAcc.detalle.forEach(itemDetalle => {
            subElement = renderBodyTable(itemDetalle, itemAcc._id);
            containerDetalle.appendChild(subElement);
        });
        subElement = renderFooterTable(itemAcc._id, itemAcc.siFormulaOk);
        containerDetalle.appendChild(subElement);
    });
};

function rendItemsAccordion(itemAcc, i){
    let icon = '<a class="btn btn-warning" href="#"  _role="toedit" _id="${itemAcc._id}"><i class="fa fa-exclamation-triangle fa-lg" ></i></a>';
    let ok = "Incompleta!!";
    if(itemAcc.siFormulaOk){
        ok = "O.K.";
        icon = '<a class="btn btn-success " href="#"  _role="toedit" _id="${itemAcc._id}"><i class="fa fa-check-circle fa-lg"></i></a>';
    } 
    let txtHead =`${itemAcc.codigoProd} - ${itemAcc.nombre}, cat: ${itemAcc.categoria}, estado: ${ok}`;
    const div = document.createElement('div');
    div.setAttribute('class', 'accordion-item');
    
    div.innerHTML= `
        <h2 class="accordion-header" id="heading${itemAcc._id}" _id="${itemAcc._id}">
            <button id="btnAcc${itemAcc._id}" class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${i}" aria-expanded="false" aria-controls="collapse${i}" _role="toedit" _id="${itemAcc._id}">
               ${icon}<div class="px-3"  _role="toedit" _id="${itemAcc._id}">${txtHead}</div>
            </button>
        </h2>
        <div id="collapse${i}" class="accordion-collapse collapse" aria-labelledby="heading${i}" data-bs-parent="#accordionMain">
            <div id="bodyAccordion${itemAcc._id}" class="accordion-body">
            </div>
        </div>
    `;
    return div;
}

function renderHeadTable(_id){
    const table = document.createElement('table');
    table.setAttribute('class', 'table table-hover' );
    table.setAttribute('id', `head${_id}`);
    table.innerHTML=`
    <thead>
        <tr class="table-primary">
            <th scope="col">Insumo</th>
            <th scope="col">Cantidad</th>
            <th scope="col">Base</th>
            <th scope="col">Acc.</th>
        </tr>
    </thead>   
    <tbody id ="bt${_id}"></tbody> 
    `;
    return table;
}

function renderBodyTable(itemDetalle, _idDoc){
        
    let chk = ' ';
    if(itemDetalle.siBase) chk = 'checked';
    const table = document.createElement('tr');
    table.innerHTML=`
    
        <td>${itemDetalle.codigoInsumo}-${itemDetalle.nombreInsumo}</td>
        <td>${itemDetalle.cantidad} ${itemDetalle.unidad}</td>
        <td><input _role="check" class="form-check-input" type="checkbox" value="" ${chk}  disabled ></td> 
        <td><a  id="del${itemDetalle._id}"  _id = "${_idDoc}" _iditem="${itemDetalle._id}" class="btn btn-default btn-sm" href="#" _role="delete" >
                <i class="fa fa-trash fa-lg" aria-hidden="true" _role="delete" _id = "${_idDoc}" _iditem="${itemDetalle._id}"></i></a></td>         
        
    `;
    return table;
}

function renderFooterTable(_id, formulaOk){
    let chk = 'checked';
    if(formulaOk) chk = '';
    const table = document.createElement('tr');
    table.innerHTML=`
        <td><input id="inin${_id}" _id="${_id}" type="text" class="form-control" placeholder="Ad. insumo" _role="openList"></td>
        <td><input id="incant${_id}"_id="${_id}" type="text" class="form-control" placeholder="Ad. cantidad" _role="cantidad" ></td>
        
        <td _role="check" _id="${_id}"><input _role="check" id="chk${_id}" _id="${_id}" class="form-check-input" type="checkbox" value="" ${chk}  disabled ></td> 
        <td><a  id="snd${_id}"_id="${_id}" class="btn btn-default btn-sm" href="#" _role="sending" >
                <i class="fa fa-plus-square fa-lg" aria-hidden="true" _role="sending" _id="${_id}"></i> Add</a></td>           
       
    `;
    return table;
}

//* * * * * * * * * *    FUNCIONES  CRUD * * * * *

document.getElementById('btnNuevo').addEventListener('click',async e =>{
    //newEdit({'opNuevo': true}); 
    role='edit';
    currentContent = localFormulas;
    renderModalEditor(currentKeys);
});


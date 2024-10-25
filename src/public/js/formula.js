let localFormulas, selected ={}, currentDocumentId, localRole, currentCollection, insumosList;


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
    //let chk = 'checked';
    //if(formulaOk) chk = '';
    const habilitado = formulaOk?'disabled':'';
    const table = document.createElement('tr');
    table.innerHTML=`
        <td><input id="inin${_id}" _id="${_id}" type="text" class="form-control" placeholder="Ad. insumo" _role="openList"></td>
        <td><input id="incant${_id}"_id="${_id}" type="text" class="form-control" placeholder="Ad. cantidad" _role="cantidad" ></td>
        
        <td _role="check" _id="${_id}"><input _role="check" id="chk${_id}" _id="${_id}" class="form-check-input" type="checkbox" value="" ${habilitado}   ></td> 
        <td><a  id="snd${_id}"_id="${_id}" class="btn btn-default btn-sm" href="#" _role="sending" >
                <i class="fa fa-plus-square fa-lg" aria-hidden="true" _role="sending" _id="${_id}"></i> Add</a></td>           
       
    `;
    return table;
}

async function renderList(){
    if(!insumosList){
        insumosList = await fetch("/core/insumos",{
            headers: {'content-type': 'application/json'},
            method: 'GET',
            body: JSON.stringify()
        })
        insumosList = await insumosList.json();
        insumosList.sort((a, b) => a.codigo - b.codigo);
    }
    const container = document.getElementById('bodyTableList');
    container.innerHTML = '';
    insumosList.forEach(item =>{
        const tr = document.createElement('tr');
        tr.innerHTML= `
        <th scope="col" _codigo="${item.codigo}" _nombre="${item.nombre}" _unidad="${item.unidad}">${item.codigo} - ${item.nombre}</th>                
        `;
        container.appendChild(tr);
    })

    $('#insumosModal').modal('show');
}

function repaintAccordion(itemAcc){
    let icon = '<a class="btn btn-warning" href="#" ><i class="fa fa-exclamation-triangle fa-lg" ></i></a>';
    let ok = "Incompleta!!";
    if(itemAcc.siFormulaOk){
        ok = "O.K.";
        icon = '<a class="btn btn-success " href="#" ><i class="fa fa-check-circle fa-lg"></i></a>';
    } 
    let txtHead =`${itemAcc.codigoProd} - ${itemAcc.nombre}, cat: ${itemAcc.categoria}, estado: ${ok}`;
    let element = document.getElementById(`btnAcc${itemAcc._id}`);
    
    element.innerHTML = '';
    element.innerHTML= `${icon}<div class="px-3">${txtHead}</div>`;
    let containerDetalle = document.getElementById(`bt${itemAcc._id}`);
    containerDetalle.innerHTML = '';
        itemAcc.detalle.forEach(itemDetalle =>{
            let subElement = this.renderBodyTable(itemDetalle, itemAcc._id);
            containerDetalle.appendChild(subElement);    
        });
    let subElement = this.renderFooterTable(itemAcc._id, itemAcc.siFormulaOk);
    containerDetalle.appendChild(subElement);

}

//* * * * * * * * * *    FUNCIONES  CRUD * * * * *

document.getElementById('btnNuevo').addEventListener('click',async e =>{
    //newEdit({'opNuevo': true}); 
    localRole='nuevo';
    //currentDocumentId ='';
    currentContent = localFormulas;
    renderModalEditor(currentKeys, 'nuevo', 'Crear nueva formula');
});

document.getElementById('btnEditar').addEventListener('click',async e =>{
    if(!selected._id){
        toastr.error('Seleccione el titulo de la formula, luego <Editar>')
        return;
    }
    localRole='edit';
    const docEdit = localFormulas.find(doc => doc._id === selected._id);
    renderModalEditor(currentKeys, 'edit', `Editar formula: ${docEdit.nombre}`, docEdit  );

    
})

document.getElementById("btn_guardar").addEventListener('click', async e => {

    const submit = document.getElementsByClassName("form-snd");
    const objeto = {};
    if(localRole == 'edit')objeto._id = selected._id;
    for (const element of submit) {
        if (element.type === 'text' || element.type === 'number') {
            objeto[element.id] = element.value;
        } else if (element.type === 'checkbox') {
            objeto[element.id] = element.checked;
        }
    }
    if (!applyValidation()) {
        alert('El formulario tiene campos no válidos, por favor revise la información e intente nuevamente.');
        return;
    }
    let msg = '¿CREAR este NUEVO documento?'
    if (localRole == 'edit') msg = 'Guardar CAMBIOS?'
    const result = window.confirm(msg);
    if (!result) {
        return;
    }

    const res = await fetch('/core/save', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "PUT",
        body: JSON.stringify({ 'documentos': [objeto], 'modelo': 'Formula' })
    });

    const data = await res.json();
    if (data.fail) {
        toastr.error(data.message);
        return;
    }

    toastr.info(data.message);
    $('#modalEditor').modal('hide');
    renderTable();
});

document.getElementById('bodyTableList').addEventListener('click',async e =>{
    selected.nombre = e.target.getAttribute('_nombre');
    selected.codigo = e.target.getAttribute('_codigo');
    selected.unidad = e.target.getAttribute('_unidad');
    document.getElementById(`inin${selected._id}`).value = `${selected.codigo} - ${selected.nombre}`;
    $('#insumosModal').modal('hide');
    document.getElementById(`incant${selected._id}`).focus();
})

document.getElementById('accordionMain').addEventListener('click',async e =>{
    selected._id = e.target.getAttribute('_id');
    const role = e.target.getAttribute('_role');
    console.log(role)
    if(role){
        if(role == 'openList'){
            renderList();
        };
        if(role == 'sending'){
            
            let msg = '';
            let cnt = document.getElementById(`incant${selected._id}`).value;
            if(isNaN(cnt)){
                document.getElementById(`incant${selected._id}`).value = eval(cnt);
                return
            }
            if(selected.nombre == '' || selected.codigo == '') msg = 'Insumo no es valido';
            if(cnt == '') msg += 'Falta ingresar la cantidad ';
            if(msg){
                alert(msg);
                return;
            }
              
            selected.siBase = false;
            isChecked = document.getElementById(`chk${selected._id}`).checked;
            if(isChecked){
                selected.siBase = true;
            }
            
            selected.cantidad = cnt;
            
            let response = await fetch("/domain/formula/item",{
                headers: {'content-type': 'application/json'},
                method: 'PUT',
                body: JSON.stringify(selected)
            })
             
            const data = await response.json();
            
            repaintAccordion(data);

            document.getElementById(`incant${selected._id}`).focus();
        }
    }
    if(role == 'delete'){
        const opt = confirm('Eliminar!, esta seguro?');
        if(!opt) return;
        let del = {};
        del._id = e.target.getAttribute('_id');
        del.idItem = e.target.getAttribute('_iditem');
        toastr.success('Eliminando...');
        response = await fetch("/domain/formula/item",{
            headers: {'content-type': 'application/json'},
            method: 'DELETE',
            body: JSON.stringify(del)
        })
        const data = await response.json();
        repaintAccordion(data);
    }
})

document.getElementById("btn_borrar").addEventListener('click', async e => {
   
    const result = window.confirm('Seguro que desea BORRAR el documento?');

    if (!result) {
        return;
    }

    try {
        const objeto = {
            _id: selected._id,
            modelo: 'Formula'
        };

        const res = await fetch('/core/document', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: "DELETE",
            body: JSON.stringify(objeto)
        });

        const data = await res.json();

        if (data.fail) {
            return;
        }
        toastr.info(data.message);
        $('#modalEditor').modal('hide');
        renderTable();
    } catch (error) {
        // Manejar el error de manera adecuada
    }
});
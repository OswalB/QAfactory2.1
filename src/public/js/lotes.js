let insumosList, lotesList

//* * * * * * * * * *    FUNCIONES  inicio * * * * *
async function init() {
    document.getElementById('title-main').innerHTML = 'Admin Lotes';

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
    backFilter.sortBy = 'createdAt';
    backFilter.sortOrder = -1;
    backFilter.valorBoolean = 'false';
    backFilter.group = 'itemspp';
    backFilter.datepp = formatDate(new Date());
    backFilter.keyGroup = 'createdAt';

    let response = await fetch("/core/insumos");
    insumosList = await response.json();
    renderInsumos();
    /*response = await fetch("/core/keys", {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ modelo: 'Planilla' })
    })
    let data = await response.json();
    if (data.message) {
        toastr.error(data.message);
        return;
    }*/
    currentKeys = [];
    currentKeys.push({
        alias: 'F. creación', campo: 'createdAt', default: '', type: 'date'
    })

    const data2 = await fetch('/core/procesos');
    procesos = await data2.json();
    //startPolling();
    //document.getElementById('btnChose').style.display = 'none';
}

async function renderTable() {
    
    let res = await fetch('/core/lotes/manager', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify(workFilter)
    });
    const data = await res.json();

    sizeCollection = data[0].countTotal;
    data.shift();
    await footer();
    console.log(data);
    lotesList = data;
    renderLotesManager(data);
}

async function afterLoad() {

}


document.getElementById("selectList").addEventListener("change", async function () {
    const input = document.getElementById("searchInput");
    const codigoSelected = this.value;
    const selectedOption = insumosList.find(option => option.codigo.toString() === codigoSelected);
    input.value = selectedOption ? selectedOption.nombre : "";
    this.style.display = "none";
    workFilter.codigo = codigoSelected;
    renderTable();

})

//* * * * * * * * * *    FUNCIONES  render * * * * *

function renderLotesManager(lotesDiponibles) {

    const container = document.getElementById('lotesAvListManager');
    if (lotesDiponibles.length < 1) {
        //document.getElementById('btnExitLManager').disabled=false;
        container.innerHTML = `<strong class="text-danger">No hay lotes disponibles!</strong>`;
        return;
    }
    container.innerHTML = '';

    lotesDiponibles.forEach((item, index) => {
        let fecha = new Date(item.fechaw);
        let fechaTxt = `${fecha.toLocaleDateString('es-us', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`;
        const li = document.createElement('li');
        li.setAttribute("class", "list-group-item");
        li.setAttribute("_lote", item.lote);
        li.innerHTML = `
        <div class="form-check form-switch">
            <input disabled _index="${index}" class="form-check-input checkArchivarM" type="checkbox" role="switch" id="sw${item._id}" _id=${item._id}>
            <label  class="form-check-label" for="sw${item._id}" id="lsw${item._id}" _id=${item._id}></label>
        </div>
            <strong _lote=${item.lote}>${item.lote}</strong>  (${fechaTxt}) ${item.tercero} - ${item.cantidad}             
        `;
        container.appendChild(li);
        actualiceSw(item._id, item.agotado);
    })
}

function actualiceSw(_id,isAgotado){
    
    const label = document.getElementById(`lsw${_id}`);
    label.innerHTML = isAgotado?'Agotado':'Disponible';
    const switche = document.getElementById(`sw${_id}`);
    switche.checked = isAgotado?false:true

}

function renderInsumos(filterValue = '') {
    const container = document.getElementById('selectList');
    container.innerHTML = '';
    let some = false;
    insumosList.forEach((item, index) => {
        const caption = `${item.codigo} - ${item.nombre}`;
        if (caption.toLowerCase().includes(filterValue)) {
            const option = document.createElement('option');
            option.setAttribute("value", item.codigo);
            option.textContent = caption;
            container.appendChild(option);
            some = true;
        }
    });
    if (!some) {
        const option = document.createElement('option');
        option.textContent = 'Ninguna combinacion encontrada!!'
        container.appendChild(option);
    }
}

document.getElementById("searchInput").addEventListener("input", function () {
    filterOptions();
    renderLotesManager([])
});

document.getElementById("btnEditar").addEventListener("click", function () {
    const listItems = document.querySelectorAll('.checkArchivarM');
    console.log(listItems.length);
    listItems.forEach(input => {
        input.disabled = !input.disabled;
    })
});

function filterOptions() {
    const input = document.getElementById("searchInput");
    const select = document.getElementById("selectList");
    select.style.display = "";
    const filterValue = input.value.toLowerCase();
    renderInsumos(filterValue);
}

//* * * * * * * * * *    FUNCIONES  Update * * * * *

document.getElementById('lotesAvListManager').addEventListener('click', async e => {
    const index = e.target.getAttribute('_index');
    if(!index) return;
    
    const oneLote = lotesList[index];
    const estado = !oneLote.agotado;
    console.log(index, oneLote);
    await updateDocument(oneLote.org, oneLote._id, { agotado: estado });
    lotesList[index].agotado = estado;
})    

async function updateDocument(modelo, _id, params, docResponse = false) {
    dataSend = { modelo, _id, params, docResponse };
    console.log(dataSend);
    let response = await fetch("/core/update", {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(dataSend)
    })

    const data = await response.json();
    console.log(data)
}


let localTable



//* * * * * * * * * *    FUNCIONES  inicio * * * * *
async function init() {
    document.getElementById('title-main').innerHTML = 'Costos';

    backFilter.filterBy = '0';
    backFilter.filterTxt = '';
    backFilter.limitar = 12;
    backFilter.max = '';
    backFilter.min = '';
    backFilter.datemax = '';
    backFilter.datemin = '';
    backFilter.otrosMatch = [];
    backFilter.proyectar = [{
        _id: 0, fecha1: 1, producto: 1, codigoProducto: 1,
        formulaOk: 1, embodegado: 1, loteOut: 1, operario: 1, cantProd: 1,
        'detalle.cantidad': 1, 'detalle.codigoInsumo': 1, 'detalle.nombreInsumo': 1,
        'detalle.unidad': 1
    }];
    backFilter.saltar = 0;
    backFilter.sortBy = 'fecha1';
    backFilter.sortOrder = -1;
    backFilter.valorBoolean = 'false';
    backFilter.group = 'mespp';
    backFilter.datepp = formatDate(new Date());
    backFilter.keyGroup = 'createdAt';

    let response = await fetch("/core/keys", {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ modelo: 'Planilla' })
    })
    let data = await response.json();
    if (data.message) {
        toastr.error(data.message);
        return;
    }
    currentKeys = data;
    currentKeys.push({
        alias: 'F. creación', campo: 'createdAt', default: '', type: 'date'
    })

    //const data2 = await fetch('/core/procesos');
    //procesos = await data2.json();
    //startPolling();
    //document.getElementById('btnChose').style.display = 'none';
}

async function afterLoad() {

}


async function renderTable() {

    const res = await fetch("/domain/planillas", {
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
    localTable = data;
    console.log(JSON.stringify(localTable[2], null, 2))
    //renderCards();
    const container = document.getElementById('bodyInfo');
    container.innerHTML = '';
    let counter = 0;
    localTable.forEach(item => {
        const fecha = new Date(item.fecha1);
        const fechaTxt = fecha.toLocaleDateString('es-us', { day: '2-digit', month: 'short', year: 'numeric' });
        item.detalle.forEach(det => {
            const tr = document.createElement('tr');
            if(!item.formulaOk || !item.embodegado){
                tr.setAttribute('class','table-danger')
            }
            tr.innerHTML = `
                <th scope="row">${counter}</th>
                <td>${fechaTxt}</td>
                <td>${item.codigoProducto}</td>
                <td>${item.producto}</td>
                <td>${item.loteOut}</td>
                <td>${item.formulaOk}</td>
                <td>${item.embodegado}</td>
                <td>${item.operario}</td>
                <td>${item.cantProd}</td>
                <td>${det.codigoInsumo} ${det.nombreInsumo} ${det.cantidad} ${det.unidad}</td>
            `;
            container.appendChild(tr);
            counter++;
        })
    })
}
let localTable = [];
const camposAcopio = [
    { colorCard: 'text-light bg-dark' },
    { clave: 'ninsumo', alias: 'Mat. prima' },
    { clave: 'fechaw', alias: 'Fecha' },
    { clave: 'lote', alias: 'Lote' },
    { clave: 'nombreProveedor', alias: 'Proveedor' },
    { clave: 'nit', alias: 'Nit.' },
    { clave: 'operario', alias: 'Operario' },
    { clave: 'acepta', alias: 'Acepta' },
    { clave: 'rechaza', alias: 'Rechaza' },
    { clave: 'enStock', alias: 'En bodega' },

]

const camposFabricacion = [
    { colorCard: 'text-light bg-secondary' },
    { clave: 'producto', alias: 'Producto' },
    { clave: 'fecha1', alias: 'Fecha' },
    { clave: 'loteOut', alias: 'Lote' },
    { clave: 'operario', alias: 'Operario' },
    { clave: 'codigoProducto', alias: 'Codigo' },
    { clave: 'cantProd', alias: 'Cantidad' },
    { clave: 'enStock', alias: 'En bodega' }
];
const camposDistribucion = [
    { colorCard: 'text-light bg-primary' },
    { clave: 'client', alias: 'Cliente' },
    { clave: 'fecha', alias: 'Fecha' },
    { clave: 'consecutivo', alias: 'Consecutivo' },
    { clave: 'nit', alias: 'Nit cliente' },
    { clave: 'lote', alias: 'Lote' },
    { clave: 'producto', alias: 'Producto' },
    { clave: 'cantidad', alias: 'Cantidad' },



]
async function init() {
    document.getElementById('title-main').innerHTML = 'Mana-Trazabilidad';
    paintx();
}

async function afterLoad() {
    document.getElementById('seccOrdenar').style.display = 'none';

}

document.getElementById('inLote').addEventListener('keypress', async e => {
    if (e.key == 'Enter') {
        buscar();
    }
})
document.getElementById('inLote').addEventListener('input', async e => {
    paintResult(false);
})

document.getElementById('btnTrazar').addEventListener('click', async e => {
    buscar();
})

function paintx() {
    const equis = '<i class="text-danger  fa fa-4x fa-times "></i>';
    document.getElementById('icon1').innerHTML = equis;
    document.getElementById('icon2').innerHTML = equis;
    document.getElementById('icon3').innerHTML = equis;
    //document.getElementById('cardContainer').innerHTML = '';
}

function paintResult(result = false) {
    const caption1 = result?`${localTable[1].length || 0} registros`: 'Consultando...';
    const caption2 = result?`${localTable[2].length || 0} registros`: 'Consultando...';
    const caption3 = result?`${localTable[3].length || 0} registros`: 'Consultando...';
    document.getElementById('registros1').innerHTML = caption1;
    document.getElementById('registros2').innerHTML = caption2;
    document.getElementById('registros3').innerHTML = caption3;
    if(!result) document.getElementById('cardContainer').innerHTML = '';
}
function renderTable() {
    document.getElementById('cardContainer').innerHTML = '';
    if (localTable.length < 1) return;
    paintResult(true);

    diagrama(localTable[0].etapa);

    localTable[1].forEach((data, index) => {
        const primera = index == 0;
        const group = primera ? 'group1' : '';
        renderCard('cardContainer', data, camposAcopio, primera, group);
    });
    
    localTable[2].forEach((data, index) => {
        const primera = index == 0;
        const group = primera ? 'group2' : '';
        renderCard('cardContainer', data, camposFabricacion, false, group);
    })

    localTable[3].forEach((data, index) => {
        const primera = index == 0;
        const group = primera ? 'group3' : '';
        renderCard('cardContainer', data, camposDistribucion, false, group);
    })


}

function diagrama(etapa) {
    const lo = document.getElementById('inLote').value;
    const flechaR = '<i class="text-success fa fa-4x fa-arrow-right"></i>';
    const flechaL = '<i class="text-success fa fa-4x fa-arrow-left "></i>';

    document.getElementById('lbletapa1').innerHTML = '';
    document.getElementById('lbletapa2').innerHTML = '';
    document.getElementById('lbletapa3').innerHTML = '';
    if (etapa == 1) {
        document.getElementById('lbletapa1').innerHTML = `Lote :  ${lo}`;
        document.getElementById('icon1').innerHTML = flechaR;
        document.getElementById('icon2').innerHTML = flechaR;
        document.getElementById('icon3').innerHTML = flechaR;
        return;
    }

    if (etapa == 2) {
        document.getElementById('lbletapa2').innerHTML = `Lote :  ${lo}`;
        document.getElementById('icon1').innerHTML = flechaL;
        document.getElementById('icon2').innerHTML = flechaR;
        document.getElementById('icon3').innerHTML = flechaR;
        return;
    }
    if (etapa == 3) {
        document.getElementById('lbletapa3').innerHTML = `Lote :  ${lo}`;
        document.getElementById('icon1').innerHTML = flechaL;
        document.getElementById('icon2').innerHTML = flechaL;
        document.getElementById('icon3').innerHTML = flechaR;
        return;
    }

    paintx();

}

function renderCard(nodo, data, claves, primera, group) {
    const colorCard = claves[0].colorCard;
    let copy = [...claves];
    copy.shift();
    const newCollection = [];

    copy.forEach((item) => {
        const nuevoDocumento = {};
        const { clave, alias } = item;
        const valor = data[clave];
        nuevoDocumento.keyTable = alias;
        nuevoDocumento.valueTable = valor;
        nuevoDocumento.valueTable = darFormato(nuevoDocumento);
        newCollection.push(nuevoDocumento);
    });

    const headTitle = newCollection[0].valueTable;
    newCollection.shift();
    const headDate = newCollection[0].valueTable;
    newCollection.shift();

    const tbody = document.createElement('tbody');
    tbody.innerHTML = '';
    newCollection.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
        <th scope="row">${item.keyTable}</th>
        <td>${item.valueTable}</td>
        `;
        tbody.appendChild(tr);
    })
    container = document.getElementById(nodo);
    if (primera) container.innerHTML = '';
    const element = document.createElement('div');
    element.setAttribute('class', 'col-xl-4');
    element.setAttribute('id', group);
    element.innerHTML = `
    <div  class="card h-100 mb-4">
        <div class="card-header ${colorCard}">
           <h5 class="card-title d-flex justify-content-between">
                <span class="text-left">${headTitle}</span>
                <span class="text-right">${headDate}</span>
            </h5>
        </div>
        <div class="card-body d-flex flex-column">
            <table class="table table-striped">
            ${tbody.outerHTML}
            </table>
            <div class="mt-auto">
                <a class="btn btn-primary" _role="btnHome">Home </a>
            </div>
            
        </div>
    </div>
    `;
    container.appendChild(element);
}

async function buscar() {
    const lotew = document.getElementById('inLote').value || '0';

    localTable = await loadTraza(lotew);
    //localTable[0].matches = [1, 2, 3].map(index => (localTable[index]?.length) || 0).reduce((sum, len) => sum + len, 0);

    console.log(localTable);
    renderTable();
}

async function loadTraza(lotew) {
    let response = await fetch("/core/traza", {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ "lotew": lotew })
    })
    const data = await response.json();
    return data;
}

function darFormato(data) {
    if (data.keyTable == 'Fecha') {
        let fecha = new Date(data.valueTable);
        let fechaTxt = fecha.toLocaleDateString('es-us', { day: '2-digit', month: 'short', year: 'numeric' });
        return fechaTxt;
    }

    if (typeof data.valueTable == 'boolean') {
        return data.valueTable ? 'Si' : 'No'
    }

    if (data.valueTable === '' || data.valueTable === null || data.valueTable === undefined) {
        return 'N/A';
    }

    return data.valueTable;
}
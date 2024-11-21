let localTable, errors = [], flags = {}, toEmbodegar



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
        ccostos: 1, fecha1: 1, producto: 1, codigoProducto: 1,
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
    flags.editar = false;
    //const data2 = await fetch('/core/procesos');
    //procesos = await data2.json();
    //startPolling();
    document.getElementById('btnChose').style.display = 'none';
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

    //renderCards();
    const container = document.getElementById('bodyInfo');
    container.innerHTML = '';
    let counter = 1;
    errors = [];
    localTable.forEach((item, index) => {
        const fecha = new Date(item.fecha1);
        const fechaTxt = fecha.toLocaleDateString('es-us', { day: '2-digit', month: 'short', year: 'numeric' });
        const insw = `
            <div class="form-check form-switch">
                <input disabled _index="${index}" class="form-check-input checkArchivarM" type="checkbox" role="switch" id="sw${item._id}" _id=${item._id}>
                <label  class="form-check-label" for="sw${item._id}" id="lsw${item._id}" _id=${item._id}></label>
            </div>
        `;
        item.detalle.forEach((det, subindex) => {
            const primera = subindex === 0;
            const tr = document.createElement('tr');
            if (!item.formulaOk || !item.embodegado) {


                if (primera) {
                    tr.setAttribute('class', 'table-danger');
                    errors.push(`Linea ${counter}: ${item.formulaOk ? '' : 'Incompleta.'} ${item.embodegado ? '' : 'No embodegado.'}`);
                }

            }
            tr.innerHTML = `
                <th scope="row">${counter}</th>
                <td>${primera ? fechaTxt : ''}</td>
                <td>${primera ? item.codigoProducto : ''}</td>
                <td>${primera ? item.producto : ''}</td>
                <td>${primera ? item.loteOut : ''}</td>
                <td>${primera ? item.formulaOk : ''}</td>
                <td>${primera ? insw : ''}</td>
                <td>${primera ? item.operario : ''}</td>
                <td>${primera ? item.cantProd : ''}</td>
                <td>${det.codigoInsumo} ${det.nombreInsumo} ${det.cantidad} ${det.unidad}</td>
            `;
            container.appendChild(tr);
            actualiceSw(item._id, item.embodegado);
            counter++;
        });
    });
    if (errors.length > 0) {
        const msg = errors.join('; ');
        mostrarAlert('block', msg);
    } else {
        mostrarAlert('none');
    }

}

function actualiceSw(_id, estado) {

    const label = document.getElementById(`lsw${_id}`);
    label.innerHTML = estado ? 'Si' : 'No';
    const switche = document.getElementById(`sw${_id}`);
    switche.checked = estado ? true : false

}

document.getElementById("btnEditar").addEventListener("click", function () {
    const listItems = document.querySelectorAll('.checkArchivarM');
    console.log(listItems.length);
    listItems.forEach(input => {
        input.disabled = !input.disabled;
    })
});

document.getElementById('bodyInfo').addEventListener('click', async e => {
    const index = e.target.getAttribute('_index');
    if (!index) return;

    const oneLote = localTable[index];
    const estado = !oneLote.agotado;
    await updateDocument('Planilla', oneLote._id, { embodegado: estado });
    localTable[index].agotado = estado;
    actualiceSw(localTable[index]._id, estado)
})

async function updateDocument(modelo, _id, params, docResponse = false) {
    dataSend = { modelo, _id, params, docResponse };
    let response = await fetch("/core/update", {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify(dataSend)
    })

    const data = await response.json();
}

document.getElementById('btnEmbodegamiento').addEventListener('click', async e => {
    if (errors.length > 0) {
        toastr.warning('Hay errores sin corregir');
        return;
    }

    flags.funcionEmbodegar = 'paso1';
    document.getElementById('lblEmbodegar').innerHTML = ' Copiar código y cantidad';

    toEmbodegar = localTable.reduce((acc, item) => {
        //const cantProd = item.cantProd || 0;
        const cantProd = r2d(item.cantProd || 0, 2);
        const existingGroup = acc.find(group => group.codigoProducto === item.codigoProducto);

        if (existingGroup) {
            //existingGroup.cantProd += cantProd;
            existingGroup.cantProd = r2d(existingGroup.cantProd + cantProd, 2);
        } else {
            acc.push({
                codigoProducto: item.codigoProducto,
                ccostos: item.ccostos,
                cantProd: cantProd,
            });
        }

        return acc;
    }, []);

    toEmbodegar.sort((a, b) => a.codigoProducto.localeCompare(b.codigoProducto));
    console.log(toEmbodegar);

    const container = document.getElementById('bodyEmbodegar');
    container.innerHTML = '';
    toEmbodegar.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
                <td>${item.codigoProducto}</td>
                <td>${item.cantProd}</td>
                <td>${item.ccostos}</td>
                
            `;
        container.appendChild(tr);
    })

    $('#embodegarModal').modal('show');

});

document.getElementById('btnSaveBodega').addEventListener('click', async e => {
    if (flags.funcionEmbodegar === 'paso4') {
        flags.funcionEmbodegar = 'paso1';
    }
    if (flags.funcionEmbodegar === 'paso3') {
        if (flags.bodegaChange) {
            await saveBodega();
        }
        flags.bodegaChange = false;
        flags.funcionEmbodegar = 'paso4';
        document.getElementById('lblEmbodegar').innerHTML = ' Copiar código y cantidad';
    }
    if (flags.funcionEmbodegar === 'paso2') {
        pyme = '';
        toEmbodegar.forEach(item => {
            pyme += `${item.ccostos}\n`;
        });
        toClipBoard(pyme);
        document.getElementById('lblEmbodegar').innerHTML = ' Guardar';
        flags.funcionEmbodegar = 'paso3';
    }
    if (flags.funcionEmbodegar === 'paso1') {
        pyme = '';
        toEmbodegar.forEach(item => {
            pyme += `${item.codigoProducto}\t\t\t${item.cantProd}\n`;
        });
        toClipBoard(pyme);
        document.getElementById('lblEmbodegar').innerHTML = ' Copiar c. costos';
        flags.funcionEmbodegar = 'paso2';
    }

});

function r2d(num, decimals) {
    var factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
}

document.getElementById('btnConsumo').addEventListener('click', async e => {
    if (errors.length > 0) {
        toastr.warning('Hay errores sin corregir');
        return;
    }

    flags.funcionEmbodegar = 'paso1';
    document.getElementById('lblConsumo').innerHTML = ' Copiar código, c.c y cantidad';
    toEmbodegar = agruparInsumosPlano(localTable);
    console.log(toEmbodegar);
    const container = document.getElementById('bodyConsumo');
    container.innerHTML = '';
    toEmbodegar.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
                <td>${item.codigoInsumo}</td>
                <td>${item.ccostos}</td>
                <td>${item.cantidad}</td>
                
                
            `;
        container.appendChild(tr);
    })


    $('#consumoModal').modal('show');
})

function agruparInsumosPlano(data) {
    const resultado = [];

    data.forEach(item => {
        const { ccostos, detalle } = item;

        detalle.forEach(det => {
            const { codigoInsumo, cantidad } = det;
            let grupo = resultado.find(r => r.codigoInsumo === codigoInsumo && r.ccostos === ccostos);

            if (!grupo) {
                grupo = { codigoInsumo, ccostos, cantidad: 0 };
                resultado.push(grupo);
            }

            grupo.cantidad += cantidad || 0;
        });
    });

    return resultado.sort((a, b) => a.ccostos - b.ccostos);
}

document.getElementById('btnSaveConsumo').addEventListener('click', async e => {
    if (flags.funcionEmbodegar === 'paso4') {
        flags.funcionEmbodegar = 'paso1';
    }
    if (flags.funcionEmbodegar === 'paso3') {
        if (flags.bodegaChange) {
            await saveBodega();
        }
        flags.bodegaChange = false;
        flags.funcionEmbodegar = 'paso4';
        document.getElementById('lblConsumo').innerHTML = ' Copiar código y cantidad';
    }
    if (flags.funcionEmbodegar === 'paso2') {
        pyme = '';
        toEmbodegar.forEach(item => {
            pyme += `${item.ccostos}\n`;
        });
        toClipBoard(pyme);
        document.getElementById('lblConsumo').innerHTML = ' Guardar';
        flags.funcionEmbodegar = 'paso3';
    }
    if (flags.funcionEmbodegar === 'paso1') {
        pyme = '';
        toEmbodegar.forEach(item => {
            pyme += `${item.codigoInsumo}\t\t${item.ccostos}\t\t${item.cantidad}\n`;
        });
        toClipBoard(pyme);
        document.getElementById('lblConsumo').innerHTML = ' Copiar c. costos';
        flags.funcionEmbodegar = 'paso2';
    }

});

document.getElementById('btnResumen').addEventListener('click', async e => {
    if (errors.length > 0) {
        toastr.warning('Hay errores en las planillas, estos pueden alterar los resultados!');
        //return;
    }

    flags.funcionEmbodegar = 'paso1';
    document.getElementById('lblResumen').innerHTML = ' Copiar';
    toEmbodegar = agruparPorCodigoInsumo(localTable);
    console.log(toEmbodegar);
    const container = document.getElementById('bodyResumen');
    container.innerHTML = '';
    toEmbodegar.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
                <th scope="row">${index}</th>
                <td>${item.codigoInsumo}</td>
                <td>${item.nombreInsumo}</td>
                <td class="text-end">${formatearDato(item.cantidad,'123.00')}</td>
                
                
            `;
        container.appendChild(tr);
    })


    $('#resumenModal').modal('show');
})

function agruparPorCodigoInsumo(data) {
    const resultado = [];

    data.forEach(item => {
        const { detalle } = item;
        detalle.forEach(det => {
            const { codigoInsumo, nombreInsumo, cantidad } = det;
            let grupo = resultado.find(r => r.codigoInsumo === codigoInsumo);

            if (!grupo) {
                grupo = { 
                    codigoInsumo, 
                    nombreInsumo, 
                    cantidad: 0 
                };
                resultado.push(grupo);
            }
            grupo.cantidad += cantidad || 0;
        });
    });

    return resultado.sort((a, b) => a.codigoInsumo - b.codigoInsumo);
}

document.getElementById('btnSaveResumen').addEventListener('click', async e => {
        pyme = '';
        toEmbodegar.forEach(item => {
            pyme += `${item.codigoInsumo}\t${item.nombreInsumo}\t${r2d(item.cantidad,2)}\n`;
        });
        toClipBoard(pyme);
        
});
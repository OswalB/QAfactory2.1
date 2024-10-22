let contador = 0, varPin, docIngreso = {} = [], pendientes = [], facturar = [], opers, subCriterios;


document.getElementById('btnFacturar').addEventListener('click', async e => {
    let listChk = document.getElementsByClassName('checkArchivar');
    let pyme = '', bodega = 1;
    facturar = [];
    for (let item = 0; item < listChk.length; item++) {
        if (listChk[item].checked) {
            pyme += `${bodega}\t${pendientes[item].insumo.codigo}\t\t${pendientes[item].cantidad}\n`;
            facturar.push({ "_id": pendientes[item]._id, "facturada": true });
        }

    }
    facturar[0].modelo = 'Inalmacen';
    toClipBoard(pyme);
    console.log(pyme);
    console.log(facturar);
    const res = await fetch('/editor/update', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "PUT",
        body: JSON.stringify(facturar)
    });
    const dats = await res.json();
    console.log(dats)
    if (dats.fail) {
        toastr.error(dats.message);
        return;
    }
    toastr.info(dats.message);
    renderTable();

})

document.getElementById('btnArchivar').addEventListener('click', async e => {

    await renderArchivar();
    $('#archivarModal').modal('show');
    console.log('Archivar')
})


async function renderArchivar() {
    let res = await fetch('/control/almacen-sinfacturar', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: "POST",
        body: JSON.stringify({})
    });
    pendientes = await res.json();
    const container = document.getElementById('archivarList');
    container.innerHTML = '';
    pendientes.forEach(item => {
        let fecha = new Date(item.createdAt);
        let fechaTxt = `${fecha.toLocaleDateString('es-us', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`;
        const li = document.createElement('li');
        li.setAttribute("class", "list-group-item");
        li.innerHTML = `
            <input class="form-check-input me-1 checkArchivar" type="checkbox" value="" ><strong>${item.insumo.nombre}</strong>  (${fechaTxt}) ${item.nombreProveedor}, op: ${item.operario}              
        `;
        container.appendChild(li);
    })
}

function toClipBoard(pyme) {
    if (typeof (navigator.clipboard) == 'undefined') {
        console.log('navigator.clipboard');
        var textArea = document.createElement("textarea");
        textArea.value = pyme;
        textArea.style.position = "fixed";  //avoid scrolling to bottom
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            toastr.info(msg);
        } catch (err) {
            toastr.warning('Was not possible to copy te text: ', err);
        }

        document.body.removeChild(textArea)
        return;
    }
    navigator.clipboard.writeText(pyme).then(function () {

        toastr.info(`successful!`);
    }, function (err) {
        toastr.warning('unsuccessful!', err);
    });

}

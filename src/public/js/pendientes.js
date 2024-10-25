let lista1, lista2 = [];
//* * * * * * * * * *    FUNCIONES  inicio * * * * *
async function init() {
    document.getElementById('title-main').innerHTML = 'Pendientes';

    backFilter.filterBy = '0';
    backFilter.filterTxt = '';
    backFilter.limitar = 1000;
    backFilter.max = '';
    backFilter.min = '';
    backFilter.datemax = '';
    backFilter.datemin = '';
    backFilter.otrosMatch = [];
    backFilter.proyectar = [];
    backFilter.saltar = 0;
    backFilter.sortBy = '';
    backFilter.sortOrder = 1;
    backFilter.valorBoolean = 'false';
    backFilter.group = 'itemspp';
    backFilter.datepp = formatDate(new Date());
    backFilter.keyGroup = 'createdAt';

    let response = await fetch("/core/keys", {
        headers: { 'content-type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ modelo: 'Order' })
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

async function renderTable() {
    const res = await fetch('/domain/pendientes/resum');
    lista1 = await res.json();
    if (lista1.fail) {
        toastr.error('Reintente!', 'No se ha podido recibir los datos.');

    }
    lista1.sort((a, b) => {
        const numA = parseFloat(a.cat);
        const numB = parseFloat(b.cat);
        if (numA === numB) {
            const result = a.cat.localeCompare(b.cat);
            if (result === 0) {
                return a.code.localeCompare(b.code);
            }
            return result;
        }
        return numA - numB;
    });
    depurarLista();
    let idContainer;
    let container = document.getElementById("container");
    container.innerHTML = '';
    lista2.forEach((item, index, array) => {
        let renglones = '';
        item.detalle.forEach((det) => {
            renglones += `<tr><td>${det.cliente}</td><td>${det.saldo}</td></tr>`;
        });

        let div;
        if (item.group) {
            div = document.createElement('div');
            div.setAttribute('class', 'text-center');
            div.innerHTML = `<h4 id="categ${index}">${item.group} (${item.total})</h4>`;
            container.appendChild(div);

            idContainer = `accBody${index}`;
            div = document.createElement('div');
            div.setAttribute('class', 'accordion accordion-flush');
            div.setAttribute('id', idContainer);
            container.appendChild(div);
        }
        const containerAcc = document.getElementById(idContainer);
        div = document.createElement('div');
        div.setAttribute('class', 'accordion-item');
        div.innerHTML = `
            <h2 class="accordion-header" id="flush-heading${index}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#flush-collapse${index}" >
                    <div class="flex-fill">${item.name}</div>
                    <div class="mx-5">${item.saldot}</div>
                </button>
            </h2>
            <div id="flush-collapse${index}" class="accordion-collapse collapse"  data-bs-parent="#accBody${index}">
                <div class="accordion-body">
                    <table class="table table-striped">
                        <tbody>
                            ${renglones}
                        </tbody>
                    </table>
                </div>
            </div>
            `;

        containerAcc.appendChild(div);

    });





}

function depurarLista() {
     lista2 = lista1
        .map(item => {
            const detalle2 = item.detalle.filter(det => det.saldo > 0);
            const newSaldo = detalle2.reduce((sum, det) => sum + det.saldo, 0);
            return detalle2.length > 0 ? { ...item, detalle: detalle2, saldot: newSaldo } : null;
        })
        .filter(Boolean); // Elimina elementos nulos

    let prevCat = null;
    let indexGroup = -1;
    let acum = 0;

    lista2.forEach((item, index, array) => {
        const eof = index === array.length - 1;
        if (item.cat !== prevCat || eof) {
            if (indexGroup !== -1) array[indexGroup].total =  eof ? acum + item.saldot : acum;
            item.group = eof?'':item.cat;
            prevCat = item.cat;
            indexGroup = index;
            acum = item.saldot;
        } else {
            acum += item.saldot;
        }
    });

}

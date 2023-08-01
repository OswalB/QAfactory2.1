let currentCollection

document.getElementById('listDocuments').addEventListener('click',async e =>{
    currentPage = 1;
    let m =e.target.getAttribute('_modelo');
    let t =e.target.getAttribute('_titulo');
    currentCollection ={"titulo":t, "modelo":m};
    filterPag.modelo = m;
    let boton = document.getElementById('btnChose');
    boton.innerHTML = t;
    await renderTable();
    setFilter('config');
    await footer();
})

//=========================== FUNCTIONS =============================================
async function init(){
    document.getElementById('title-main').innerHTML='Editor'
    page.szItems=13
    await loadList();
};

function afterLoad(){

};

function renderTable(){

}

async function loadList(){
    let listaEditables =  await fetch("/api/editor/listCollections");
    listaEditables = await listaEditables.json();
    const container = document.getElementById('listDocuments');
    container.innerHTML='';
    listaEditables.forEach(item =>{
        const li = document.createElement('li');
        li.innerHTML= `
        <a _modelo="${item.modelo}" _titulo="${item.titulo}" class="dropdown-item" href="#">${item.titulo}</a>
        `;
        container.appendChild(li);
    })   
}



var currentKeys =[], filterPag ={}, tgg = true, page = {};

document.addEventListener('DOMContentLoaded', async () => {
    page.current = 1;
    page.szCollection = 0;
    page.szItems = 10;
    page.ordenPor = '0';
    page.sortAsc = true;
    page.filterBy = '0';
    page.filterTxt = '';

    await init();
    setFilter('config');
    await footer();
    afterLoad();
    //await renderTable();
})

document.getElementById('pagination_container').addEventListener('click',async e =>{
    let i =e.target.getAttribute('_id');
    page.current = i; 
    await footer(); 
    renderTable(); 
})

document.getElementById('btn-refrescar').addEventListener('click',async e =>{
    page.current =1
    await footer(); 
    renderTable(); 
})

document.getElementById('form-filtro').addEventListener('change',async e =>{
    setFilter('panel');
    await footer(); 
    renderTable(); 
})



//-------------------------- MENU LATERAL  --------------------------------------

$(".sidebar ul li").on('click', function () {
    $(".sidebar ul li.active").removeClass('active');
    $(this).addClass('active');
})

$(".btnmenu").on('click', function () {

    if (tgg) {
        $('.sidebar').addClass('active');
        $('#nav-menu').addClass('active');
        $('.content-w').addClass('active');
        
    } else {
       
        $('.sidebar').removeClass('active');
        $('#nav-menu').removeClass('active');
        $('.content-w').removeClass('active');
    }
    tgg = !tgg
});

$(".content-w").on('click', function () {

    if (!tgg) {
        
        $('.sidebar').removeClass('active');
        $('#nav-menu').removeClass('active');
        $('.content-w').removeClass('active');
    }
    tgg = !tgg
})

//-------------------------- FUNCIONES  --------------------------------------


//-------------------------- PAGINATION AND FILTER  --------------------------------------

function setFilter(origin) {  //origin : config || panel
    const originPanel = origin=='panel';
    if(originPanel) {
        panelToConfig();
        loadFilter();
    }else{
        configToPanel();
        loadFilter();
    }
}

function configToPanel(){
    
    document.getElementById('in-itempag').value = page.szItems;

    let container = document.getElementById('ordenpor');
    container.innerHTML = '';
    let op = document.createElement('option');
    let i = 0;
    op.setAttribute("value", 0);
    op.innerHTML = 'Ninguno';
    container.appendChild(op);
    currentKeys.forEach(item => {
        op = document.createElement('option');

        op.setAttribute("value", item.campo);
        op.innerHTML = `${item.alias}`;
        container.appendChild(op);
    });
    container = document.getElementById('filtroPor');
    container.innerHTML = '';
    op = document.createElement('option');
    i = 0;
    op.setAttribute("value", 0);
    op.innerHTML = 'Ninguno';
    container.appendChild(op);
    currentKeys.forEach(item => {
        op = document.createElement('option');
        i++;
        op.setAttribute("value", item.campo);
        op.innerHTML = `${item.alias}`;
        container.appendChild(op);
    });

    document.getElementById('ordenpor').value =  page.ordenPor;
    document.getElementById('checkAsc').checked = page.sortAsc;
    document.getElementById('checkDsc').checked = !page.sortAsc;
    document.getElementById('filtroPor').value = page.filterBy;
    document.getElementById('in-filter').value = page.filterTxt;
}

function loadFilter(){
    filterPag.filterTxt = document.getElementById('in-filter').value;
    filterPag.filterBy = document.getElementById('filtroPor').value;
        if(filterPag.filterBy=='0')filterPag.filterBy='';
    filterPag.sortBy = document.getElementById('ordenpor').value;
        if(filterPag.sortBy == '0')filterPag.sortBy='';
    filterPag.sortAsc = document.getElementById('checkAsc').checked;
    filterPag.limitar = parseInt(document.getElementById('in-itempag').value);
    filterPag.saltar = (page.current - 1) * filterPag.limitar;
    
            
            
            
}

function panelToConfig(){
    page.szItems = document.getElementById('in-itempag').value;
    page.ordenPor = document.getElementById('ordenpor').value;
    page.sortAsc = document.getElementById('checkAsc').checked;
    page.filterBy = document.getElementById('filtroPor').value;
    if(page.filterBy == '0'){
        document.getElementById('in-filter').value = '';
        page.filterTxt = '';
    }else{
        page.filterTxt = document.getElementById('in-filter').value;
    }
    
}

async function footer(){
    filterPag.saltar = (page.current - 1) * page.szItems;
    filterPag.limitar = parseInt(page.szItems);
  //consultar tamaño de coleccion
    let response = await fetch("/api/gen_count",{
        headers: {'content-type': 'application/json'},
        method: 'POST',
        body: JSON.stringify(filterPag)
    })
    let data = await response.json();
    sizeCollection = data[0].countTotal;
    
    
    let winL, winR, winMax;
    let pags = Math.trunc(sizeCollection/page.szItems);
    if(sizeCollection%page.szItems != 0){pags += 1;}
    document.getElementById('lbl_results').innerHTML=`Resultados: ${sizeCollection}`;
    const pagContainer = document.getElementById('pagination_container');
    pagContainer.innerHTML='';
    if(page.current<(pags-2)){winL = page.current-2;}
    else{winL = pags-5;}
    if(winL < 2 || pags < 8 ){winL = 2;}
    winR= winL+4;
    if(winR>(pags-1)){winR=pags-1}
    if(pags > 0){this.addPag(pagContainer,1,page.current);}
    if(winL > 2){this.addPag(pagContainer,0,page.current);}
    for(let i = winL; i<= winR; i++){
        this.addPag(pagContainer,i,page.current);
    }
    if(pags - winR  > 1){this.addPag(pagContainer,0,page.current);}
    if(pags > 1){this.addPag(pagContainer,pags,page.current);}
}

function addPag(pagContainer,i){
    
    const lipag = document.createElement('li');
    let clase = 'page-item';
    if(i==page.current){clase += ' active';}
    lipag.setAttribute('class', clase);
    if(i==0){
        lipag.innerHTML = `<label class="px-2"> ... </label>`;
    }else{
        lipag.innerHTML = `<a class="page-link " _id=${i} href="#" id="page${i}">${i}</a>`;
    }
    pagContainer.appendChild(lipag);
}


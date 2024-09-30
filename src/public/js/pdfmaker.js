let _escape = false, dataUnwind = [], keysAndTypes = []; originData = [], jsonPDF = [];
let localDesign = { pagina: {} }, doc;


async function generarPDF(design) {
    doc = new jsPDF({
        orientation: design.pagina.orientation,
        unit: 'pt',
        format: formatPaper(design.pagina.size)
    });

    jsonPDF = [];
    const pageSize = doc.internal.pageSize;
    const page = {
        ml: r2d(mmToPt(design.pagina.ml), 2),
        mr: r2d(mmToPt(design.pagina.mr), 2),
        mt: r2d(mmToPt(design.pagina.mt), 2),
        mb: r2d(mmToPt(design.pagina.mb), 2),
        pw: r2d(pageSize.getWidth(), 2),
        ph: r2d(pageSize.getHeight(), 2),
        sw: r2d(pageSize.getWidth() - mmToPt(design.pagina.ml) - mmToPt(design.pagina.mr), 2),
        sh: r2d(pageSize.getHeight() - mmToPt(design.pagina.mt) - mmToPt(design.pagina.mb), 2),
        centerX: r2d((pageSize.getWidth() - mmToPt(design.pagina.ml) - mmToPt(design.pagina.mr)) / 2 + mmToPt(design.pagina.ml), 2),

        colpt: r2d((pageSize.getWidth() - mmToPt(design.pagina.ml) - mmToPt(design.pagina.mr)) / 12, 2),
        maxR: r2d(pageSize.getWidth() - mmToPt(design.pagina.mr), 2),
        maxY: r2d(pageSize.getHeight() - mmToPt(design.pagina.mt), 2),
    };
    //console.log(page)

    //printPattern(page.ml, page.colpt, page.mt, page.sh);

    doc.text(5, 15, 'v1.007');
    doc.rect(page.ml, page.mt, page.sw, page.sh);


    originData = [...dataUnwind];

    if (design.pagina.fieldFilter) {
        originData = filterArray(dataUnwind, design.pagina.fieldFilter);
    }
    if (design.pagina.fieldOrder) {
        originData = ordenarPorCampo(originData, design.pagina.fieldOrder);
    }
    if (design.pagina.fieldGroup) {
        originData = groupByField(originData, design.pagina.fieldGroup);
    } else {
        originData = groupByField(originData, design.pagina.fieldGroup);
    }

    addFields(originData, design);
    _escape = false;
    let result = '';
    let indexPage = 0;
    let absY = page.mt;
    let sw = configSw({ HR: true, HP: true })
    const tableStyle = design.pagina.tableStyle?JSON.parse(design.pagina.tableStyle):'';
    console.log('estilo de tabla:',tableStyle);
    Object.keys(originData).forEach((group, index) => {
        originData[group].forEach(dataSet => {
            const EOG = dataSet._endGroup;
            const EOR = (Object.keys(originData).length == index + 1) && dataSet._endGroup;

            if (dataSet._startGroup && !sw.HR) sw = configSw({ HG: dataSet._startGroup && !sw.HR, });
            if (sw.HR) {
                ({ absY, indexPage, result } = printPDF(design.headerReport, dataSet, page, absY, indexPage));
                if (result === 'next') sw = configSw({ HP: true });
            }
            do {                    //Repeat
                if (sw.HP) {
                    ({ absY, indexPage, result } = printPDF(design.headerPage, dataSet, page, absY, indexPage));
                    if (result === 'next' && !sw.caso345) sw = configSw({ HG: true });
                }
                if (sw.HG) {
                    ({ absY, indexPage, result } = printPDF(design.headerGroup, dataSet, page, absY, indexPage));
                    if (result === 'next' && !sw.caso345) sw = configSw({ HD: true });
                    if (result === 'newPage') {
                        sw = configSw({ HP: true, HG: true });
                        result = 'repeat'
                    }
                }
                if (sw.HD) {
                    ({ absY, indexPage, result } = printPDF(design.headerDetail, dataSet, page, absY, indexPage,tableStyle));
                    if (result === 'next') sw = configSw({ DET: true });
                    if (result === 'newPage') {
                        sw = configSw({ HP: true, HG: true, HD: true });
                        result = 'repeat'
                    }
                }
                if (sw.DET) {
                    ({ absY, indexPage, result } = printPDF(design.detail, dataSet, page, absY, indexPage));
                    if (result === 'next') sw = configSw({ DET: true });
                    if (result === 'newPage') {
                        sw = configSw({ HP: true, HG: true, HD: true, DET: true });
                        result = 'repeat'
                    }
                    if (result === 'next' && EOG) {
                        sw = configSw({ FD: true });
                        result = 'repeat'
                    }
                }
                if (sw.FD) {
                    ({ absY, indexPage, result } = printPDF(design.footerDetail, dataSet, page, absY, indexPage));
                    if (result === 'next') sw = configSw({ DET: true });
                    if (result === 'newPage') {
                        sw = configSw({ HP: true, HG: true, FD: true, caso345: true });
                        result = 'repeat'
                    }
                    if (result === 'next' && EOG) sw = configSw({ FG: true });
                }
                if (sw.FG) {
                    ({ absY, indexPage, result } = printPDF(design.footerGroup, dataSet, page, absY, indexPage));
                    if (result === 'next' && EOR) sw = configSw({ FR: true });
                    if (result === 'newPage') {
                        sw = configSw({ HP: true, HG: true, FG: true, caso345: true });
                        result = 'repeat'
                    }
                }
                if (sw.FR) {
                    ({ absY, indexPage, result } = printPDF(design.footerReport, dataSet, page, absY, indexPage));
                    if (result === 'newPage') {
                        sw = configSw({ HP: true, FR: true, caso345: true });
                        result = 'repeat'
                    }
                }
            } while (result === 'repeat' && !_escape)

        })

    })


    // return;



    jsonPDF.forEach((pagina, index) => {
        if (index > 0) {
            newPage()
        }
        pagina.box.forEach(caja => {
            if (!caja.fll) return;
            doc.setFillColor(caja.cb);
            doc.rect(caja.x, caja.y, caja.wb, caja.hb, caja.fll);
        });
        pagina.text.forEach(texto => {
            doc.setTextColor(texto.cf);
            doc.setFontSize(texto.sf);
            doc.text(texto.tx, texto.x, texto.y)
        })
    })


    numerateMarks(localDesign.pagina.pagination, page);


    const out = doc.output();
    const url = 'data:application/pdf;base64,' + btoa(out);
    const iframe = "<iframe width='100%' height='100%' src='" + url + "'></iframe>";
    const x = window.open();
    x.document.open();
    x.document.write(iframe);
    x.document.close();



}

function numerateMarks(style, properties) {
    let styleAlign, sufijo;

    switch (style) {
        case '0': return;
        case '1':
            styleAlign = 1;
            sufijo = '';
            break;
        case '2':
            styleAlign = 1;
            sufijo = ' de ';
            break;
        case '3':
            styleAlign = 2;
            sufijo = '';
            break;
        case '4':
            styleAlign = 2;
            sufijo = ' de ';
            break;
    }
    const prefijo = 'Página';
    const fontSize = 10;
    const totalPages = doc.getNumberOfPages();
    const y = properties.maxY + (fontSize * 1.3)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(fontSize);
    for (let pg = 1; pg <= totalPages; pg++) {
        const footerText = `${prefijo} ${pg} ${sufijo ? sufijo + totalPages : ''}`;
        const width = doc.getTextWidth(footerText);
        const x = alinear(properties.ml, 0, properties.sw, styleAlign, width);
        doc.setPage(pg);
        doc.text(footerText, x, y);
        doc.text("\u25A1", 20, y);
    }

}






function printPDF(template, dataSet, page, absY, indexPage,tableStyle) {
    if(tableStyle)console.log(tableStyle.bgDark);
    if (template.length < 1) return { absY, indexPage, result: 'next' };
    layOut(template, dataSet, page, absY, indexPage);
    maxHeightRow(template);

    let rowX = page.ml, rowY = absY        //copia (x,y) iniciales
    let carry = 0;
    let totalHeight = 0;
    let forcedNewPage = false;
    template.forEach((item, index) => {
        if (item.startRow) {
            totalHeight += item.height;
        }
        if (item.forceNewPage) forcedNewPage = true;
    });

    if (rowY + totalHeight > (page.maxY * 1.02)) {       //desborde de pagina
        console.warn('No se imprime', 'absy:', absY, 'page', indexPage);
        indexPage++;
        absY = page.mt;
        return { absY, indexPage, result: 'newPage' }
    }


    template.forEach((item, index) => {    //push campo texto y caja
        const paddingY = parseInt(item.paddingY);
        const paddingX = parseInt(item.paddingX);
        const align = parseInt(item.align);
        const fontSize = parseInt(item.sizeFont);
        if (item.startRow || item.forceNewRow) {            //nuevo renglon
            rowY += carry;
            rowX = page.ml;
        }
        let lineY = rowY + item.lineH + paddingY;
        doc.setFontSize(fontSize);
        item.lineas.forEach(linea => {
            const textWidth = r2d(doc.getTextWidth(linea), 2);
            const lineX = alinear(rowX, paddingX, item.width, align, textWidth);

            addElementToJsonPDF('text', {
                x: lineX,
                y: lineY,
                sf: parseInt(item.sizeFont),
                cf: item.colorFont,
                tx: linea
            }, indexPage);

            lineY += item.lineH;
        });

        if (item.siBorde || item.siBg) {
            const fillBox = item.siBorde && item.siBg ? 'FD' : item.siBg ? 'F' : 'S';
            addElementToJsonPDF('box', {
                x: rowX,
                y: rowY,
                wb: item.width,
                hb: item.height,
                fll: fillBox,
                cb: item.colorBg
            }, indexPage);
        }
        rowX += item.width;
        carry = item.height;
    })

    if (forcedNewPage) {       //desborde de pagina forzado
        console.warn('new page forced', 'absy:', absY, 'page', indexPage);
        indexPage++;
        rowY = page.mt;
        carry = 0;
    }
    return { absY: rowY + carry, indexPage, result: 'next' }

}

function configSw({ HR = false, HP = false, HG = false, HD = false, DET = false, FD = false, FG = false, FP = false, FR = false, caso345 = false } = {}) {
    return { HR, HP, HG, HD, DET, FD, FG, FP, FR, caso345 };
}

// +***********  FUNCIONES DE datos pdf rev 28/sep

function layOut(template, dataSet, page, absY, indexPage) {
    let sumW = 0, filas = 0, startRow = true;

    template.forEach(textControl => {
        const paddingX = parseInt(textControl.paddingX);
        const paddingY = parseInt(textControl.paddingY);
        const fontSize = parseInt(textControl.sizeFont);
        const height = parseInt(textControl.height);
        textControl.width = r2d(textControl.col * page.colpt, 2);
        sumW += textControl.width;
        textControl.startRow = startRow;
        if (sumW > (page.sw * 1.01)) {          //establece nueva linea
            sumW = textControl.width;
            filas += 1;
            textControl.startRow = true;
        }
        startRow = false;
        textControl.fila = filas;
        textControl.sw = textControl.width - paddingX - paddingX;
        doc.setFontSize(fontSize);

        //let testTexto ='';
        const fx = textControl.fxControl ? textControl.fxControl : false;
        const origin = textControl.originControl ? textControl.originControl : false;
        if (fx && origin) {           //hay formulas
            textControl.texto = dataSet[`__${fx}_${origin}`];
        } else if (origin) {
            textControl.texto = dataSet[textControl.originControl] || '';
        } else {
            textControl.texto = textControl.texto || '';
        }
        if (textControl.formatControl) {
            textControl.texto = formatearDato(textControl.texto, textControl.formatControl);
        }
        textControl.lineas = doc.splitTextToSize(String(textControl.texto), textControl.sw);
        textControl.lineH = r2d(fontSize, 2);
        const newH = (textControl.lineas.length * textControl.lineH) + paddingY + r2d(fontSize * 0.25, 2);
        textControl.height = newH > height ? newH : height;

    });


}

function maxHeightRow(items) {
    let filas = items.reduce((acc, item) => {
        if (!acc[item.fila]) {
            acc[item.fila] = [];
        }
        acc[item.fila].push(item);
        return acc;
    }, {});

    for (let fila in filas) {
        let maxHeight = Math.max(...filas[fila].map(item => item.height));
        filas[fila].forEach(item => {
            item.height = maxHeight;
        });
    }
}

function newPage() {
    //console.log('codigo para una nueva pagina');
    doc.addPage();
}

function printBox(box, item, px, py) {
    if (item.siBorde) {
        doc.rect(px, py, box.width, box.height);
    }
}

function testWidth(px, py, width, maxR, ml, maxHeight) {
    if ((px + width) > maxR) {
        return { px: ml, py: py + maxHeight, maxHeight: 0 }
    } else {
        return { px, py, maxHeight }
    }
}

function alinear(x, padding, space, fx, textWidth) {
    if (fx === 0) return x + padding;
    if (fx === 1) return r2d(x + ((space - textWidth) / 2), 2);
    if (fx === 2) return x + space - textWidth - padding;
    return x;
}

function mmToPt(mm) {
    const ptPerMm = 2.83465;
    return r2d(mm * ptPerMm, 2);
}

function r2d(num, decimals) {
    var factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
}

function unwind(data) {

    console.log(data)
    dataUnwind = [], keysAndTypes = [];
    data.forEach(documento => {
        const jsonData = exploreObject(documento);
        const indexPadre = jsonData.reduce((minIdx, item, index) => {
            return (minIdx === -1 || item.parent.yo < jsonData[minIdx].parent.yo)
                ? index
                : minIdx;
        }, -1);
        const padre = jsonData[indexPadre].parent.yo;
        res = consolidar(jsonData, padre, indexPadre);
        dataUnwind = [...dataUnwind, ...res];
    })

    console.log(dataUnwind);
    keysAndTypes = getKeysAndTypes(dataUnwind);

}

function exploreObject(obj, idPadre, parentKey = '', accumulator = []) {
    if (typeof exploreObject.counter === 'undefined') {
        exploreObject.counter = 400;
    }
    exploreObject.counter++;
    let flat = {};
    const idYo = exploreObject.counter;
    if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
            exploreObject(item, idYo, parentKey, accumulator);
        });
    } else if (typeof obj === 'object' && obj !== null) {
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                const fullKey = parentKey ? `${parentKey}.${key}` : key;
                if (Array.isArray(obj[key]) || typeof obj[key] === 'object') {
                    exploreObject(obj[key], idYo, fullKey, accumulator);
                } else {
                    flat[fullKey] = obj[key];
                }
            }
        }
    }
    if (Object.keys(flat).length > 0) {
        accumulator.push({ datos: flat, parent: { cont: exploreObject.counter, yo: idYo, padre: idPadre - 1 } });
    }

    return accumulator;
}

function consolidar(arr, padre, indexPadre, accObject = {}, resultados = []) {
    let tieneHijos = false;

    arr.forEach(item => {
        if (item.parent.padre === padre) {
            tieneHijos = true;
            accObject = { ...accObject, ...item.datos };
            consolidar(arr, item.parent.yo, indexPadre, accObject, resultados);
        }
    });

    if (!tieneHijos) {
        accObject = { ...arr[indexPadre].datos, ...accObject };
        resultados.push(accObject);
    }

    return resultados;
}

function getKeysAndTypes(arr) {
    let keysAndTypes = [];

    arr.forEach(item => {
        Object.keys(item).forEach(key => {
            // Verificamos si la clave ya fue agregada
            if (!keysAndTypes.some(field => field.campo === key)) {
                keysAndTypes.push({
                    campo: key,
                    type: typeof item[key]
                });
            }
        });
    });

    keysAndTypes = ordenarPorCampo(keysAndTypes, 'campo', true);
    keysAndTypes.push(
        { campo: '_#', type: 'number' },
        { campo: '_##', type: 'string' },
    );
    return keysAndTypes;
}

function groupByField(arr, field) {
    return arr.reduce((acc, item) => {
        const fieldValue = item[field];

        // Si el valor es nulo, undefined o vacío, lo agrupamos bajo una clave especial
        const key = fieldValue === undefined || fieldValue === null || fieldValue === '' ? 'empty' : fieldValue;

        if (!acc[key]) {
            acc[key] = [];
        }

        acc[key].push(item);
        return acc;
    }, {});
}

function addFields(arr, design) {
    let setFx = [];
    design.footerDetail.forEach(campo => {
        if (campo.originControl) {
            if (campo.fxControl) {
                setFx.push({ [campo.originControl]: campo.fxControl });
            }
        }
    })
    console.log(setFx);
    let arrayReport = [];
    let totalCount = 0;
    Object.keys(arr).forEach((group, index) => {
        registros = arr[group].length;
        arr[group].forEach((item, index) => {
            totalCount++;
            subtc = `${index + 1} de ${registros}`
            item['_#'] = totalCount;
            item['_##'] = subtc;
            item['_startGroup'] = index == 0 ? true : false;
            item['_endGroup'] = (index + 1) == registros ? true : false;
            if ((index + 1) == registros) {
                //item.formulas = {};
                setFx.forEach(f => {
                    const k = Object.keys(f);
                    //const array = arr[group].map(item => item[k]);
                    const array = arr[group].map(item => {
                        return item && item[k] !== undefined && item[k] !== null ? item[k] : 0;
                    });
                    const res = dataFx(array, f[k]);
                    const campo = `__${f[k]}_${[k]}`;
                    item[campo] = res;
                })

            }
        })
    })
}

function filterArray(arr, condition) {

    const [field, operator, value] = condition.split(/(>=|<=|==|=|>|<)/).map(str => str.trim());
    return arr.filter(item => {
        if (!(field in item)) {
            return false;
        }

        let fieldValue = item[field];
        let conditionValue;

        if (typeof (fieldValue) === 'boolean') {
            conditionValue = value === 'true' ? true : false;
        } else if (!isNaN(value)) {
            conditionValue = parseFloat(value);
        } else {

            fieldValue = fieldValue.toString().toLowerCase();
            conditionValue = value.toLowerCase();
        }

        switch (operator) {
            case '=':
                if (typeof fieldValue === 'string') {
                    // Para cadenas, buscamos coincidencias parciales
                    return fieldValue.includes(conditionValue);
                } else {
                    return fieldValue == conditionValue;
                }
            case '==':
                if (typeof fieldValue === 'string') {
                    // Para cadenas, buscamos coincidencias parciales
                    return fieldValue == conditionValue;
                } else {
                    return fieldValue == conditionValue;
                }
            case '>':
                return fieldValue > conditionValue;
            case '<':
                return fieldValue < conditionValue;
            case '>=':
                return fieldValue >= conditionValue;
            case '<=':
                return fieldValue <= conditionValue;
            default:
                return false;
        }
    });
}

function ordenarPorCampo(arr, campo, ordenAscendente = true) {
    return arr.sort((a, b) => {
        if (typeof a[campo] === 'string') {
            // Comparación para strings
            return ordenAscendente
                ? a[campo].localeCompare(b[campo])
                : b[campo].localeCompare(a[campo]);
        } else {
            // Comparación para números u otros tipos de datos
            return ordenAscendente
                ? a[campo] - b[campo]
                : b[campo] - a[campo];
        }
    });
}

function addElementToJsonPDF(type, properties, pageIndex) {
    // Si la página no existe, la creamos
    if (!jsonPDF[pageIndex]) {
        jsonPDF[pageIndex] = { text: [], box: [] }; // Inicializamos con arrays vacíos para text y box
    }

    // Agregar el elemento al array correspondiente
    if (type === 'text') {
        jsonPDF[pageIndex].text.push({
            x: properties.x,
            y: properties.y,
            sf: properties.sf,
            cf: properties.cf,
            tx: properties.tx
        });
    } else if (type === 'box') {
        jsonPDF[pageIndex].box.push({
            x: properties.x,
            y: properties.y,
            wb: properties.wb,
            hb: properties.hb,
            fll: properties.fll,
            cb: properties.cb
        });
    }
}

function printPattern(marginL, wCol, marginT, spaceH) {

    doc.setLineWidth(1);
    doc.setDrawColor(255, 0, 0);
    y1 = marginT;
    y2 = marginT + spaceH;
    for (var filas = 0; filas < 12; filas++) {
        x1 = marginL + (filas * wCol)
        x2 = x1;
        console.log(x1, y1, x2, y2)
        doc.line(x1, y1, x2, y2);
    }
}

function calcularDesviacionEstandar(valores) {
    const media = valores.reduce((acumulador, valor) => acumulador + valor, 0) / valores.length;
    const sumaCuadrados = valores.reduce((acumulador, valor) => {
        const diferencia = valor - media;
        return acumulador + Math.pow(diferencia, 2);
    }, 0);
    const varianza = sumaCuadrados / valores.length;
    return Math.sqrt(varianza);
}

function calcularMediana(array) {
    array.sort((a, b) => a - b);
    const mitad = Math.floor(array.length / 2);
    return array.length % 2 !== 0 ? array[mitad] : (array[mitad - 1] + array[mitad]) / 2;
}

function calcularModa(array) {
    const frecuencia = {};
    array.forEach(valor => {
        frecuencia[valor] = (frecuencia[valor] || 0) + 1;
    });
    let moda = null;
    let maxFrecuencia = 0;
    for (let valor in frecuencia) {
        if (frecuencia[valor] > maxFrecuencia) {
            maxFrecuencia = frecuencia[valor];
            moda = Number(valor);
        }
    }
    return moda;
}

function calcularVarianza(array) {
    const media = array.reduce((acumulador, valor) => acumulador + valor, 0) / array.length;
    const sumaCuadrados = array.reduce((acumulador, valor) => {
        const diferencia = valor - media;
        return acumulador + Math.pow(diferencia, 2);
    }, 0);
    return sumaCuadrados / array.length;
}

function dataFx(array, fx) {
    switch (fx) {
        case 'sum':  // Suma
            return array.reduce((acumulador, valor) => acumulador + valor, 0);

        case 'av':   // Promedio
            return array.reduce((acumulador, valor) => acumulador + valor, 0) / array.length;

        case 'min':  // Mínimo
            return Math.min(...array);

        case 'max':  // Máximo
            return Math.max(...array);

        case 'std':  // Desviación estándar
            return calcularDesviacionEstandar(array);

        case 'var': // Varianza
            return calcularVarianza(array);

        case 'med':  // Mediana
            return calcularMediana(array);

        case 'range':  // Rango 
            return Math.max(...array) - Math.min(...array);

        case 'moda':  // Moda
            return calcularModa(array);

        default:
            throw new Error('Operación no reconocida');
    }
}

function formatPaper(sizeType) {
    //tamaños personalizados
    switch (sizeType) {
        case 'half-letter':
            return [mmToPt(139.7), mmToPt(215.9)];
        case 'folio':
            return [mmToPt(215.9), mmToPt(330)];
        default:
            return sizeType;
    }
}

function formatearDato(dato, formato) {
    if (dato == undefined) return '-';
    // Verificar si el dato es un número
    const esNumero = !isNaN(dato) && !isNaN(parseFloat(dato));

    // Si es un número, llamamos a formatearNumero
    if (esNumero) {
        let opciones = { minimumFractionDigits: 0, maximumFractionDigits: 0, useGrouping: true };

        switch (formato) {
            case '123':
                opciones.maximumFractionDigits = 0; // Sin decimales
                break;
            case '123.0':
                opciones.minimumFractionDigits = 1;
                opciones.maximumFractionDigits = 1;
                break;
            case '123.00':
                opciones.minimumFractionDigits = 2;
                opciones.maximumFractionDigits = 2;
                break;
            case '123.000':
                opciones.minimumFractionDigits = 3;
                opciones.maximumFractionDigits = 3;
                break;
            case '123.0000':
                opciones.minimumFractionDigits = 4;
                opciones.maximumFractionDigits = 4;
                break;
            default:
                return dato; // Devolver el número original si el formato no coincide
        }

        return parseFloat(dato).toLocaleString('es-ES', opciones);
    }

    // Si no es un número, asumimos que es una fecha (en formato ISO)
    const esFecha = !isNaN(Date.parse(dato));

    if (esFecha) {
        const fecha = new Date(dato);
        switch (formato) {
            case 'dd/mm/aa':
                return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' });
            case 'dd/mmm/aa':
                return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: '2-digit' });
            case 'dd/mmm/aaa':
                return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
            case 'dd/mmmm/aaa':
                return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
            case 'dd/mmm/aaa-00:00':
                return `${fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} ${fecha.toLocaleTimeString('es-ES')}`;
            case 'hh:mm:ss':
                return fecha.toLocaleTimeString('es-ES');
            case 'hh:mm':
                return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
            case 'hhh:mm':
                return fecha.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', hour12: true });
            case 'hhh:mm:ss':
                return fecha.toLocaleTimeString('es-ES', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
            default:
                return dato; // Devolver el dato original si el formato no coincide
        }
    }

    // Si no es ni número ni fecha, devolver el dato original
    return dato;
}



const fs = require('fs');
const path = require ('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
var XLSX = require("xlsx"); 
const xl = require("excel4node")


const mainController = {

    index:  (req,res)=>{
        res.render('index')
    
    },

    upload: (req,res)=>{
        const excel1 = XLSX.readFile("./excel/" + req.files[0].originalname);
        const excel2 = XLSX.readFile("./excel/" + req.files[1].originalname);
        
        var nombreHoja1 = excel1.SheetNames ;
        let RIO1 = XLSX.utils.sheet_to_json(excel1.Sheets[nombreHoja1[0]])
    
        var nombreHoja2 = excel2.SheetNames ;
        let RIO2 = XLSX.utils.sheet_to_json(excel2.Sheets[nombreHoja2[0]])
    
          var A = RIO1 ;
          var B = RIO2 ;
        
        var AModificados = [];
        var BModificados = [];

    
    //******************** PASAR STOCK DE RIO MEJOR (RIO2) A LA MAGA STORE (RIO1) ***********/
        const artSinStock = A.filter(sinStock => sinStock['Stock Disponible']<=6  || (sinStock['Stock Disponible']<=24 && (sinStock.Rubro == "Boxers" || sinStock.Rubro == "Medias" )))                  //filtra articulos sin STOCK en ((LAMAGA))
        //console.log("🚀 ~ file: mainController.js:35 ~ artSinStock", artSinStock)
        
       for(let i = 0; i < artSinStock.length ; i++){                                     
     
            const SKU = artSinStock[i].Codigo               //Define en la variable SKU el sku de cada ítem sin stock
           
            function estaEnA(buscaEnA){                   //Define la función con la que luego buscará ese SKU en la lista de la Maga
                return buscaEnA.Codigo === SKU
            }
    
            function estaEnB(buscaEnB){                     //Define la función con la que luego buscará ese SKU en la lista de Rio
                 return buscaEnB.Codigo === SKU
             }
             const indiceEnA = A.findIndex(estaEnA)
            const indiceEnB = B.findIndex(estaEnB)          // Busca el índice en RIO del artículo que queremos compensar
            if(indiceEnB>=0){                                 // Si lo encuentra realiza la operatoria para compensar stocks que se define a continuación 
                         if(B[indiceEnB]['Stock Disponible'] >=3 && B[indiceEnB]['Stock Disponible'] > A[indiceEnA]['Stock Disponible']){   //toma la unidad mínima (en Río) para realizar cambios, que es 3 (la unidad mínima entre las reglas establecidas)
                                                    let contProvisorioB = B[indiceEnB]['Stock Disponible']                // define un acumulador provisorio equivalente al stock inicial de ese artículo en RIO
                                                    let aSumarEnA = A[indiceEnA]['Stock Disponible']
                                                    // console.log("SKU", SKU)
                                                    // console.log(artSinStock[i].Stock);           
                                                                                    
                                                                                           // inicializa el acumulador que fija cuanto se va a sumar en MAGA
                                                    if(B[indiceEnB].Rubro == "Medias" || B[indiceEnB].Rubro == "Boxers"){   // if para separar reglas según el rubro
                                                 
                                                        for(let t = 0; contProvisorioB >= 12; t++){
                                                            aSumarEnA += 3;
                                                            contProvisorioB -= 12;
                                                     
                                                        }
                                                    } else {
                                                 
                                                        for(let t = 0; contProvisorioB >= 3; t++){
                                                            aSumarEnA += 1;
                                                            contProvisorioB -= 3;
                                                     
                                                        }
                                                    }
                                                    
                                                    
                                                        var restaOriginal = aSumarEnA - A[indiceEnA]['Stock Disponible'];  
                                                        if(restaOriginal >0){
                                                            A[indiceEnA].Stock = aSumarEnA + A[indiceEnA].Reserva;
                                                            A[indiceEnA]['Stock Disponible']= A[indiceEnA].Stock - A[indiceEnA].Reserva                                                                                 
                                                            B[indiceEnB].Stock -= restaOriginal 
                                                            B[indiceEnB]['Stock Disponible'] = B[indiceEnB].Stock - B[indiceEnB].Reserva
                                                            
                                                            
                                                            AModificados.push(A[indiceEnA])
                                                            BModificados.push(B[indiceEnB])
                                                        }
                                                  }
                                           
                         }
     
         }
        
    
    //******************** PASAR STOCK DE LA MAGA STORE (RIO1) A RIO MEJOR (RIO2)  ***********/
    const artSinStock2 = B.filter(sinStock => sinStock['Stock Disponible'] <= 6 || (sinStock['Stock Disponible']<=24 && (sinStock.Rubro == "Boxers" || sinStock.Rubro == "Medias" )))
    
    for(let i = 0; i < artSinStock2.length ; i++){  //
       
       const SKU2 = artSinStock2[i].Codigo
       
       function estaEnA(buscaEnA){
           return buscaEnA.Codigo === SKU2
       }
    
       function estaEnB(buscaEnB){
            return buscaEnB.Codigo === SKU2
        }
        
        function estaEnAModificados(buscaEnAModificados){
            return buscaEnAModificados.Codigo === SKU2
        }

        function estaEnBModificados(buscaEnBModificados){
            return buscaEnBModificados.Codigo === SKU2
        }

        const indiceEnAModificados = AModificados.findIndex(estaEnAModificados)
        // console.log("🚀 ~ file: mainController.js:111 ~ indiceEnAModificados", indiceEnAModificados)
        
        const indiceEnBModificados = BModificados.findIndex(estaEnBModificados)


        const indiceEnB = B.findIndex(estaEnB)
       const indiceEnA = A.findIndex(estaEnA)
       if(indiceEnA>=0){
                    if(A[indiceEnA]['Stock Disponible'] >= 3 && A[indiceEnA]['Stock Disponible'] >  B[indiceEnB]['Stock Disponible']){ 
                                                let contProvisorioA = A[indiceEnA]['Stock Disponible']   
                                                        //  console.log("🚀 ~ file: mainController.js:103 ~ contProvisorioA", contProvisorioA)
                                                          // define un acumulador provisorio equivalente al stock inicial de ese artículo en RIO
                                                let aSumarEnB = B[indiceEnB]['Stock Disponible']                               // inicializa el acumulador que fija cuanto se va a sumar en MAGA
                                                //console.log("🚀 ~ file: mainController.js:106 ~ aSumarEnB", aSumarEnB)
                                                
                                               
                                                if(A[indiceEnA].Rubro == "Medias" || A[indiceEnA].Rubro == "Boxers"){   // if para separar reglas según el rubro
    
                                                    for(let t = 0; contProvisorioA >= 12; t++){
                                                        aSumarEnB += 3;
                                                        //console.log("🚀 ~ file: mainController.js:110 ~ aSumarEnB", aSumarEnB)
                                                        contProvisorioA -= 12;
                                                        //console.log("🚀 ~ file: mainController.js:112 ~ contProvisorioA", contProvisorioA)
    
                                                    }
                                                } else {
    
                                                    for(let t = 0; contProvisorioA >= 3; t++){
                                                        aSumarEnB += 1;
                                                        //console.log("🚀 ~ file: mainController.js:119 ~ aSumarEnB", aSumarEnB)
                                                        contProvisorioA -= 3;
                                                        //console.log("🚀 ~ file: mainController.js:121 ~ contProvisorioA", contProvisorioA)
    
                                                    }
                                                }
                                                
                                                    
                                                var restaOriginal2 = aSumarEnB - B[indiceEnB]['Stock Disponible'];  

                                                if(restaOriginal2 > 0){  // Esto es para evitar que sin son medias o boxer y no hubo modificacion (por cantidades insuficientes) no invierta RIO y LMS
                                                        // console.log("🚀 ~ file: mainController.js:124 ~ restaOriginal2", restaOriginal2)
                                                        // console.log("🚀 ~ file: mainController.js:124 ~ B[indiceEnB]['Stock Disponible']", B[indiceEnB]['Stock Disponible'])
                                                        // console.log("🚀 ~ file: mainController.js:124 ~ aSumarEnB", aSumarEnB)
                                                        // console.log("🚀 ~ file: mainController.js:119 ~ aSumarEnB antes", aSumarEnB)
                                                        B[indiceEnB].Stock = aSumarEnB //+ B[indiceEnB].Stock  //Reserva
                                                        //  console.log("🚀 ~ file: mainController.js:129 ~  B[indiceEnB].Stock despues",  B[indiceEnB].Stock)
                                                        // console.log("🚀 ~ file: mainController.js:129 ~ B[indiceEnB].Reserva", B[indiceEnB].Reserva)
                                                        // console.log("🚀 ~ file: mainController.js:129 ~ aSumarEnB", aSumarEnB)
                                                        A[indiceEnA].Stock -= restaOriginal2
                                                        // console.log("🚀 ~ file: mainController.js:133 ~ A[indiceEnA].Stock", A[indiceEnA].Stock)
                                                        // console.log("🚀 ~ file: mainController.js:128 ~  A[indiceEnA].Stock -= restaOriginal2",  A[indiceEnA].Stock -= restaOriginal2)
                                                        //console.log("A[indiceEnA].Stock operado sin revertir", A[indiceEnA].Stock)
                                                        //console.log("B[indiceEnB].Stock operado sin revertir", B[indiceEnB].Stock)
                                                        if(A[indiceEnA].Stock > B[indiceEnB].Stock){ ///////////////////////////////////////////
                                                        Acumulador = A[indiceEnA].Stock - A[indiceEnA].Reserva
                                                        // console.log("🚀 ~ file: mainController.js:138 ~ Acumulador", Acumulador)
                                                        // console.log("🚀 ~ file: mainController.js:138 ~ A[indiceEnA].Reserva", A[indiceEnA].Reserva)
                                                        // console.log("🚀 ~ file: mainController.js:138 ~ A[indiceEnA].Stock", A[indiceEnA].Stock)
                                                        A[indiceEnA].Stock = B[indiceEnB].Stock + A[indiceEnA].Reserva
                                                        
                                                        B[indiceEnB].Stock = Acumulador + B[indiceEnB].Reserva
                                                        } else {                                                            //////////////
                                                           B[indiceEnB].Stock = B[indiceEnB].Stock + B[indiceEnB].Reserva   ///////////////
                                                        }   //                                                              ////////////
                                                        
                                                        if (indiceEnAModificados == -1){
                                                            AModificados.push(A[indiceEnA])
                                                        } else {
                                                            AModificados[indiceEnAModificados].Stock =  A[indiceEnA].Stock
                                                        }
                                                    
                                                        if (indiceEnBModificados == -1){
                                                            BModificados.push(B[indiceEnB])
                                                        } else {
                                                            BModificados[indiceEnBModificados].Stock =  B[indiceEnB].Stock
                                                        }

                                                }
                                                
                                                //console.log("################################")
                                             }
                    }
       
     }
     
    //  console.log("AModificados", AModificados)
        let RIOMEJOR = JSON.stringify(B)
        
        let LAMAGASTORE = JSON.stringify(A)
        fs.writeFileSync("RioMejor.json", RIOMEJOR, 'utf-8')
        fs.writeFileSync("LaMagaStore.json", LAMAGASTORE, 'utf-8') 
    /////////////////////////////////////////////////////////// CREACIÓN JSON CON FORMATO DE TEMPLATE RIO
     
    const Rio  = BModificados.map(producto => ({  //En esta línea se define qué objeto literal (BModificados) va a estar en la salida.
        "Nombre" : producto.Nombre,
        "Codigo" : producto.Codigo,
        "descripcion" : producto.Nombre,
        "Stock" : producto.Stock,
        "StockMinimo" : "" ,
        "PrecioUnitario" : producto["Precio Final"].toString().replace(".",","),
        "Observaciones" : "" ,
        "Rentabilidad" : "",
        "Iva": producto.Iva,
        "CostoInterno" : producto["Costo Interno"].toString().replace(".",","),
        "CodigoProveedor" : "",
        "Deposito": producto.Deposito,
        "CodigoBarra" : "",
        "Rubro" : producto.Rubro,
        "SubRubro": producto["Sub Rubro"],
        "Tipo" : "" ,
        "PrecioAutomatico": "" 

    }))
    
    const csvWriterRio = createCsvWriter({
        fieldDelimiter : ';',
        path: './excel/CSV-RIO-Template.csv',
        header: [
            {id: 'Nombre', title: 'Nombre'},
            {id: 'Codigo', title: 'Codigo'},
            {id: 'descripcion', title: 'descripcion'},
            {id: 'Stock', title: 'Stock'},
            {id: 'StockMinimo', title: 'StockMinimo'},
            {id: 'PrecioUnitario', title: 'PrecioUnitario'},
            {id: 'Observaciones', title: 'Observaciones'},
            {id: 'Rentabilidad', title: 'Rentabilidad'},
            {id: 'Iva', title: 'Iva'},
            {id: 'CostoInterno', title: 'CostoInterno'},
            {id: 'CodigoProveedor', title: 'CodigoProveedor'},
            {id: 'Deposito', title: 'Deposito'},
            {id: 'CodigoBarra', title: 'CodigoBarra'},
            {id: 'Rubro', title: 'Rubro'},
            {id: 'SubRubro', title: 'SubRubro'},
            {id: 'Tipo', title: 'Tipo'},
            {id: 'PrecioAutomatico', title: 'PrecioAutomatico'},
                        
        ]
    });
         
    csvWriterRio.writeRecords(Rio)       // returns a promise
        .then(() => {
            console.log('..... 🚀 CSV de RIO MEJOR CREADO .....');
            
        });
    
        /////////////////////////////////////////////////////////// CREACIÓN JSON CON FORMATO DE TEMPLATE LA MAGA
    
    
    const LMS  = AModificados.map(producto => ({ //Aquí se define qué objeto (AModificados) va a estar en la salida.
        "Nombre" : producto.Nombre,
        "Codigo" : producto.Codigo,
        "descripcion" : producto.Nombre,
        "Stock" : producto.Stock,
        "StockMinimo" : "" ,
        
        "PrecioUnitario" : producto["Precio Final"].toString().replace(".",","),
        "Observaciones" : "" ,
        "Rentabilidad" : "",
        "Iva": producto.Iva,
        "CostoInterno" : producto["Costo Interno"].toString().replace(".",","),
        "CodigoProveedor" : "",
        "Deposito": producto.Deposito,
        "CodigoBarra" : "",
        "Rubro" : producto.Rubro,
        "SubRubro": producto["Sub Rubro"],
        "Tipo" : "",
        "PrecioAutomatico": "" 

    }))
    
    const csvWriterLMS = createCsvWriter({
        fieldDelimiter : ';',
        
        path: './excel/CSV-LAMAGA-Template.csv',
        header: [
            {id: 'Nombre', title: 'Nombre'},
            {id: 'Codigo', title: 'Codigo'},
            {id: 'descripcion', title: 'descripcion'},
            {id: 'Stock', title: 'Stock'},
            {id: 'StockMinimo', title: 'StockMinimo'},
            {id: 'PrecioUnitario', title: 'PrecioUnitario'},

            {id: 'Observaciones', title: 'Observaciones'},
            {id: 'Rentabilidad', title: 'Rentabilidad'},
            {id: 'Iva', title: 'Iva'},
            {id: 'CostoInterno', title: 'CostoInterno'},
            {id: 'CodigoProveedor', title: 'CodigoProveedor'},
            {id: 'Deposito', title: 'Deposito'},
            {id: 'CodigoBarra', title: 'CodigoBarra'},
            {id: 'Rubro', title: 'Rubro'},
            {id: 'SubRubro', title: 'SubRubro'},
            {id: 'Tipo', title: 'Tipo'},
            {id: 'PrecioAutomatico', title: 'PrecioAutomatico'},
                        
        ]
    });
    
     
    csvWriterLMS.writeRecords(LMS)       // returns a promise
        .then(() => {
            console.log('..... 🚀 CSV de LA MAGA STORE CREADO .....');
            
        });
    


      
    /////////////////////////////////////////////////////////// CREACIÓN EXCEL ACTUALIZADO DE LA MAGA
        var magaTemplate = new xl.Workbook() // creo Libro de Trabajo
        var ws = magaTemplate.addWorksheet('MAGA-TEMPLATE')
        var style = magaTemplate.createStyle({
            font : {
                color : '#040404',
                size : 12,
            }
        })
        
    
        ws.cell(1,1).string("Nombre").style(style)
        ws.cell(1,2).string("Codigo").style(style)
        ws.cell(1,3).string("descripcion").style(style)
        ws.cell(1,4).string("Stock").style(style)
        ws.cell(1,5).string("StockMinimo").style(style)
        ws.cell(1,6).string("PrecioUnitario").style(style)
        ws.cell(1,7).string("Observaciones").style(style)
        ws.cell(1,8).string("Rentabilidad").style(style)
        ws.cell(1,9).string("Iva").style(style)
        ws.cell(1,10).string("CostoInterno").style(style)
        ws.cell(1,11).string("CodigoProveedor").style(style)
        ws.cell(1,12).string("Deposito").style(style)
        ws.cell(1,13).string("CodigoBarra").style(style)
        ws.cell(1,14).string("Rubro").style(style)
        ws.cell(1,15).string("SubRubro").style(style)
        ws.cell(1,16).string("Tipo").style(style)
        ws.cell(1,17).string("PrecioAutomatico").style(style)
    
        
        for(i=0; i<AModificados.length; i++){                   // Carga todos los datos de los objetos de AModificados en el excel
            ws.cell(2+i,1).string(AModificados[i].Nombre).style(style)
            ws.cell(2+i,2).string(AModificados[i].Codigo).style(style)
            ws.cell(2+i,3).string(AModificados[i].Nombre).style(style)
            ws.cell(2+i,4).number(AModificados[i].Stock).style(style)
            // ws.cell(2+i,5).number(A[i]['Stock Minimo']).style(style)
            ws.cell(2+i,6).number(AModificados[i]['Precio Final']).style(style)
            // ws.cell(2+i,7).string("Observaciones").style(style)
            // ws.cell(2+i,8).string("Rentabilidad").style(style)
            ws.cell(2+i,9).number(AModificados[i].Iva).style(style)
            ws.cell(2+i,10).number(AModificados[i]['Costo Interno']).style(style)
            //ws.cell(2+i,11).string("CodigoProveedor").style(style)
            ws.cell(2+i,12).string(AModificados[i].Deposito).style(style)
            // ws.cell(2+i,13).string("CodigoBarra").style(style)
            ws.cell(2+i,14).string(AModificados[i].Rubro).style(style)
            ws.cell(2+i,15).string(AModificados[i]['Sub Rubro']).style(style)
            // ws.cell(2+i,16).string("PrecioAutomatico").style(style)
        }
    
        console.log("excel de LA MAGA creado y actualizado!")
    
        const pathExcel = path.join(__dirname, '../excel', 'EXCEL-LAMAGA-Template.xlsx')
        magaTemplate.write(pathExcel,function(err,stats){
            if(err){
                console.error(err);
            } else {
                
                return false;
            }
        })
    
        /////////////////////////////////////////////////////////// CREACIÓN EXCEL ACTUALIZADO DE RIO MEJOR
       


        var rioTemplate = new xl.Workbook() // creo Libro de Trabajo
        var ws = rioTemplate.addWorksheet('RIO-TEMPLATE')
        var style = rioTemplate.createStyle({
            font : {
                color : '#040404',
                size : 12,
            }
        })
        
    
        ws.cell(1,1).string("Nombre").style(style)
        ws.cell(1,2).string("Codigo").style(style)
        ws.cell(1,3).string("descripcion").style(style)
        ws.cell(1,4).string("Stock").style(style)
        ws.cell(1,5).string("StockMinimo").style(style)
        ws.cell(1,6).string("PrecioUnitario").style(style)
        ws.cell(1,7).string("Observaciones").style(style)
        ws.cell(1,8).string("Rentabilidad").style(style)
        ws.cell(1,9).string("Iva").style(style)
        ws.cell(1,10).string("CostoInterno").style(style)
        ws.cell(1,11).string("CodigoProveedor").style(style)
        ws.cell(1,12).string("Deposito").style(style)
        ws.cell(1,13).string("CodigoBarra").style(style)
        ws.cell(1,14).string("Rubro").style(style)
        ws.cell(1,15).string("SubRubro").style(style)
        ws.cell(1,16).string("Tipo").style(style)
        ws.cell(1,17).string("PrecioAutomatico").style(style)
       
        for(i=0; i<BModificados.length; i++){
            ws.cell(2+i,1).string(BModificados[i].Nombre).style(style)
            ws.cell(2+i,2).string(BModificados[i].Codigo).style(style)
            ws.cell(2+i,3).string(BModificados[i].Nombre).style(style)
            ws.cell(2+i,4).number(BModificados[i].Stock).style(style)
            // ws.cell(2+i,5).number(A[i]['Stock Minimo']).style(style)
            ws.cell(2+i,6).number(BModificados[i]['Precio Final']).style(style)
            // ws.cell(2+i,7).string("Observaciones").style(style)
            // ws.cell(2+i,8).string("Rentabilidad").style(style)
            ws.cell(2+i,9).number(BModificados[i].Iva).style(style)
            ws.cell(2+i,10).number(BModificados[i]['Costo Interno']).style(style)
            //ws.cell(2+i,11).string("CodigoProveedor").style(style)
            ws.cell(2+i,12).string(BModificados[i].Deposito).style(style)
            // ws.cell(2+i,13).string("CodigoBarra").style(style)
            ws.cell(2+i,14).string(BModificados[i].Rubro).style(style)
            ws.cell(2+i,15).string(BModificados[i]['Sub Rubro']).style(style)
            // ws.cell(2+i,16).string("PrecioAutomatico").style(style)
        }
    
        console.log("excel de RIO MEJOR creado y actualizado!")
    
        const pathExcel2 = path.join(__dirname,  '../excel', 'EXCEL-RIO-Template.xlsx')
        rioTemplate.write(pathExcel2,function(err,stats){
            if(err){
                console.error(err);
            } else {
                
                return false;
            }
        })
     
        var archivo1 = req.files[0].originalname
        var archivo2 = req.files[1].originalname
        // 
        res.render('archivosSubidos', {archivo1, archivo2} )
    }

    
}


module.exports = mainController;
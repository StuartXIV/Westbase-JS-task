const express = require('express');
const fs = require('fs');
const fetch = require('node-fetch');
const app = express();
app.listen(3002, () => console.log('Creating new JSON file'));

// RETRIEVE EXCHANGE RATE
async function getEXR(){
    const response = await fetch("https://freecurrencyapi.net/api/v2/latest?apikey=12b940d0-5391-11ec-9874-1b3d2e04c5d6&base_currency=USD");
    const data = await response.json();
    const exr = data['data'].GBP;
    getData(exr);
}


// GET JSON DATA from JSON FILE
async function getData(exr){
    const rawdata = await fs.readFileSync('json/JSON Item Data.json');
    const data = await JSON.parse(rawdata);
    convertToGBP(data, exr); 
}


// UPDATE DATA
function convertToGBP(data, exr){
    data.forEach(transaction => {
        transaction.items.forEach(item => {

            // Convert to GBP - Rename Object Keys
            if (item.purchasepriceUSD){                
                item.purchasepriceUSD *= exr;
                item.purchasepriceUSD = item.purchasepriceUSD.toFixed(0);
                item['purchasepriceGBP'] = item['purchasepriceUSD'];
                delete item['purchasepriceUSD'];
            }
            
            if (item.salepriceUSD){                
                item.salepriceUSD *= exr;
                item.salepriceUSD = item.salepriceUSD.toFixed(0);
                item['salepriceGBP'] = item['salepriceUSD'];
                delete item['salepriceUSD'];
            }

            // Calculate margin
            item['margin'] = percentage(item['salepriceGBP'] - item['purchasepriceGBP'], item['salepriceGBP']) + "%";

            //Calculate total
            item['totalGBP'] = item['salepriceGBP'] * item['qty'];

        })

        // Create new single transaction
        if (transaction.transactionid > 1){
            transaction.items.forEach(item => {                
                data[0].items.push(item);
            })
        }

    });
    
    // Remove transactions
    for (let i = 0; i < data.length; i++){
        if (i > 0){
            data.pop(data[i])
        }
    }

      fs.writeFileSync('json/New JSON Item Data.json', JSON.stringify(data, undefined, 4));
      console.log('New JSON file created in /json');
}





// PERCENTAGE CALCULATOR
function percentage(partialValue, totalValue) {
    let value = (100 * partialValue) / totalValue
    return value.toFixed(0);
 }

// FUNCTION CALL
getEXR();


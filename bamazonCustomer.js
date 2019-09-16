var keys = require('./keys.js');
var mysql = require('mysql');
var connection = mysql.createConnection(keys.data);
var inquirer = require('inquirer');
require("dotenv").config();

function validateInput(value) {
    var integer = Number.isInteger(parseFloat(value));
    var sign = Math.sign(value);
    if (integer && (sign==1)) {
        return true;
    }else {
        return 'Please enter a non-zero whole number';
    }
}

function promptUserPurchase() {
    inquirer
    .prompt([
        {
            type: 'input',
            name: 'item_id',
            message: 'Please enter the item ID you would like to purchase',
            validate: validateInput,
            filter: Number
        },
        {
            type: 'input',
            name: 'quantity',
            message: 'How many do you need',
            validate: validateInput,
            filter: Number
        }
    ]).then(function(input) {
        var item = input.item_id,
        var quantity = input.quantity;
        var queryStr = 'SELECT * FROM products WHERE ?'
        connection.query(queryStr,{item_id: item}, function(error,data) {
            if (error) throw error;
            if (data.length == 0) {
                console.log('ERROR: Invalid Item id. Please select a valid Item id');
                displayInventory();
            }else {
                var productionData = data[0];
                if (quantity <= productionData.stock_quantity) {
                    console.log('Purchase completed! The product you request is in stock and preparing your order');
                    var updatedQueryStr = 'UPDATE products SET stock_quantity = ' + (productionData.stock_quantity - quantity) + 'WHERE item_id = ' + item;
                    connection.query(updatedQueryStr,function(err,data) {
                        if (err) throw err;
                        console.log('Your order has been placed! Your total is ' + productionData.price * quantity);
                        console.log('thank you for shopping with us');
                        console.log("\n---------------------------------------------------------------------\n");
                        connection.end();
                    })
                } else {
                    console.log('Sorry, there is not enough product in stock, your order can not be placed as is.');
					console.log('Please modify your order.');
					console.log("\n---------------------------------------------------------------------\n");

					displayInventory();
                }
            }
        })
    })
}

function displayInventory() {
    queryStr = 'SELECT * FROM products';
    connection.query(queryStr,function(err,data) {
        if (err) throw err;
        console.log('Existing Inventory: ');
        console.log('...................\n');
        var strOut = '';
        for(var i = 0; i < data.length; i++) {
            strOut = '';
            strOut += 'Item Id: ' + data[i].item_id;
            strOut += 'Product Name: ' + data[i].product_name;
            strOut += 'Department Name:' + data[i].department_name;
            strOut += 'Price: $ ' + data[i].price + '\n';

            console.log(strOut);
        }
        console.log("---------------------------------------------------------------------\n");
        promptUserPurchase();
    })
}

function runBamazon() {
    displayInventory();
}
runBamazon();
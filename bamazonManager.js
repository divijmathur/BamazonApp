// var keys = require('./keys.js');
var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'password',
    database: 'bamazon_db'
});
var inquirer = require('inquirer');
// require("dotenv").config();
var Table = require('cli-table');

connection.connect(function (err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    startPrompt();
});

function startPrompt() {

    inquirer.prompt([{

        type: "list",
        name: "actionList",
        message: "Welcome Manager. What would you like to review?",
        choices: ["View Products For Sale", "View Low Inventory", "Add To Inventory", "Add New Product"]

    }]).then(function (user) {
        if (user.actionList === "View Products For Sale") {
            inventoryView();
        } else if (user.actionList === "View Low Inventory") {
            lowInventory();
        } else if (user.actionList === "Add To Inventory") {
            addInventory();
        } else {
            addProduct();
        }
    });
}

function inventoryView() {

    // instantiate
    var table = new Table({
        head: ['ID', 'Item', 'Department', 'Price', 'Stock'],
        colWidths: [10, 30, 30, 30, 30]
    });

    listInventory();

    // table is an Array, so you can `push`, `unshift`, `splice` and friends
    function listInventory() {

        //Variable creation from DB connection

        connection.query("SELECT * FROM products", function (err, res) {
            for (var i = 0; i < res.length; i++) {

                var itemId = res[i].item_id,
                    productName = res[i].product_name,
                    departmentName = res[i].department_name,
                    price = res[i].price,
                    stockQuantity = res[i].stock_quantity;

                table.push(
                    [itemId, productName, departmentName, price, stockQuantity]
                );
            }
            console.log("");
            console.log("====================================================== Current Bamazon Inventory ======================================================");
            console.log("");
            console.log(table.toString());
            console.log("");
            startPrompt();
        });
    }
}

function lowInventory() {
    // instantiate
    var table = new Table({
        head: ['ID', 'Item', 'Department', 'Price', 'Stock'],
        colWidths: [10, 30, 30, 30, 30]
    });

    listLowInventory();

    // table is an Array, so you can `push`, `unshift`, `splice` and friends
    function listLowInventory() {

        connection.query("SELECT * FROM products", function (err, res) {
            for (var i = 0; i < res.length; i++) {

                //check if any of the stock_quantity equals 5 or less

                if (res[i].stock_quantity <= 5) {

                    var itemId = res[i].item_id,
                        productName = res[i].product_name,
                        departmentName = res[i].department_name,
                        price = res[i].price,
                        stockQuantity = res[i].stock_quantity;

                    table.push(
                        [itemId, productName, departmentName, price, stockQuantity]
                    );
                }
            }
            console.log("");
            console.log("============================================= Low Bamazon Inventory (5 or Less in Stock) ===============================================");
            console.log("");
            console.log(table.toString());
            console.log("");
            startPrompt();
        });
    }
}

function addInventory() {

    inquirer.prompt([{

        type: "input",
        name: "inputId",
        message: "Please enter the ID number of the item you would like to add inventory to.",
    },
    {
        type: "input",
        name: "inputNumber",
        message: "How many units of this item would you like to have in the in-store stock quantity?",

    }
    ]).then(function (managerAdd) {

        connection.query("UPDATE products SET ? WHERE ?", [{

            stock_quantity: managerAdd.inputNumber
        }, {
            item_id: managerAdd.inputId
        }], function (err, res) {
        });
        startPrompt();
    });
}
function addProduct() {

    //ask user to fill in all necessary information to fill columns in table

    inquirer.prompt([{

        type: "input",
        name: "inputName",
        message: "Please enter the item name of the new product.",
    },
    {
        type: "input",
        name: "inputDepartment",
        message: "Please enter which department name of which the new product belongs.",
    },
    {
        type: "input",
        name: "inputPrice",
        message: "Please enter the price of the new product (0.00).",
    },
    {
        type: "input",
        name: "inputStock",
        message: "Please enter the stock quantity of the new product.",
    }

    ]).then(function (managerNew) {

        //connect to database, insert column data with input from user

        connection.query("INSERT INTO products SET ?", {
            product_name: managerNew.inputName,
            department_name: managerNew.inputDepartment,
            price: managerNew.inputPrice,
            stock_quantity: managerNew.inputStock
        }, function (err, res) { });
        startPrompt();
    });
}
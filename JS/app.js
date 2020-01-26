// Data controller
var dataController = (function() {

    var Product = function(id, name, quantity, price) {
        this.id = id;
        this.name = name;
        this.quantity = quantity;
        this.price = price;
    }

    Product.prototype.calcTotal = function() {
        return this.quantity * this.price;
    }

    var data = {
        products: [],
        totals: {
            quantity: 0,
            price: 0
        }
    }

    return {
        addProduct: function(name, quantity, price) {
            var id, newProduct;

            // 1. Get the id to be added to the new product
            if (data.products.length === 0) {
                id = 1;
            } else {
                id = data.products[data.products.length - 1].id + 1;
            }

            // 2. Create the product item
            newProduct = new Product(id, name, quantity, price);

            // 3. Add the new product to the products array
            data.products.push(newProduct);

            // 4. Return the new product to add to UI
            return newProduct;

        },

        removeProduct: function(id) {
            var ids, pos;

            // 1. Loop through products and create a new array with their ids
            ids = data.products.map(function(current){
                return current.id;
            });

            // 2. Find the item in the array with id
            pos = ids.indexOf(parseInt(id));

            if (pos !== -1){
                // 3. Remove item from array
                data.products.splice(pos, 1);
   
            }
        },

        calculateTotals: function() {
            var sum, items;

            sum = 0;
            items = 0;

            // 1. Iterate throughts the products list and get the add the price from each to sum
            data.products.forEach(function(current) {
                sum += (current.quantity * current.price);
                items += current.quantity;
            });

            // 2. Update data objects price and items quantity
            data.totals.price = sum;
            data.totals.quantity = items;
        },

        getTotals: function() {
            return {
                quantity: data.totals.quantity,
                price: data.totals.price
            }
        }
    }

})();

// UI controller
var UIcontroller = (function() {

    // List of classes to use from the DOM
    var DOMstrings = {
        inputName: '.input-name',
        inputQuantity: '.input-quantity',
        inputPrice: '.input-price',
        inputBtn: '.add-item',
        productsList: '.products-list',
        totalQuantity: '.total-quantity',
        totalPrice: '.total-price'
    }

    var formatNum = function(num) {
        var numSplit, int, decimal;


        // 1. Get the abs value
        num = Math.abs(num);

        // 2. Convert to have 2 decimals
        num = num.toFixed(2);

        numSplit = num.split(".");
        int = numSplit[0];
        decimal = numSplit[1];

        return "£" + parseInt(int).toLocaleString() + "." + decimal;

    }

    // Return public functions
    return {
        getDOMstrings: function() {
            return DOMstrings;
        },

        getInput: function() {
            return {
                name: document.querySelector(DOMstrings.inputName).value,
                quantity: parseInt(document.querySelector(DOMstrings.inputQuantity).value),
                price: parseFloat(document.querySelector(DOMstrings.inputPrice).value)
            }
        },

        clearInputFields: function() {
            var inputs;

            // 1. Get all inputs
            inputs = document.querySelectorAll(DOMstrings.inputName + ", " + DOMstrings.inputQuantity + ", " + DOMstrings.inputPrice);

            // 2. Iterate through and set as empty
            for (var i = 0; i < inputs.length; i ++) {
                inputs[i].value = "";
            }

            inputs[0].focus();
        },

        addItem: function(obj) {
            var html, cellName, cellQuantity, cellPrice, cellActions;

            // // 1. Add item to the DOM
            // html = '<div class="item" id="%id%"> <div class="product-name">%name%</div> <div class="product-quantity">%quantity%</div> <div class="product-price">%price%</div><div class="product-delete"><button><ion-icon name="trash"></ion-icon></button></div> </div>';

            // // 2. Replace the values in the html##
            // htmlNew = html.replace("%id%", obj.id);
            // htmlNew = htmlNew.replace("%name%", obj.name);
            // htmlNew = htmlNew.replace("%quantity%", obj.quantity);
            // htmlNew = htmlNew.replace("%price%", obj.price);

            // // 3. Insert the html into the DOM
            // document.querySelector(DOMstrings.productsList).insertAdjacentHTML("beforeend", htmlNew);

            // 1. Table
            var table = document.querySelector("table tbody");

            // 2. Row
            var row = table.insertRow(obj.id - 1);

            // 3. Add class and id to the row item
            row.classList.add("item");
            row.id = obj.id;

            // 4. Insert the cells
            cellName = row.insertCell(0);
            cellQuantity = row.insertCell(1);
            cellPrice = row.insertCell(2);
            cellTotal = row.insertCell(3);
            cellActions = row.insertCell(4);

            // 5. Enter the values for the cells
            cellName.innerHTML = obj.name;
            cellQuantity.innerHTML = obj.quantity;
            cellPrice.innerHTML = formatNum(obj.price);
            cellTotal.innerHTML = formatNum(obj.calcTotal());
            cellActions.innerHTML = "<button><ion-icon name='trash'></ion-icon></button>";
        },

        deleteItem: function(id) {
            var element;

            // 1. Get the element 
            element = document.getElementById(id);

            // 2. Remove the element 
            element.parentNode.removeChild(element);
        },

        updateTotals: function(obj) {
            
            // 1. Update the title quantity label
            document.querySelector(DOMstrings.totalQuantity).textContent = obj.quantity;

            // 2. Update the title price label
            document.querySelector(DOMstrings.totalPrice).textContent = formatNum(obj.price);          
        }
    }

})();

// Main controller
var mainController = (function(dataCtrl, UIctrl) {

    // Get the dom strings from the UI controller
    var DOMstrings = UIctrl.getDOMstrings();

    // Setup the event listeners
    var setupEvents = function() {
        document.querySelector(DOMstrings.inputBtn).addEventListener('click', ctrlAddProduct);

        document.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                ctrlAddProduct();
            }
        });

        document.querySelector(DOMstrings.productsList).addEventListener('click', ctrlDeleteProduct);
    };

    var ctrlAddProduct = function() {
        var inputObj, newProduct;

        // 1. Get the input that you wish to add
        inputObj = UIctrl.getInput();

        // Check if all values are input
        if (inputObj !== "" && (!isNaN(inputObj.quantity)) && (!isNaN(inputObj.price) && inputObj.price > 0)) {

            // 2. Add the input to the data
            newProduct = dataCtrl.addProduct(inputObj.name, inputObj.quantity, inputObj.price);

            // 3. Add the input to the UI
            UIctrl.addItem(newProduct);

            // 4. Calculate the total items and prices
            dataCtrl.calculateTotals();

            // 5. Update totals
            updateTotals();

            // 6. Clear inputs
            UIctrl.clearInputFields();
        }        
    }

    var ctrlDeleteProduct = function(event) {
        var itemID;

        // 1. Check item has ID
        itemID = event.target.parentNode.parentNode.parentNode.id;

        // If has an ID
        if (itemID) {

            // 2. Delete item from data
            dataCtrl.removeProduct(itemID);

            // 3. Delete item from UI
            UIctrl.deleteItem(itemID);

            // 4. Calculate totals
            dataCtrl.calculateTotals();

            // 5. Update
            updateTotals();
        }
    }

    var updateTotals = function() {
        var data;

        // 1. Get the data totals
        data = dataCtrl.getTotals();

        // 2. Update the UI with the data totals
        UIctrl.updateTotals(data);
    }

    return {
        init: function(){
            console.log("App started.");

            setupEvents();
        }
    }

})(dataController, UIcontroller);

mainController.init();
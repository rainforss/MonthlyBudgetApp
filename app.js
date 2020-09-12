const budgetController = (() => {
  class Expense {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
  }

  class Income {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
  }

  const calculateTotal = (type) => {
    data.totals[type] = data.allItems[type].reduce(
      (acc, obj) => acc + obj.value,
      0
    );
  };

  let data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      exp: 0,
      inc: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    addItem: (type, description, value) => {
      let newItem, ID;

      //Create new unique ID
      ID = data.allItems[type][data.allItems[type].length - 1]
        ? data.allItems[type][data.allItems[type].length - 1].id + 1
        : 0;

      //Instantiate new item based on type
      if (type === "exp") {
        newItem = new Expense(ID, description, value);
      }
      if (type === "inc") {
        newItem = new Income(ID, description, value);
      }

      //Add new item to data
      data.allItems[type].push(newItem);
      console.log(data.allItems);

      return newItem;
    },
    calculateBudget: () => {
      //Calculate total income and expense
      calculateTotal("exp");
      calculateTotal("inc");
      //Calculate the budget: income - expense
      data.budget = data.totals.inc - data.totals.exp;
      //Calculate the percentage of income that was spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },
    getBudget: () => {
      return {
        budget: data.budget,
        percentage: data.percentage,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
      };
    },
  };
})();

const UIController = (() => {
  let DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeList: ".income__list",
    expenseList: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
  };

  return {
    getInput: () => {
      return {
        type: document.querySelector(DOMstrings.inputType).value,
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },

    addListItem: (obj, type) => {
      let html;
      if (type === "exp") {
        html = `
          <div class="item clearfix" id="expense-${obj.id}">
            <div class="item__description">${obj.description}</div>
            <div class="right clearfix">
                <div class="item__value">- ${obj.value}</div>
                <div class="item__percentage">21%</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>
          `;
        document
          .querySelector(DOMstrings.expenseList)
          .insertAdjacentHTML("beforeend", html);
      } else if (type === "inc") {
        html = `
            <div class="item clearfix" id="income-${obj.id}">
                <div class="item__description">${obj.description}</div>
                    <div class="right clearfix">
                    <div class="item__value">+ ${obj.value}</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
            </div>
        `;
        document
          .querySelector(DOMstrings.incomeList)
          .insertAdjacentHTML("beforeend", html);
      }
    },

    clearFields: () => {
      const fields = document.querySelectorAll(
        DOMstrings.inputDescription + ", " + DOMstrings.inputValue
      );
      const fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach((element) => (element.value = ""));
      fieldsArr[0].focus();
    },

    displayBudget: (obj) => {
      document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMstrings.expensesLabel).textContent =
        obj.totalExp;

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage;
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },

    getDOMstrings: () => {
      return DOMstrings;
    },
  };
})();

const controller = ((budgetCtrl, UICtrl) => {
  const listenersSetup = () => {
    const DOM = UICtrl.getDOMstrings();
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", (e) => {
      if (e.keyCode === 13 || e.key === "Enter" || e.which === 13) {
        ctrlAddItem();
      }
    });
  };

  const ctrlAddItem = () => {
    //Get the input data from UI
    const { type, description, value } = UIController.getInput();

    if (description !== "" && !isNaN(value) && value > 0) {
      //Add the item to budget controller
      const newItem = budgetCtrl.addItem(type, description, value);

      //Add the item to UI
      UICtrl.addListItem(newItem, type);

      //Clear the input fields upon adding
      UICtrl.clearFields();

      //Calculate and update budget
      updateBudget();
    }
  };

  const updateBudget = () => {
    //Calculate the budget
    budgetCtrl.calculateBudget();
    //Return the budget
    const budgetInfo = budgetCtrl.getBudget();
    console.log(budgetInfo);
    //Display the budget on UI
    UICtrl.displayBudget(budgetInfo);
  };

  return {
    init: () => {
      UICtrl.displayBudget({
        budget: 0,
        percentage: -1,
        totalInc: 0,
        totalExp: 0,
      });
      listenersSetup();
    },
  };
})(budgetController, UIController);

controller.init();

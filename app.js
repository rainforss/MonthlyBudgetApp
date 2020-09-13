const budgetController = (() => {
  class Expense {
    constructor(id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
    }
    percentage = -1;
    calculatePercentage = (totalIncome) => {
      if (totalIncome > 0) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
      } else {
        this.percentage = -1;
      }
    };
    get getPercentage() {
      return this.percentage;
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

      return newItem;
    },

    deleteItem: (type, id) => {
      const deleteIndex = data.allItems[type].findIndex(
        (item) => item.id === id
      );
      data.allItems[type].splice(deleteIndex, 1);
      console.log(data.allItems);
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

    calculatePercentages: () => {
      data.allItems.exp.forEach((current) =>
        current.calculatePercentage(data.totals.inc)
      );
    },

    getPercentages: () => {
      const allPercentages = data.allItems.exp.map(
        (current) => current.getPercentage
      );
      return allPercentages;
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
    container: ".container",
    expensePercentageLabel: ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  const nodeListForEach = (list, callback) => {
    for (i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  const formatNumber = (num, type) => {
    num = Math.abs(num);
    num = num.toFixed(2);
    var [int, decimal] = num.split(".");
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
    }
    return (type === "exp" ? "-" : "+") + " " + int + "." + decimal;
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
          <div class="item clearfix" id="exp-${obj.id}">
            <div class="item__description">${obj.description}</div>
            <div class="right clearfix">
                <div class="item__value">${formatNumber(obj.value, type)}</div>
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
            <div class="item clearfix" id="inc-${obj.id}">
                <div class="item__description">${obj.description}</div>
                    <div class="right clearfix">
                    <div class="item__value">${formatNumber(
                      obj.value,
                      type
                    )}</div>
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
    deleteListItem: (selectorId) => {
      document.getElementById(selectorId).remove();
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
      var type;
      obj.budget > 0 ? (type = "inc") : (type = "exp");

      document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(
        obj.budget,
        type
      );
      document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(
        obj.totalInc,
        "inc"
      );
      document.querySelector(
        DOMstrings.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");

      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent =
          obj.percentage;
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: (percentages) => {
      const fields = document.querySelectorAll(
        DOMstrings.expensePercentageLabel
      );

      nodeListForEach(fields, (current, index) => {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayMonth: () => {
      var now;

      now = new Date();

      document.querySelector(
        DOMstrings.dateLabel
      ).textContent = now.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
      });
    },

    changedType: () => {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      );
      nodeListForEach(fields, (current, index) => {
        current.classList.toggle("red-focus");
      });
      document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
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

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UICtrl.changedType);
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

  const updatePercentages = () => {
    //Calculate percentages
    budgetCtrl.calculatePercentages();
    //Read percentage from the budget controller
    const percentages = budgetCtrl.getPercentages();
    //Update UI with the new percentages
    UICtrl.displayPercentages(percentages);
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

      //Calculate and update percentages
      updatePercentages();
    }
  };

  const ctrlDeleteItem = (e) => {
    const itemID = e.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      const [type, ID] = itemID.split("-");
      const id = parseInt(ID);
      //Delete the item from data structure
      budgetCtrl.deleteItem(type, id);
      //Delete the item from UI
      UICtrl.deleteListItem(itemID);
      //Update and show the new budget after deletion
      updateBudget();
      //Calculate and update percentages
      updatePercentages();
    }
  };

  return {
    init: () => {
      UICtrl.displayMonth();
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

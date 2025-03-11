let inventory = JSON.parse(localStorage.getItem("inventory")) || {}; // Carrega o estoque do localStorage
let history = JSON.parse(localStorage.getItem("history")) || [];  // Carrega o histórico do localStorage
let sharedData = JSON.parse(localStorage.getItem("sharedData")) || []; // Carrega os dados compartilhados
let alertMessage = document.getElementById("alertMessage");

function addItem() {
    const code = document.getElementById("productCode").value;
    const name = document.getElementById("itemName").value;
    const quantity = parseInt(document.getElementById("itemQuantity").value);
    const minQuantity = parseInt(document.getElementById("minQuantity").value);
    const maxQuantity = parseInt(document.getElementById("maxQuantity").value);
    const responsible = document.getElementById("responsiblePerson").value;

    // Verifica se todos os campos estão preenchidos
    if (!code || !name || !quantity || !minQuantity || !maxQuantity || !responsible) {
        showAlert("Todos os campos são obrigatórios.", true);
        return;
    }

    // Verifica se a quantidade está correta
    if (quantity <= 0 || minQuantity < 0 || maxQuantity <= 0 || minQuantity > maxQuantity) {
        showAlert("As quantidades devem ser válidas.", true);
        return;
    }

    // Adicionando ou atualizando o item no estoque
    if (inventory[code]) {
        inventory[code].quantity += quantity; // Adiciona à quantidade existente
    } else {
        inventory[code] = { name, quantity, minQuantity, maxQuantity }; // Novo item
    }

    // Adiciona ao histórico
    addHistory(name, "Entrada", quantity, responsible);

    // Salva os dados no localStorage
    saveData();
    updateTable();
    clearInputFields();
    showAlert("Produto cadastrado com sucesso!", false);
}

function addHistory(name, type, quantity, responsible) {
    const date = new Date().toLocaleString();
    history.push({ name, type, quantity, responsible, date });
    saveData();
    updateHistoryTable();
}

function saveData() {
    localStorage.setItem("inventory", JSON.stringify(inventory));
    localStorage.setItem("history", JSON.stringify(history));
    localStorage.setItem("sharedData", JSON.stringify(sharedData));
}

function updateTable() {
    const tableBody = document.getElementById("inventoryBody");
    tableBody.innerHTML = "";
    Object.keys(inventory).forEach(code => {
        const row = document.createElement("tr");
        row.innerHTML = `  
            <td>${code}</td>
            <td>${inventory[code].name}</td>
            <td>${inventory[code].quantity}</td>
            <td>${inventory[code].minQuantity}</td>
            <td>${inventory[code].maxQuantity}</td>
            <td>
                <button class="btn-entry" onclick="updateStock('${code}', 'entrada')">Entrada</button>
                <button class="btn-exit" onclick="updateStock('${code}', 'saida')">Saída</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateStock(code, type) {
    const quantity = prompt(`Informe a quantidade de ${type === "entrada" ? "entrada" : "saída"}:`);
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        showAlert("Quantidade inválida.", true);
        return;
    }

    if (type === "entrada") {
        inventory[code].quantity += parsedQuantity;
        addHistory(inventory[code].name, "Entrada", parsedQuantity, "Admin");
    } else if (type === "saida") {
        if (inventory[code].quantity < parsedQuantity) {
            showAlert("Estoque insuficiente para a saída.", true);
            return;
        }
        inventory[code].quantity -= parsedQuantity;
        addHistory(inventory[code].name, "Saída", parsedQuantity, "Admin");
    }

    saveData();
    updateTable();
}

function filterStock() {
    const filter = document.getElementById("filterProduct").value.toLowerCase();
    const filteredInventory = Object.keys(inventory).filter(code => inventory[code].name.toLowerCase().includes(filter));
    updateFilteredTable(filteredInventory);
}

function updateFilteredTable(filteredInventory) {
    const tableBody = document.getElementById("inventoryBody");
    tableBody.innerHTML = "";
    filteredInventory.forEach(code => {
        const row = document.createElement("tr");
        row.innerHTML = `  
            <td>${code}</td>
            <td>${inventory[code].name}</td>
            <td>${inventory[code].quantity}</td>
            <td>${inventory[code].minQuantity}</td>
            <td>${inventory[code].maxQuantity}</td>
            <td>
                <button class="btn-entry" onclick="updateStock('${code}', 'entrada')">Entrada</button>
                <button class="btn-exit" onclick="updateStock('${code}', 'saida')">Saída</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function updateHistoryTable() {
    const historyTableBody = document.getElementById("historyBody");
    historyTableBody.innerHTML = "";
    history.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `  
            <td>${item.name}</td>
            <td>${item.type}</td>
            <td>${item.quantity}</td>
            <td>${item.responsible}</td>
            <td>${item.date}</td>
        `;
        historyTableBody.appendChild(row);
    });
}

function showAlert(message, isError) {
    alertMessage.style.display = "block";
    alertMessage.className = isError ? "alert error" : "alert success";
    alertMessage.textContent = message;
    setTimeout(() => alertMessage.style.display = "none", 5000);
}

function showTab(tabName) {
    const tabs = ['estoque', 'historico', 'compartilhado'];
    tabs.forEach(tab => {
        const element = document.getElementById(tab);
        element.style.display = tab === tabName ? 'block' : 'none';
        const button = document.getElementById(tab + "Tab");
        button.classList.toggle("active", tab === tabName);
    });
}

function clearInputFields() {
    document.getElementById("productCode").value = "";
    document.getElementById("itemName").value = "";
    document.getElementById("itemQuantity").value = "";
    document.getElementById("minQuantity").value = "";
    document.getElementById("maxQuantity").value = "";
    document.getElementById("responsiblePerson").value = "";
}

function generateReport() {
    let report = "Código, Nome, Quantidade, Quantidade Mínima, Quantidade Máxima\n";
    Object.keys(inventory).forEach(code => {
        report += `${code}, ${inventory[code].name}, ${inventory[code].quantity}, ${inventory[code].minQuantity}, ${inventory[code].maxQuantity}\n`;
    });

    const blob = new Blob([report], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "estoque.csv";
    link.click();
}

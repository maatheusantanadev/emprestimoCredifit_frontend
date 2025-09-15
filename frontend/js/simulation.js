function formatCurrency(value) {
    return Number(value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

async function carregarSimulacao() {
    try {
        // 1️⃣ Buscar funcionário
        const employeeId = "c0cf2126-38b2-4204-9328-829eea5cfbec";
        const responseUser = await fetch(`http://localhost:3000/employees/${employeeId}`);
        if (!responseUser.ok) throw new Error("Erro ao buscar usuário");
        const user = await responseUser.json();

        const salario = user.salary;
        const margem = salario * 0.35;

        // Nome do funcionário
        document.getElementById("userName").textContent = user.full_name;

        // Pega valor salvo ou usa margem
        let selectedAmount = Number(localStorage.getItem("selectedLoanAmount")) || margem;
        if (selectedAmount > margem) selectedAmount = margem;

        const loanAmountDiv = document.getElementById("loanAmount");
        loanAmountDiv.textContent = formatCurrency(selectedAmount);

        // Lista de parcelas possíveis
        const parcelas = [1, 2, 3, 4];
        const grid = document.getElementById("installmentsGrid");
        grid.innerHTML = ""; // limpa antes

        // Botão "Seguinte"
        const nextButton = document.querySelector(".btn-disabled");

        parcelas.forEach(qtd => {
            const div = document.createElement("div");
            div.className = "installment-option";

            const text = document.createElement("div");
            text.className = "installment-text";
            text.textContent = `${qtd}x de`;

            const amount = document.createElement("div");
            amount.className = "installment-amount";
            amount.textContent = formatCurrency(selectedAmount / qtd);

            div.appendChild(text);
            div.appendChild(amount);

            // Clique na parcela
            div.addEventListener("click", () => {
                // Remove seleção anterior
                document.querySelectorAll(".installment-option")
                    .forEach(el => el.classList.remove("selected"));

                // Marca selecionada
                div.classList.add("selected");

                // Ativa botão
                nextButton.classList.remove("btn-disabled");
                nextButton.classList.add("btn-outline");

                // Salva dados no localStorage
                localStorage.setItem("selectedInstallments", qtd);
                localStorage.setItem("installmentValue", (selectedAmount / qtd).toFixed(2));
                localStorage.setItem("selectedLoanAmount", selectedAmount);
            });

            grid.appendChild(div);
        });

    } catch (error) {
        console.error("Erro:", error);
        document.getElementById("userName").textContent = "Erro ao carregar";
        document.getElementById("loanAmount").textContent = "Erro";
    }
}

window.onload = carregarSimulacao;

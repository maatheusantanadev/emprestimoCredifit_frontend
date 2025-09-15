const employeeId = "c0cf2126-38b2-4204-9328-829eea5cfbec";

// Função para formatar em moeda BRL
function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        minimumFractionDigits: 2
    }).format(value);
}

async function carregarUsuarioEEmpresa() {
    try {
        // 1. Buscar funcionário
        const responseUser = await fetch(`http://localhost:3000/employees/${employeeId}`);
        if (!responseUser.ok) throw new Error("Erro ao buscar usuário");

        const user = await responseUser.json();

        // Atualiza nome e salário
        const salario = user.salary;
        const margem = salario * 0.35;

        document.getElementById("userName").textContent = user.full_name;
        document.getElementById("salario").textContent = formatCurrency(salario);
        document.getElementById("margem").textContent = formatCurrency(margem);
        document.getElementById("funcionario").textContent = user.full_name;

        // Configurar slider
        const slider = document.getElementById("amountSlider");
        const amountValue = document.getElementById("amountValue");

        // Atualiza valor do slider

        slider.max = margem;
        slider.value = margem; 
        amountValue.textContent = formatCurrency(margem);

        slider.addEventListener("input", function () {
            amountValue.textContent = formatCurrency(this.value);
        });

        const nextButton = document.querySelector(".button-filled");
        nextButton.addEventListener("click", () => {
            localStorage.setItem("selectedLoanAmount", slider.value);
            // Opcional: navegar para a página de simulação
            // window.location.href = "simulation.html";
        });

        // 2. Buscar empresa pelo company_id
        const responseCompany = await fetch(`http://localhost:3000/companies/${user.company_id}`);
        if (!responseCompany.ok) throw new Error("Erro ao buscar empresa");

        const companie = await responseCompany.json();

        document.getElementById("empresa").textContent = companie.corporate_name;

    } catch (error) {
        console.error("Erro:", error);
        document.getElementById("userName").textContent = "Erro ao carregar";
        document.getElementById("empresa").textContent = "Erro ao carregar";
    }

     slider.addEventListener("input", function () {
            amountValue.textContent = formatCurrency(this.value);
        });

    

}



// Executar quando a página carregar
window.onload = carregarUsuarioEEmpresa;

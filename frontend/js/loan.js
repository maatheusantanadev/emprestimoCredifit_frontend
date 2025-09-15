function formatCurrency(value) {
    return Number(value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

async function carregarResumo() {
    const employeeId = localStorage.getItem("employeeId") || "c0cf2126-38b2-4204-9328-829eea5cfbec";
    const selectedAmount = Number(localStorage.getItem("selectedLoanAmount")) || 0;
    const installments = Number(localStorage.getItem("selectedInstallments")) || 0;
    const installmentValue = Number(localStorage.getItem("installmentValue")) || 0;

    try {
        const responseUser = await fetch(`http://localhost:3000/employees/${employeeId}`);
        const user = await responseUser.json();

        document.getElementById("valorCreditar").textContent = formatCurrency(selectedAmount);
        document.getElementById("valorFinanciar").textContent = formatCurrency(selectedAmount);
        document.getElementById("parcelamento").textContent =
            installments > 0 ? `${installments}x de ${formatCurrency(installmentValue)}` : "--";

        const userName = user.full_name;
        if (userName) {
            document.getElementById("userName").textContent = userName;
            localStorage.setItem("userName", userName);
        }

        // Salva employeeId localmente se necessário
        localStorage.setItem("employeeId", employeeId);

    } catch (err) {
        console.error("Erro ao carregar usuário:", err);
    }
}

async function solicitarEmprestimo() {
    const employeeId = localStorage.getItem("employeeId");
    const selectedAmount = Number(localStorage.getItem("selectedLoanAmount")) || 0;
    const installments = Number(localStorage.getItem("selectedInstallments")) || 0;
    const userSalary = Number(localStorage.getItem("userSalary")) || 0;

    try {
        // Consulta ao mock da análise de crédito
        const response = await fetch("https://mocki.io/v1/b184142c-3c13-45e0-9cb3-0e5b900f9f7a");
        const data = await response.json();

        let statusEmprestimo = "rejeitado";

        // Regras de aprovação por faixa salarial
        if (
            (userSalary <= 2000 && data.score >= 400) ||
            (userSalary <= 4000 && data.score >= 500) ||
            (userSalary <= 8000 && data.score >= 600) ||
            (userSalary <= 12000 && data.score >= 700)
        ) {
            statusEmprestimo = "aprovado";
        }

        const emprestimo = {
            employee_id: employeeId,
            amount: selectedAmount,
            installments,
            status: statusEmprestimo,
            score: data.score
        };

        const responseBackend = await fetch("http://localhost:3000/loans", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(emprestimo)
        });

        if (!responseBackend.ok) throw new Error("Erro ao salvar empréstimo");

        const emprestimoSalvo = await responseBackend.json();
        console.log("Empréstimo salvo no banco:", emprestimoSalvo);

        // Redireciona para a página de status
        window.location.href = "/frontend/status.html";

    } catch (error) {
        console.error("Erro ao solicitar empréstimo:", error);
        alert("Não foi possível processar a solicitação de empréstimo.");
    }
}

window.onload = carregarResumo;

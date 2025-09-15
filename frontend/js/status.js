function formatCurrency(value) {
    return Number(value).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function toggleCard(id) {
    const el = document.getElementById(id);
    el.classList.toggle("hidden");
}

async function carregarResumo() {
    const employeeId = "c0cf2126-38b2-4204-9328-829eea5cfbec";
    
    try {
        const responseUser = await fetch(`http://localhost:3000/employees/${employeeId}`);
        const user = await responseUser.json();
        const userName = user.full_name || "Usuário";
        document.getElementById("userName").textContent = userName;

        const selectedAmount = Number(localStorage.getItem("selectedLoanAmount")) || 0;
        const installments = Number(localStorage.getItem("selectedInstallments")) || 0;
        const installmentValue = Number(localStorage.getItem("installmentValue")) || 0;

        document.getElementById("valorCreditar").textContent = formatCurrency(selectedAmount);
        document.getElementById("valorFinanciar").textContent = formatCurrency(selectedAmount);
        document.getElementById("parcelamento").textContent =
            installments > 0 ? `${installments}x de ${formatCurrency(installmentValue)}` : "--";

    } catch (err) {
        console.error("Erro ao carregar usuário:", err);
    }
}

async function carregarParcelas() {
    const employeeId = "c0cf2126-38b2-4204-9328-829eea5cfbec";
    const cardsArea = document.getElementById("cardsArea");

    try {
        // Busca empréstimos do funcionário no backend
        const response = await fetch(`http://localhost:3000/loans?employeeId=${employeeId}`);
        if (!response.ok) throw new Error("Erro ao buscar empréstimos");
        const emprestimos = await response.json();

        if (!emprestimos || emprestimos.length === 0) {
            cardsArea.innerHTML = `
                <div class="p-4 text-center text-gray-600 border border-gray-300 rounded-lg">
                    Não há nenhuma solicitação em andamento.
                </div>
            `;
            return;
        }

        // Pega o último empréstimo (mais recente)
        const emprestimo = emprestimos[emprestimos.length - 1];
        const dataPedido = new Date(emprestimo.created_at);
        const parcelas = [];
        for (let i = 1; i <= emprestimo.installments; i++) {
            const vencimento = new Date(dataPedido);
            vencimento.setMonth(dataPedido.getMonth() + i);
            parcelas.push({
                numero: i,
                valor: Number(emprestimo.amount / emprestimo.installments).toFixed(2),
                vencimento: vencimento.toLocaleDateString("pt-BR")
            });
        }

        if (emprestimo.status === "aprovado") {
            cardsArea.innerHTML = `
                <div class="border border-gray-200 rounded-lg mt-4">
                    <div class="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                         onclick="toggleCard('emprestimoCorrente')">
                        <div class="flex items-center gap-3">
                            <div class="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center">
                                <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                            </div>
                            <span class="font-medium">EMPRÉSTIMO CORRENTE</span>
                        </div>
                        <span class="text-gray-400">▼</span>
                    </div>
                    <div id="emprestimoCorrente" class="hidden border-t p-4 space-y-4">
                        <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                            ✓ Crédito aprovado
                        </div>
                        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                            <div class="flex justify-between text-sm text-gray-600">
                                <span>Empresa</span>
                                <span>Próximo Vencimento</span>
                            </div>
                            <div class="flex justify-between font-medium">
                                <span>Seguros Seguradora</span>
                                <span>${parcelas[0]?.vencimento || "--"}</span>
                            </div>
                            <div class="flex justify-between text-sm text-gray-600">
                                <span>Total Financiado</span>
                                <span>Valor da parcela</span>
                            </div>
                            <div class="flex justify-between font-medium">
                                <span>${formatCurrency(emprestimo.amount)}</span>
                                <span>${formatCurrency(emprestimo.amount / emprestimo.installments)}</span>
                            </div>
                            <div class="flex flex-col space-y-1 mt-3">
                                <span class="font-medium text-gray-600">Parcelas:</span>
                                <div id="parcelasListaCorrente">
                                    ${parcelas.map(p => `
                                        <div class="p-2 border rounded mb-2 hover:bg-gray-100 cursor-pointer">
                                            Parcela ${p.numero}: R$ ${p.valor} - Vencimento: ${p.vencimento}
                                        </div>
                                    `).join("")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else {
            cardsArea.innerHTML = `
                <div class="border border-gray-200 rounded-lg mt-4">
                    <div class="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                         onclick="toggleCard('solicitacaoEmprestimo')">
                        <div class="flex items-center gap-3">
                            <div class="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center">
                                <div class="w-2 h-2 bg-gray-400 rounded-full"></div>
                            </div>
                            <span class="font-medium">SOLICITAÇÕES DE EMPRÉSTIMO</span>
                        </div>
                        <span class="text-gray-400">▼</span>
                    </div>
                    <div id="solicitacaoEmprestimo" class="hidden border-t p-4 space-y-4">
                        <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2">
                            ❌ Reprovado por Score
                        </div>
                        <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                            <div class="flex justify-between text-sm text-gray-600">
                                <span>Empresa</span>
                                <span>Próximo Vencimento</span>
                            </div>
                            <div class="flex justify-between font-medium">
                                <span>Seguros Seguradora</span>
                                <span>${parcelas[0]?.vencimento || "--"}</span>
                            </div>
                            <div class="flex justify-between text-sm text-gray-600">
                                <span>Total Financiado</span>
                                <span>Valor da parcela</span>
                            </div>
                            <div class="flex justify-between font-medium">
                                <span>${formatCurrency(emprestimo.amount)}</span>
                                <span>${formatCurrency(emprestimo.amount / emprestimo.installments)}</span>
                            </div>
                            <div class="flex flex-col space-y-1 mt-3">
                                <span class="font-medium text-gray-600">Parcelas:</span>
                                <div id="parcelasListaCorrente">
                                    ${parcelas.map(p => `
                                        <div class="p-2 border rounded mb-2 hover:bg-gray-100 cursor-pointer">
                                            Parcela ${p.numero}: R$ ${p.valor} - Vencimento: ${p.vencimento}
                                        </div>
                                    `).join("")}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

    } catch (error) {
        console.error("Erro ao carregar empréstimos:", error);
        cardsArea.innerHTML = `
            <div class="p-4 text-center text-red-600 border border-red-300 rounded-lg">
                Não foi possível carregar as solicitações.
            </div>
        `;
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await carregarResumo();
    await carregarParcelas();
});

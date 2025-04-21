// =============================================
// BANCO DIGITAL - CÓDIGO JS COMPLETO
// =============================================

// 1. INICIALIZAÇÃO DO SISTEMA
// =============================================

// Função segura para obter dados do localStorage
function safeLoad(key) {
    try {
        return JSON.parse(localStorage.getItem(key));
    } catch (e) {
        console.error(`Erro ao carregar ${key}:`, e);
        return null;
    }
}

// Função segura para salvar dados no localStorage
function safeSave(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch (e) {
        console.error(`Erro ao salvar ${key}:`, e);
        showNotification('Erro ao salvar dados', 'error');
        return false;
    }
}

// Função para obter a lista de usuários
function getUsers() {
    const users = safeLoad('users');
    return Array.isArray(users) ? users : [];
}

// Mostra notificação na tela
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <p>${message}</p>
        <small>${new Date().toLocaleTimeString()}</small>
    `;
    document.getElementById('notificationsContainer').appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// Inicializa os dados do sistema
function initializeSystem() {
    // Garante que o container de login está visível
    document.getElementById('container').style.display = 'block';
    document.getElementById('dashboard').classList.add('hidden');
    
    // Inicializa dados se necessário
    if (!localStorage.getItem('users')) {
        const demoUser = {
            name: "Usuário Demo",
            email: "demo@banco.com",
            password: "123456",
            balance: 1000,
            transactions: []
        };
        safeSave('users', [demoUser]);
    }
    
    // Verifica autenticação
    const loggedInUser = safeLoad('loggedInUser');
    if (loggedInUser) {
        showDashboard(loggedInUser);
    }
}

// Mostra tela de login
function showLoginScreen() {
    document.getElementById('container').style.display = 'block';
    document.getElementById('dashboard').classList.add('hidden');
    document.querySelector('.container').classList.remove('active');
}

// 2. SISTEMA DE AUTENTICAÇÃO
// =============================================

// Login
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const users = getUsers();
    const user = users.find(user => user.email === email && user.password === password);

    if (user) {
        safeSave('loggedInUser', user);
        showDashboard(user);
        showNotification('Login realizado com sucesso!', 'success');
    } else {
        showNotification('E-mail ou senha incorretos!', 'error');
    }
});

// Cadastro
document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;

    const users = getUsers();
    
    if (users.some(user => user.email === email)) {
        showNotification('E-mail já cadastrado!', 'error');
        return;
    }

    const newUser = {
        name,
        email,
        password,
        balance: 0,
        transactions: []
    };

    users.push(newUser);
    safeSave('users', users);
    showNotification('Cadastro realizado com sucesso!', 'success');
    e.target.reset();
    document.querySelector('.container').classList.remove('active');
});

// Logout
document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('loggedInUser');
    showLoginScreen();
    showNotification('Você saiu da sua conta', 'info');
});

// 3. DASHBOARD E OPERAÇÕES
// =============================================

// Mostra o dashboard
function showDashboard(user) {
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userBalance').textContent = user.balance.toFixed(2);
    document.getElementById('accountNumber').textContent = 
        Math.floor(1000 + Math.random() * 9000) + '-' + 
        Math.floor(1000 + Math.random() * 9000);
    
    document.getElementById('container').style.display = 'none';
    document.getElementById('dashboard').classList.remove('hidden');
    
    updateStatement(user);
}

// Atualiza o dashboard
function updateDashboard(user) {
    document.getElementById('userBalance').textContent = user.balance.toFixed(2);
    updateStatement(user);
}

// Atualiza o extrato
function updateStatement(user) {
    const statementList = document.getElementById('statementList');
    statementList.innerHTML = '';
    
    user.transactions?.forEach(transaction => {
        const item = document.createElement('div');
        item.className = `transaction-item ${transaction.type}`;
        
        let html = `
            <div class="transaction-info">
                <strong>${transaction.type.toUpperCase()}</strong>
                <small>${transaction.date}</small>
        `;
        
        if (transaction.to) {
            html += `<small>Para: ${transaction.to}</small>`;
        } else if (transaction.from) {
            html += `<small>De: ${transaction.from}</small>`;
        }
        
        html += `</div><div class="transaction-amount">`;
        
        if (transaction.type === 'deposit') {
            html += `+R$${transaction.amount.toFixed(2)}`;
        } else {
            html += `-R$${transaction.amount.toFixed(2)}`;
        }
        
        html += `</div>`;
        item.innerHTML = html;
        statementList.appendChild(item);
    });
}

// 4. OPERAÇÕES BANCÁRIAS
// =============================================

// Depósito
document.getElementById('depositForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('depositAmount').value);
    const user = safeLoad('loggedInUser');
    
    user.balance += amount;
    user.transactions.unshift({
        type: 'deposit',
        amount,
        date: new Date().toLocaleString()
    });
    
    safeSave('loggedInUser', user);
    updateDashboard(user);
    showNotification(`Depósito de R$${amount.toFixed(2)} realizado!`, 'success');
    e.target.reset();
});

// Saque
document.getElementById('withdrawForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('withdrawAmount').value);
    const user = safeLoad('loggedInUser');
    
    if (amount > user.balance) {
        showNotification('Saldo insuficiente!', 'error');
        return;
    }
    
    user.balance -= amount;
    user.transactions.unshift({
        type: 'withdraw',
        amount,
        date: new Date().toLocaleString()
    });
    
    safeSave('loggedInUser', user);
    updateDashboard(user);
    showNotification(`Saque de R$${amount.toFixed(2)} realizado!`, 'success');
    e.target.reset();
});

// Transferência
document.getElementById('transferForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('transferEmail').value;
    const amount = parseFloat(document.getElementById('transferAmount').value);
    const users = getUsers();
    const sender = safeLoad('loggedInUser');
    const receiver = users.find(u => u.email === email);
    
    if (!receiver) {
        showNotification('Destinatário não encontrado!', 'error');
        return;
    }
    if (amount > sender.balance) {
        showNotification('Saldo insuficiente!', 'error');
        return;
    }
    
    // Atualiza saldos
    sender.balance -= amount;
    receiver.balance += amount;
    
    // Registra transações
    sender.transactions.unshift({
        type: 'transfer',
        amount,
        to: receiver.email,
        date: new Date().toLocaleString()
    });
    
    receiver.transactions.unshift({
        type: 'deposit',
        amount,
        from: sender.email,
        date: new Date().toLocaleString()
    });
    
    // Salva alterações
    safeSave('loggedInUser', sender);
    const receiverIndex = users.findIndex(u => u.email === email);
    users[receiverIndex] = receiver;
    safeSave('users', users);
    
    // Atualiza UI
    updateDashboard(sender);
    showNotification(`Transferência de R$${amount.toFixed(2)} realizada!`, 'success');
    e.target.reset();
});

// 5. INICIALIZAÇÃO E EVENT LISTENERS - MODIFICADO
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    initializeSystem();
    
    // Alternar entre login/cadastro
    document.getElementById('showRegister').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.container').classList.add('active');
    });
    
    document.getElementById('showLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('.container').classList.remove('active');
    });
    
    // Novo sistema de abas com controle do extrato
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = btn.dataset.tab;
            const user = safeLoad('loggedInUser');
            
            // Remove classe active de todos os botões
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            
            // Adiciona classe active ao botão clicado
            btn.classList.add('active');
            
            // Oculta todas as abas de operação
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Controle especial para o extrato
            if (tabName === 'statement') {
                document.getElementById('statement-tab').classList.remove('hidden');
                updateStatement(user);
            } else {
                document.getElementById('statement-tab').classList.add('hidden');
                // Mostra a aba de operação correspondente
                document.getElementById(`${tabName}-tab`).classList.add('active');
            }
        });
    });
});

// Modificação na função showDashboard para esconder o extrato inicialmente
function showDashboard(user) {
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userBalance').textContent = user.balance.toFixed(2);
    document.getElementById('accountNumber').textContent = 
        Math.floor(1000 + Math.random() * 9000) + '-' + 
        Math.floor(1000 + Math.random() * 9000);
    
    document.getElementById('container').style.display = 'none';
    document.getElementById('dashboard').classList.remove('hidden');
    
    // Esconde o extrato inicialmente e mostra a aba de depósito
    document.getElementById('statement-tab').classList.add('hidden');
    document.querySelector('.tab-btn[data-tab="deposit"]').click();
}

// Garante que o dashboard não é mostrado sem autenticação
window.addEventListener('load', () => {
    if (!safeLoad('loggedInUser')) {
        document.getElementById('dashboard').classList.add('hidden');
        document.getElementById('container').style.display = 'block';
    }
});

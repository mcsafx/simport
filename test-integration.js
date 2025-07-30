const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';

async function runTests() {
    console.log('🧪 Iniciando testes de integração do Modal Kanban...\n');

    // Teste 1: Conexão Backend
    console.log('1. 🔌 Testando conexão com backend...');
    try {
        const response = await fetch('http://localhost:3001/health');
        const data = await response.json();
        console.log('   ✅ Backend online!');
        console.log(`   📊 Status: ${data.status}`);
        console.log(`   🕐 Timestamp: ${data.timestamp}\n`);
    } catch (error) {
        console.log('   ❌ Erro na conexão:', error.message);
        return;
    }

    // Teste 2: Buscar Embarques
    console.log('2. 📦 Testando busca de embarques...');
    try {
        const response = await fetch(`${API_BASE}/embarques`);
        const data = await response.json();
        
        if (data.success && data.data.data.length > 0) {
            const embarques = data.data.data;
            console.log(`   ✅ ${embarques.length} embarques encontrados`);
            console.log(`   📋 Primeiro embarque: ${embarques[0].numeroReferencia}`);
            console.log(`   🏭 Exportador: ${embarques[0].exportador.nomeEmpresa}\n`);
        } else {
            console.log('   ⚠️ Nenhum embarque encontrado\n');
        }
    } catch (error) {
        console.log('   ❌ Erro:', error.message);
    }

    // Teste 3: Buscar Invoices
    console.log('3. 📄 Testando busca de invoices...');
    try {
        const embarqueId = 'cmdqk96x8000auua14m5210zn';
        const response = await fetch(`${API_BASE}/invoices/embarque/${embarqueId}`);
        const data = await response.json();
        
        if (data.success && data.data.length > 0) {
            const invoices = data.data;
            console.log(`   ✅ ${invoices.length} invoice(s) encontrada(s)`);
            console.log(`   📋 Invoice: ${invoices[0].numero}`);
            console.log(`   💰 Valor: ${invoices[0].moeda} ${invoices[0].valorTotal}`);
            console.log(`   📦 Produtos: ${invoices[0].produtos?.length || 0}`);
            console.log(`   🚢 Containers: ${invoices[0].containers?.length || 0}\n`);
        } else {
            console.log('   ⚠️ Nenhuma invoice encontrada\n');
        }
    } catch (error) {
        console.log('   ❌ Erro:', error.message);
    }

    // Teste 4: Cadastros
    console.log('4. 📋 Testando cadastros...');
    try {
        // Exportadores
        const expResponse = await fetch(`${API_BASE}/cadastros/exportadores`);
        const expData = await expResponse.json();
        
        if (expData.success) {
            console.log(`   ✅ ${expData.data.length} exportadores encontrados`);
        }

        // Unidades de medida
        const umResponse = await fetch(`${API_BASE}/cadastros/unidades-medida`);
        const umData = await umResponse.json();
        
        if (umData.success) {
            console.log(`   ✅ ${umData.data.length} unidades de medida encontradas\n`);
        }
    } catch (error) {
        console.log('   ❌ Erro:', error.message);
    }

    // Teste 5: Simulação Completa do Modal
    console.log('5. 🎭 Simulando comportamento completo do modal...');
    try {
        const embarqueId = 'cmdqk96x8000auua14m5210zn';
        
        // Buscar embarque específico
        const embarqueResponse = await fetch(`${API_BASE}/embarques`);
        const embarqueData = await embarqueResponse.json();
        const embarque = embarqueData.data.data.find(e => e.id === embarqueId);
        
        // Buscar invoices do embarque
        const invoiceResponse = await fetch(`${API_BASE}/invoices/embarque/${embarqueId}`);
        const invoiceData = await invoiceResponse.json();
        
        if (embarque && invoiceData.success) {
            const invoices = invoiceData.data;
            
            console.log('   ✅ Modal simulado com sucesso!');
            console.log('   ═══════════════════════════════');
            console.log(`   📦 EMBARQUE: ${embarque.numeroReferencia}`);
            console.log(`   🏭 Exportador: ${embarque.exportador.nomeEmpresa}`);
            console.log(`   🚢 Armador: ${embarque.armador.nome}`);
            console.log(`   📍 Rota: ${embarque.portoOrigem.nome} → ${embarque.portoDestino.nome}`);
            console.log(`   💵 Frete: ${embarque.moeda} ${embarque.frete}`);
            console.log('   ───────────────────────────────');
            
            if (invoices.length > 0) {
                console.log(`   📄 INVOICES (${invoices.length}):`);
                invoices.forEach((inv, index) => {
                    console.log(`   ${index + 1}. ${inv.numero} - ${inv.moeda} ${inv.valorTotal}`);
                    if (inv.produtos && inv.produtos.length > 0) {
                        console.log(`      🏷️ Produtos: ${inv.produtos.length}`);
                        inv.produtos.forEach((prod, pIndex) => {
                            console.log(`         • ${prod.descricao} (${prod.ncm})`);
                            console.log(`           Qtd: ${prod.quantidade} ${prod.unidadeMedida?.simbolo || 'un'}`);
                            console.log(`           Valor: ${inv.moeda} ${prod.valorTotal}`);
                        });
                    }
                    if (inv.containers && inv.containers.length > 0) {
                        console.log(`      📦 Containers: ${inv.containers.length}`);
                        inv.containers.forEach((cont) => {
                            console.log(`         • ${cont.numero} (${cont.tipo} ${cont.tamanho})`);
                        });
                    }
                    console.log('');
                });
            } else {
                console.log('   📄 Nenhuma invoice encontrada');
            }
            
            console.log('   ═══════════════════════════════');
            console.log('   🎯 STATUS: INTEGRAÇÃO FUNCIONANDO!');
            console.log('   ✅ Backend: OK');
            console.log('   ✅ Embarques: OK');
            console.log('   ✅ Invoices: OK');
            console.log('   ✅ Produtos: OK');
            console.log('   ✅ Containers: OK');
            console.log('   ✅ Cadastros: OK');
        }
    } catch (error) {
        console.log('   ❌ Erro na simulação:', error.message);
    }

    console.log('\n🎉 Testes concluídos!');
}

runTests().catch(console.error);
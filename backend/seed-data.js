const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedData() {
  try {
    console.log('🌱 Iniciando seed dos dados...')

    // Criar exportadores
    const exportador1 = await prisma.exportador.create({
      data: {
        nomeEmpresa: 'ChemCorp Industries',
        pais: 'China',
        codigoERP: 'EXP001'
      }
    })

    const exportador2 = await prisma.exportador.create({
      data: {
        nomeEmpresa: 'Global Supplies Ltd',
        pais: 'India',
        codigoERP: 'EXP002'
      }
    })

    console.log('✅ Exportadores criados')

    // Criar armadores
    const armador1 = await prisma.armador.create({
      data: {
        nome: 'Maersk Line',
        linkTracking: 'https://www.maersk.com/tracking'
      }
    })

    const armador2 = await prisma.armador.create({
      data: {
        nome: 'MSC',
        linkTracking: 'https://www.msc.com/track-a-shipment'
      }
    })

    console.log('✅ Armadores criados')

    // Criar portos
    const portoOrigem = await prisma.porto.create({
      data: {
        nome: 'Shanghai Port',
        codigo: 'CNSHA',
        pais: 'China',
        cidade: 'Shanghai'
      }
    })

    const portoDestino = await prisma.porto.create({
      data: {
        nome: 'Porto de Itajaí',
        codigo: 'BRITJ',
        pais: 'Brasil',
        cidade: 'Itajaí'
      }
    })

    console.log('✅ Portos criados')

    // Criar unidades de medida
    const unidadeKG = await prisma.tipoUnidadeMedidaCadastro.create({
      data: {
        codigo: 'KG',
        nome: 'Kilograma',
        simbolo: 'kg'
      }
    })

    const unidadeUN = await prisma.tipoUnidadeMedidaCadastro.create({
      data: {
        codigo: 'UN',
        nome: 'Unidade',
        simbolo: 'un'
      }
    })

    const unidadeL = await prisma.tipoUnidadeMedidaCadastro.create({
      data: {
        codigo: 'L',
        nome: 'Litro',
        simbolo: 'l'
      }
    })

    console.log('✅ Unidades de medida criadas')

    // Criar embarques de teste
    const embarque1 = await prisma.embarque.create({
      data: {
        numeroReferencia: 'BIO-2025-001',
        referenciaExterna: 'DESP-001-2025',
        tipoImportacao: 'CONTA_PROPRIA',
        unidade: 'CEARA',
        frete: 15000.00,
        moeda: 'USD',
        dataEmbarquePrevista: new Date('2025-02-15'),
        dataETAPrevista: new Date('2025-03-01'),
        status: 'EM_TRANSITO',
        observacoes: 'Embarque de produtos químicos',
        exportadorId: exportador1.id,
        armadorId: armador1.id,
        portoOrigemId: portoOrigem.id,
        portoDestinoId: portoDestino.id
      }
    })

    const embarque2 = await prisma.embarque.create({
      data: {
        numeroReferencia: 'BIO-2025-002',
        referenciaExterna: 'TRADE-002-2025',
        tipoImportacao: 'VIA_TRADE',
        unidade: 'SANTA_CATARINA',
        frete: 22000.00,
        moeda: 'USD',
        dataEmbarquePrevista: new Date('2025-02-20'),
        dataETAPrevista: new Date('2025-03-05'),
        status: 'CHEGADA_PORTO',
        observacoes: 'Embarque via trade',
        exportadorId: exportador2.id,
        armadorId: armador2.id,
        portoOrigemId: portoOrigem.id,
        portoDestinoId: portoDestino.id
      }
    })

    console.log('✅ Embarques criados')

    console.log('🎉 Seed concluído com sucesso!')
    console.log(`📦 Embarque 1 ID: ${embarque1.id}`)
    console.log(`📦 Embarque 2 ID: ${embarque2.id}`)

  } catch (error) {
    console.error('❌ Erro durante o seed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedData()
# Folha de pagamento e novo relatório tributário

## O que será alterado
- Incluir uma etapa de **Folha de pagamento**, com os 12 meses, total acumulado e média mensal, no mesmo padrão do faturamento.
- Ler automaticamente, no PDF **Resumo Mensal**, a competência e o valor **Base total** dentro da seção **INSS** de cada mês.
- Reconhecer o PDF **Comparativo de regimes tributários — Memória de Cálculo** como a nova fonte da análise tributária.
- Preencher, a partir desse relatório, os valores mensais e a composição anual dos quatro cenários: Simples Nacional atual, Simples Nacional Híbrido, Lucro Presumido e Lucro Real.
- Atualizar os textos da tela de importação e das fontes da simulação para refletir os dois novos relatórios.
- Incluir a folha no diagnóstico do cliente, junto ao resumo do faturamento, sem acrescentar quadros repetitivos.

## Detalhes técnicos
- O estudo passará a guardar um vetor mensal de folha, preservando dados antigos salvos.
- O leitor identificará cada competência no Resumo Mensal e capturará somente o primeiro “Base total” da seção INSS correspondente.
- No relatório de memória de cálculo, o total mensal será lido da coluna “Total DAS”, “Total Híbrido” ou “TOTAL MENSAL”, conforme o regime; os tributos serão somados por cenário para o comparativo anual.
- A importação continuará aceitando os relatórios anteriores, para não interromper estudos existentes.

## Validação
- Importar os dois PDFs anexados e conferir os seis meses de folha e os quatro regimes.
- Confirmar totais, persistência, visualização em tela ampla e celular e geração do diagnóstico.

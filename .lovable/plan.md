# Códigos de serviço e ISS manual

## Objetivo
Simplificar a leitura da planilha de notas para identificar somente os códigos de tributação nacional usados pela empresa e permitir o preenchimento manual da alíquota de ISS de cada código.

## Alterações
- Ler a planilha de notas e consolidar apenas códigos únicos, sem somar quantidade de notas, valores ou ISS estimado.
- Exibir no estudo somente código, descrição do serviço e campo manual de ISS (%).
- Atualizar o diagnóstico para apresentar a mesma relação simplificada.
- Preservar as alíquotas de ISS já preenchidas quando uma nova planilha for importada.
- Validar a leitura da planilha real e a apresentação em computador e celular.
- Publicar a versão validada para liberar o sistema para uso.

## Detalhes técnicos
- Manter compatibilidade com estudos salvos anteriormente, ignorando os antigos valores agregados na apresentação.
- Não alterar faturamento, folha, regimes, simulações ou demais cálculos do estudo.

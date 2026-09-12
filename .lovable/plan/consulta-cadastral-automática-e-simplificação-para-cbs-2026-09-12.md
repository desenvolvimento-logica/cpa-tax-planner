# Consulta cadastral automática e simplificação para CBS

## O que será alterado
- Extrair o CNPJ diretamente da declaração de faturamento importada.
- Consultar uma fonte pública baseada nos dados abertos da Receita Federal e preencher automaticamente razão social, nome fantasia, situação, natureza jurídica, capital, endereço, regime e CNAEs.
- Consultar a classificação oficial do IBGE para completar, em cada CNAE, a descrição, “compreende” e “não compreende”.
- Preencher o anexo do Simples quando houver regra segura cadastrada; quando depender do serviço efetivamente prestado ou do Fator R, apresentar essa ressalva em vez de atribuir um anexo incorreto.
- Manter somente CBS nas relações de clientes e fornecedores, removendo IBS dessas análises.
- Substituir os quadros do consolidado por regime por um resumo textual, sem repetir as informações detalhadas acima.
- Atualizar o diagnóstico final para mostrar apenas CBS na análise de clientes e fornecedores.

## Funcionamento e limites
- A consulta ocorrerá automaticamente durante a importação da declaração, sem exigir outro arquivo de CNPJ.
- A fonte cadastral é pública e pode ter a defasagem da atualização mensal da Receita Federal.
- Se a fonte estiver temporariamente indisponível, o faturamento continuará sendo importado e o sistema informará que o cadastro não pôde ser atualizado.

## Detalhes técnicos
- A consulta externa será feita pelo servidor do sistema, evitando bloqueios do navegador.
- Dados cadastrais serão obtidos pela BrasilAPI, que distribui dados públicos de CNPJ; notas de CNAE virão da API oficial do IBGE/CONCLA.
- A integração não armazenará quadro societário ou dados pessoais desnecessários.
- A validação incluirá importação real, preenchimento dos campos e conferência visual em tela ampla e móvel.

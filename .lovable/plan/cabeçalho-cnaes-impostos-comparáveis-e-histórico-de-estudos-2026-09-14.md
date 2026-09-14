# Cabeçalho, CNAEs, impostos comparáveis e histórico de estudos

## O que será alterado
- Atualizar o topo para informar que a análise considera os dados fiscais de 2026.
- Centralizar “Estudo do Simples Nacional Híbrido” em uma única linha nas telas em que houver espaço, preservando a leitura no celular.
- Ampliar o campo do anexo de cada CNAE e exibir textos completos, como “Anexo V — sujeito ao Fator R”.
- Ajustar automaticamente a altura de “Compreende” e “Não compreende”, sem cortes ou barras de rolagem.
- Detalhar o Simples Híbrido com os componentes do DAS (IRPJ, CSLL, INSS/CPP e ISS), além da CBS líquida.
- Padronizar a ordem dos tributos em todos os regimes no comparativo da tela e no diagnóstico, usando uma linha comum por imposto.
- Criar um histórico local de estudos, identificado por CNPJ e empresa, com opção de salvar, abrir e excluir estudos anteriores sem perder o estudo atual.

## Detalhes técnicos
- A composição tributária será normalizada na ordem: IRPJ, Adicional IRPJ, CSLL, INSS/CPP, ISS, PIS/Pasep, COFINS, CBS; impostos ausentes aparecerão sem valor.
- O leitor da Memória de Cálculo passará a extrair individualmente os componentes internos do DAS Híbrido, em vez de apresentar apenas o total agregado.
- O histórico será mantido no navegador deste dispositivo, aproveitando a persistência já existente e preservando estudos salvos em versões anteriores.
- Cada salvamento atualizará o estudo do mesmo CNPJ; estudos sem CNPJ receberão identificação própria.

## Validação
- Conferir o cabeçalho e os CNAEs em tela ampla e celular.
- Importar a Memória de Cálculo e validar a soma dos componentes do Simples Híbrido contra o total anual.
- Conferir a mesma ordem de impostos nos quatro regimes e no documento final.
- Salvar dois estudos, alternar entre eles, recarregar a página e confirmar que ambos continuam disponíveis.

# CrawlerJira

## Descrição
O CrawlerJira é um projeto desenvolvido em Node.js por Antônio Lucas, que tem como objetivo automatizar o processo de extração de dados do Jira. Com ele é possível baixar relatórios e informações de diversas integrações previamente configuradas e salvá-las em arquivos locais.

## Requisitos
Para utilizar o CrawlerJira é necessário ter instalado o [Selenium Webdriver para o Chrome](https://www.npmjs.com/package/selenium-webdriver) e o [Node.js](https://nodejs.org/en/) em sua máquina.

## Configuração
Para configurar o projeto, siga os passos abaixo:

1. Renomeie o arquivo `example_config.json` para `config.json` e preencha as informações de URL, usuário e senha do Jira.
2. Preencha no arquivo `config.json` as integrações que você deseja baixar, especificando:
   * "ENABLED": Se a integração está habilitada (true ou false)
   * "DESCRIPTION": Nome da integração
   * "PATH": Nome do arquivo final que a integração vai salvar
   * "JIRADATA": Arquivo que a integração vai baixar do relatório do Jira
   * "FILTERID": ID do filtro do JIRA que você deseja baixar
   * "STATUS": Array de status que o fluxo segue. Colocando -> na frente. ex: ->Pronto para Produção
3. Rode o comando `npm install`
4. Rode o comando `npm run start`

## Contribuição
Se você quiser contribuir com o projeto, sinta-se à vontade para abrir uma issue ou enviar um pull request.

## Licença
Este projeto é licenciado sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

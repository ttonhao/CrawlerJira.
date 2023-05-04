# CrawlerJira.

Projeto roda em nodejs.

1 - Baixar o webdrive: https://www.npmjs.com/package/selenium-webdriver
2 - Colocar no arquivo .bash_profile o caminho onde foi baixado o webdrive.
3 - Rodar o source .bash_profile e reiniciar o console.
4 - Renomear o example_config.json para config.json e preencher os campos com as URL, usuário e senha do Jira.
5 - Preencher no config as integrações que você quer puxar.
    Ex.:
            "ENABLED": Se ela esta habilitada (true ou False)
            "DESCRIPTION": Nome
            "PATH": Arquivo final que a Integração vai salvar.
            "JIRADATA": Arquivo que a integração vai baixar do relatorio do Jira.
            "FILTERID": ID do filtro do JIRA que você deseja baixar.
            "STATUS": Array de status que o fluxo segue. Colocando -> na frente. ex: ->Pronto para Producão
6 - Rodar npm install
7 - Rodar nom run start

import { Builder, By, until } from 'selenium-webdriver';
import ObjectsToCsv from 'objects-to-csv';
import neatCsv from 'neat-csv';
import fs from 'fs';
import Https from 'https';

(async function run() {
  let driver = await new Builder().forBrowser('chrome').build();
  let issues;
  let cookiesAll;
  const transitions = [];
  let env;

  fs.readFile('./config.json', async (err, data) => {
    env = JSON.parse(data);
    await Login();
    try {
      for (let index = 0; index < env.INTEGRATIONS.length; index++) {
        const integration = env.INTEGRATIONS[index];
        if (integration.ENABLED) {
          console.log(
            `Iniciando Coleta de ${integration.DESCRIPTION} - ${Date()}`
          );
          await downloadFile(
            `${env.URL}/sr/jira.issueviews:searchrequest-csv-current-fields/${integration.FILTERID}/SearchRequest-${integration.FILTERID}.csv?delimiter=,`,
            integration.JIRADATA
          );
          await getIssue(integration);
          console.log(
            `Iniciando Coleta de ${integration.DESCRIPTION}  - ${Date()}`
          );
        }
      }
    } finally {
      await driver.quit();
    }
    async function Login() {
      await driver.get(env.URL);
      await driver.wait(
        until.elementLocated(By.id('login-form-username')),
        1000
      );
      await driver.findElement(By.id('login-form-username')).sendKeys(env.USER);
      await driver
        .findElement(By.id('login-form-password'))
        .sendKeys(env.PASSWORD);
      await driver.findElement(By.id('login')).click();
      await driver.wait(until.elementLocated(By.id('browse_link')), 1000);

      await driver
        .manage()
        .getCookies()
        .then(function (cookies) {
          cookiesAll = cookies;
        });
    }
  });
  async function ConstructorStatus(issue, status) {
    // const statusStr =
    //   '[{US: ["->EM PROGRESSO","->PRODUCT BACKLOG","->SELECIONADO PARA GROOMING","->EM ANÁLISE","->ANÁLISE REALIZADA","->PRONTA PARA DESENVOLVIMENTO","->EM DESENVOLVIMENTO","->FINALIZADO","->DESENVOLVIDA","->EM DEPLOY PARA TESTE","->EM TESTE","->TESTADA","->EM DEPLOY PARA HOMOLOGAÇÃO","->EM HOMOLOGAÇÃO","->HOMOLOGADA","->EM DEPLOY PARA PRODUÇÃO","->CANCELADA","->EM PRODUÇÃO","->ATIVADA","->A FAZER","->DISPONÍVEL PARA RETESTE","->DISPONÍVEL PARA REVISÃO DE CÓDIGO","->EM REVISÃO DE CÓDIGO","->EM RETESTE","->DISPONÍVEL PARA REVISÃO","->DISPONIVEL PARA TESTE","->DISPONIVEL PARA HOMOLOGAÇÃO","->DEMONSTRADA","->EM CORREÇÃO","->CORRIGIDO","->RETESTE","->FECHADO","->POSTERGADO","->SOLUÇÃO TÉCNICA DEFINIDA","->NOVO","->REJEITADO","->REABERTO"]}]';
    // const status = JSON.parse(statusStr);
    for (let index = 0; index < status.length; index++) {
      const element = status[index];
      issue[element] = '';
    }
    return issue;
  }

  async function getIssue(type) {
    return await new Promise((resolve, reject) => {
      try {
        fs.readFile(type.JIRADATA, async (err, data) => {
          if (err) {
            console.error(err);
            return reject(err);
          }

          issues = await neatCsv(data);

          console.log(` Bucando movimentação de ${issues.length} Issues`);

          for (let index = 0; index < issues.length; index++) {
            const issue = await ConstructorStatus(issues[index], type.STATUS);
            console.log(`${index + 1} - ${issue['Issue key']}`);
            const url = `${env.URL}/browse/${issue['Issue key']}?page=com.googlecode.jira-suite-utilities:transitions-summary-tabpanel`;
            const locatedTransitionsTable = By.id('issue_actions_container');
            let label = '';
            let epicName = '';
            let origem = '';
            let destino = '';
            let dateTime = '';
            await driver.get(url);

            await driver.wait(until.elementLocated(locatedTransitionsTable));

            const labels = await driver.findElements(By.className('lozenge'));
            if (labels.length > 0) {
              for (let i = 0; i < labels.length; i++) {
                const textLabel = await labels[i].getText();
                if (label) label = `${label}|`;
                label = `${label}${textLabel}`;
              }

              issue.Labels = label;
            }

            const epicNames = await driver.findElements(
              By.className('type-gh-epic-link')
            );

            if (epicNames.length > 0) {
              epicName = await epicNames[0].getText();
            }
            issue.epicName = epicName;

            const transitionsTable = await driver.findElement(
              locatedTransitionsTable
            );

            const issuesDataBlock = await transitionsTable.findElements(
              By.className('issue-data-block')
            );

            for (let i = 0; i < issuesDataBlock.length; i++) {
              const issueDataBlock = issuesDataBlock[i];
              const actionContainer = await issueDataBlock.findElement(
                By.className('actionContainer')
              );
              const actionDetails = await actionContainer.findElement(
                By.className('action-details')
              );
              const spanDate = await actionContainer.findElement(
                By.className('date')
              );
              dateTime = await spanDate
                .findElement(By.className('livestamp'))
                .getAttribute('datetime');

              const changeHistory = await actionContainer.findElement(
                By.className('changehistory action-body')
              );
              const history = await changeHistory.findElements(By.css('span'));
              origem = await history[0].getText();
              destino = await history[1].getText();
              issue[`->${destino}`] = dateTime;

              if (type.STATUS.findIndex((x) => x == `->${destino}`) === -1) {
                type.STATUS.push(`->${destino}`);
              }
            }
          }
          const csv = new ObjectsToCsv(issues);
          // Save to file:
          await csv.toDisk(type.PATH);

          return resolve({});
        });
      } catch (error) {
        return reject(error);
      }
    });
  }

  async function downloadFile(url, targetFile) {
    return await new Promise((resolve, reject) => {
      const options = {
        headers: {
          Cookie: GetCookies(),
        },
      };

      Https.get(url, options, (response) => {
        const code = response.statusCode ?? 0;

        if (code >= 400) {
          return reject(new Error(response.statusMessage));
        }

        if (code > 300 && code < 400 && !!response.headers.location) {
          return resolve(downloadFile(response.headers.location, targetFile));
        }

        const fileWriter = fs.createWriteStream(targetFile).on('finish', () => {
          resolve({});
        });

        response.pipe(fileWriter);
      }).on('error', (error) => {
        reject(error);
      });

      function GetCookies() {
        let cookies = '';
        for (let index = 0; index < cookiesAll.length; index++) {
          const cookie = cookiesAll[index];
          cookies += `${cookie.name}=${cookie.value};`;
        }

        return cookies;
      }
    });
  }
})();

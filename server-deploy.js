console.log('server-deploy.js called')
const fs = require('fs');
const { execSync, exec, spawn } = require('child_process');
let profileArgument = '';
let templateFile = 'template.yaml';
let deployParametersFile;
let deployParameters = '';
let stackName;
let local;
let environment='dev';
let install = 'true';
let deployToCloudFormation = true;
process.argv.forEach(function (val, index, array) {
    if (val == '--profile') {
        profileArgument = '--profile ' + array[index + 1];
    } else if (val == '--deploy-parameters') {
        deployParametersFile = array[index + 1];
    } else if (val == '--stack-name') {
        stackName = array[index + 1];
    } else if (val == '--local') {
        local = array[index + 1];
    } else if (val == '--env' || val == '--environment') {
        environment = array[index + 1];
    } else if (val == '--install') {
        install = array[index + 1];
    } else if (val == '-cf' || val == '--deployToCloudformation') {
        if (array[index + 1].toLowerCase() !== 'true') {
            deployToCloudFormation = false;
        }
    }
});
if (!deployParametersFile && environment) {
    if (environment === 'local' || local) {
        deployParametersFile = 'deploy-parameters-local.json';
    } else if (environment === 'prod') {
        deployParametersFile = 'deploy-parameters-prod.json';
    } else if (environment === 'dev') {
        deployParametersFile = 'deploy-parameters-dev.json';
    }
}

if (install != 'false') {
    const lambdas = fs.readdirSync('back')
    lambdas.forEach((lambda) => {
      if (fs.lstatSync(`back/${lambda}`).isDirectory()) {
        const contents = fs.readdirSync(`back/${lambda}`)
        console.log('contents', contents)
        if (contents.includes('package.json')) {
          execSync(`npm i --prefix back/${lambda}`, { stdio: 'inherit' })
        }
      }
    })
    console.log('lambdas', lambdas)
    lambdas.forEach((lambda) => {
      if (fs.lstatSync(`back/${lambda}`).isDirectory()) {
        const contents = fs.readdirSync(`back/${lambda}`)
        console.log('contents', contents)
        if (contents.includes('nodejs')) {
          execSync(`npm i --prefix back/${lambda}/nodejs`, { stdio: 'inherit' })
        }
      }
    })
}
if (!stackName && environment) {
    stackName =  `lupi-${environment}`;
}
if (deployParametersFile) {
    let _json = JSON.parse(fs.readFileSync(deployParametersFile))
    let _secrets = { Parameters: {} }
    try {
        _secrets = JSON.parse(fs.readFileSync('deploy-parameters-secrets.json'));
    } catch (err) { }
    if (_json.Parameters) {
        _secrets = Object.assign({}, _secrets.Parameters, _json.Parameters);
    }
    deployParameters = Object.keys(_secrets).map(key => key + '=' + _secrets[key]).join(' ');
    deployParameters = `--parameter-overrides "DateTime=${new Date().getTime()} ${deployParameters}"`;
    if (environment === 'dev' || environment === 'prod') {
        //TODO fix this - CrockStack wants quotes, AWS doesn't. According to AWS documentation, CrockStack is right.
        deployParameters = `--parameter-overrides DateTime=${new Date().getTime()} ${deployParameters}`;
    }
    console.log("deployParameters", deployParameters)
} else {
    console.log("--deploy-parameters is a required argument");
    console.log("EXITING");
    process.exit();
}
if (local) {
    //killOldProccesses();
    /*startDb(function () {
        console.log("DB started, starting server...");
        startServer(deployParameters);
    });*/
    startServer(deployParameters);
} else {
    execSync('cd front; npm run build;rm -r ../back/static-deployer/build;cp -R build ../back/static-deployer/build');

    var packageCommand = `aws cloudformation package --template-file ${templateFile} --output-template-file packaged.yaml ${profileArgument} --s3-bucket wwdd-build-bucket-us-east-1`
    var deployCommand = `aws cloudformation deploy --template-file packaged.yaml --stack-name ${stackName}  ${profileArgument} --region us-east-1 --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND ${deployParameters}`
    execSync(packageCommand, { stdio: 'inherit' });
    console.log(packageCommand);
    if (deployToCloudFormation) {
        execSync(deployCommand, { stdio: 'inherit', stderr: 'inherit' });
        console.log(deployCommand);
    } else {
        console.log("Package complete, not deploying to CloudFormation");
    }
}

async function startServer(deployParameters) {
    var crockCommand = 'npx crockstack'
    if (deployParameters.indexOf('--parameter-overrides ') == 0) {
        deployParameters = deployParameters.replace('--parameter-overrides ', '');
    }
    execSync(crockCommand + ' --parameter-overrides ' + deployParameters + ' --env-vars config.json', { stdio: 'inherit' })
}
